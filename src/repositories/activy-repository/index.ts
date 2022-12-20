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

const acitivyRepository = {
  findActivyDates,
  findActivysByDateId,
};

export default acitivyRepository;
