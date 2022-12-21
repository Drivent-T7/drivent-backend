import { prisma } from "@/config";
import { ActivityBooking } from "@prisma/client";

type BookActivityParams = Omit<ActivityBooking, "id">

async function bookActivity({ userId, activityId }: BookActivityParams) {
  return prisma.activityBooking.create({
    data: {
      userId,
      activityId
    }
  });
}

async function findActivityBookingByUserId(userId: number) {
  return prisma.activityBooking.findMany({
    where: { userId },
    select: {
      id: true,
      Activities: {
        select: {
          id: true,
          name: true,
          dateId: true,
          capacity: true,
          localId: true,
          startsAt: true,
          endsAt: true
        }
      }
    }
  });
}

const activityBookingRepository = {
  bookActivity,
  findActivityBookingByUserId
};

export default activityBookingRepository;
