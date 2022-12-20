import faker from "@faker-js/faker";
import { prisma } from "@/config";
import dayjs from "dayjs";

export function createDateActivity() {
  return prisma.activityDate.create({
    data: {
      date: faker.date.future()
    },
  });
}

export function createLocalActivity() {
  return prisma.activityLocal.create({
    data: {
      name: faker.name.jobArea()
    },
  });
}

export function createActivity(dateId: number, localId: number, capacity?: number) {
  return prisma.activities.create({
    data: {
      name: faker.name.jobArea(),
      dateId,
      capacity: capacity || 10,
      localId,
      startsAt: dayjs().add(1, "days").hour(9).toDate(),
      endsAt: dayjs().add(1, "days").hour(10).toDate()
    }
  });
}

export function createActivityBooking(userId: number,
  activityId: number) {
  return prisma.activityBooking.create({
    data: {
      userId,
      activityId
    }
  });
}
