import { unauthorizedError } from "@/errors";
import acitivyRepository from "@/repositories/activy-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";
import { paymentRequiredError } from "../hotels-service/errors";

async function getActivyDates(userId: number) {
  await validateUserTicketOrFail(userId);
  const activyDate = await acitivyRepository.findActivyDates();
  
  return activyDate;
}

async function getActivyByDate(dateId: number, userId: number) {
  await validateUserTicketOrFail(userId);
  const events = await acitivyRepository.findActivysByDateId(dateId);
    
  return events;
}

async function validateUserTicketOrFail(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.TicketType.isRemote) throw unauthorizedError();

  if (ticket.status !== TicketStatus.PAID) throw paymentRequiredError();
}

const activyService = {
  getActivyDates,
  getActivyByDate
};

export default activyService;
