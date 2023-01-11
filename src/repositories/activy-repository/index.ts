import { prisma } from "@/config";
import { cacheData, findCachedData } from "@/utils/cache";

async function findActivyDates() {
  const cachedData = await findCachedData("activitiesDates");

  if (cachedData.length > 0) {
    return cachedData;
  }

  const activitiesDates = await prisma.activityDate.findMany();

  cacheData({ key: "activitiesDates", value: activitiesDates });

  return activitiesDates;
}

async function findActivysByDateId(dateId: number) {
  const cachedData = await findCachedData(`activitiesFromDateId${dateId}`);

  if (cachedData.length > 0) {
    return cachedData;
  }

  const activities = await prisma.activityLocal.findMany({
    include: {
      Activities: {
        where: {
          dateId: dateId,
        },
        include: {
          ActivityBooking: true,
        },
      },
    },
  });

  cacheData({ key: `activitiesFromDateId${dateId}`, value: activities });

  return activities;
}

async function findAcitivityById(activityId: number) {
  const cachedData = await findCachedData(`activity${activityId}`);

  if (cachedData.length > 0) {
    return cachedData;
  }

  const activity = prisma.activities.findFirst({
    where: { id: activityId },
    include: { ActivityBooking: true },
  });

  cacheData({ key: `activity${activityId}`, value: activity });

  return activity;
}

const acitivyRepository = {
  findActivyDates,
  findActivysByDateId,
  findAcitivityById,
};

export default acitivyRepository;
