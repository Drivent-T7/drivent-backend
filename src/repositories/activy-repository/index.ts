import { prisma } from "@/config";

async function findActivyDates() {
  return prisma.activityDate.findMany();
}

async function findActivysByDateId(dateId: number) {
  return prisma.activityLocal.findMany({
    include: {
      Activities: {
        where: {
          dateId: dateId,
        },
        include: {
          ActivityBooking: true
        }
      },
    },
  });
}

async function findAcitivityById(activityId: number) {
  return prisma.activities.findFirst({
    where: { id: activityId },
    include: { ActivityBooking: true }
  });
}

const acitivyRepository = {
  findActivyDates,
  findActivysByDateId,
  findAcitivityById
};

export default acitivyRepository;
