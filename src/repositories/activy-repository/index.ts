import { prisma } from "@/config";

async function findActivyDates() {
  return prisma.eventDate.findMany();
}

async function findActivysByDateId(dateId: number) {
  return prisma.activityLocal.findMany({
    include: {
      Activity: {
        where: {
          dateId: dateId
        }
      },
    }
  });
}

const acitivyRepository = {
  findActivyDates,
  findActivysByDateId
};

export default acitivyRepository;