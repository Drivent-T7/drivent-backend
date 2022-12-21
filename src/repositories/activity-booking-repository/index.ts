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

const activityBookingRepository = {
  bookActivity
};

export default activityBookingRepository;
