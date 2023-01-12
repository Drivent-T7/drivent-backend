import { cannotBookActivityError, notFoundError } from "@/errors";
import activityBookingRepository from "@/repositories/activity-booking-repository";
import acitivyRepository from "@/repositories/activy-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";
import { paymentRequiredError } from "../hotels-service/errors";

async function bookActivity({ userId, activityId }: BookActivityParams): Promise<BookActivityResult> {
  await validateUserEnrollmentAndTicketOrFail(userId);

  const activity = await acitivyRepository.findAcitivityById(activityId);

  if (!activity) throw notFoundError();

  if (activity.capacity <= activity.ActivityBooking.length) throw cannotBookActivityError();

  const activityBooking = await activityBookingRepository.bookActivity({ activityId, userId, dateId: activity.dateId });

  return { activityBookingId: activityBooking.id };
}

async function getActivityBooking(userId: number): Promise<ActivityBookingsResult> {
  const activityBookingResult = await activityBookingRepository.findActivityBookingByUserId(userId);

  if (!activityBookingResult) throw notFoundError();

  return activityBookingResult;
}

export type BookActivityParams = { userId: number; activityId: number };
export type BookActivityResult = { activityBookingId: number };
export type ActivityBookingsResult = {
  id: number;
  Activities: {
    id: number;
    name: string;
    dateId: number;
    capacity: number;
    localId: number;
    startsAt: Date;
    endsAt: Date;
  };
}[];

async function validateUserEnrollmentAndTicketOrFail(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw cannotBookActivityError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.TicketType.isRemote) {
    throw cannotBookActivityError();
  }

  if (ticket.status !== TicketStatus.PAID) {
    throw paymentRequiredError();
  }
}

const activityBookingService = {
  bookActivity,
  getActivityBooking,
};

export default activityBookingService;
