import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany({
    include: {
      Rooms: {
        select: {
          capacity: true,
          _count: {
            select: {
              Booking: true,
            },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });
}

async function findRoomsFromHotelId(id: number) {
  return prisma.hotel.findUnique({
    where: { id },
    include: {
      Rooms: {
        include: {
          _count: {
            select: {
              Booking: true,
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });
}

async function findRoomById(id: number) {
  return prisma.room.findUnique({ where: { id }, include: { Booking: true } });
}

const hotelRepository = {
  findHotels,
  findRoomsFromHotelId,
  findRoomById,
};

export default hotelRepository;
