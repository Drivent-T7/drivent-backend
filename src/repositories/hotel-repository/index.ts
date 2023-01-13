import { prisma } from "@/config";
import { cacheData, findCachedData } from "@/utils/cache";

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

async function cacheHotelsData<Type>({ key, value, id }: CacheHotelsDataParams<Type>) {
  if (id) {
    cacheData({ key: key + id.toString(), value });
    return;
  }

  cacheData({ key, value });
}

async function findCacheHotelsData<Type>({ key, id }: FindCacheHotelsDataParams<Type>) {
  if (id) {
    return findCachedData(key + id.toString());
  }

  return findCachedData(key);
}

export type CacheHotelsDataParams<Type> = {
  key: "hotels" | "roomsFromHotelId";
  value: Type;
  id?: number;
};

export type FindCacheHotelsDataParams<Type> = Omit<CacheHotelsDataParams<Type>, "value">;

const hotelRepository = {
  findHotels,
  findRoomsFromHotelId,
  findRoomById,
  cacheHotelsData,
  findCacheHotelsData,
};

export default hotelRepository;
