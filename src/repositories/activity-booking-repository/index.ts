import { prisma } from "@/config";
import { ActivityBooking } from "@prisma/client";
import { cacheData, deleteCachedKey, findCachedData } from "@/utils/cache";

async function bookActivity({ userId, activityId, dateId }: BookActivityParams) {
  const keys = [`activitiesFromDateId${dateId}`, `activity${activityId}`, `activityBookingByUserId${userId}`];
  deleteCachedKey(keys);

  return prisma.activityBooking.create({
    data: {
      userId,
      activityId,
    },
  });
}

async function findActivityBookingByUserId(userId: number) {
  const cachedData = await findCachedData(`activityBookingByUserId${userId}`);

  if (cachedData.length > 0) {
    return cachedData;
  }

  const activityBooking = prisma.activityBooking.findMany({
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
          endsAt: true,
        },
      },
    },
  });

  cacheData({ key: `activityBookingByUserId${userId}`, value: activityBooking });

  return activityBooking;
}

type BookActivityParams = Omit<ActivityBooking, "id"> & { dateId: number };

const activityBookingRepository = {
  bookActivity,
  findActivityBookingByUserId,
};

export default activityBookingRepository;
