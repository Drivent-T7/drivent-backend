import faker from "@faker-js/faker";
import { prisma } from "@/config";

export function createHotelWithRooms() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.city(),
      Rooms: {
        createMany: {
          data: [
            {
              name: faker.datatype.number().toString(),
              capacity: 1,
            },
            {
              name: faker.datatype.number().toString(),
              capacity: 2,
            },
          ],
        },
      },
    },
    include: { Rooms: { orderBy: { id: "asc" } } },
  });
}

export function createHotelWithoutRooms() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.city(),
    },
  });
}
