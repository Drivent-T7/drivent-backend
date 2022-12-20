import faker from "@faker-js/faker";
import { prisma } from "@/config";
import dayjs from "dayjs";

export function createDateAcitivy() {
  return prisma.activityDate.create({
    data: {
      date: faker.date.future()
    },
  });
}

export function createLocalActivy() {
  return prisma.activityLocal.create({
    data: {
      name: faker.name.jobArea()
    },
  });
}

export function createActivie(dateId: number, localId: number) {
  return prisma.activities.create({
    data: {
      name: faker.name.jobArea(),
      dateId,
      capacity: 10,
      localId,
      startsAt: dayjs().add(1, "days").hour(9).toDate(),
      endsAt: dayjs().add(1, "days").hour(10).toDate()
    }
  });
}
