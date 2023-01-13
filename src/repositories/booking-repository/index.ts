import { prisma } from "@/config";
import { Booking } from "@prisma/client";
import { cacheData, deleteCachedKey, findCachedData } from "@/utils/cache";

type CreateParams = Omit<Booking, "id" | "createdAt" | "updatedAt"> & { hotelId: number };
type UpdateParams = Omit<Booking, "createdAt" | "updatedAt"> & { fromHotelId: number; toHotelId: number };

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    select: {
      id: true,
      Room: {
        include: {
          Hotel: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              Booking: true,
            },
          },
        },
      },
    },
  });
}

async function findBookingById(id: number) {
  return prisma.booking.findFirst({
    where: { id },
    include: {
      Room: {
        include: {
          Hotel: true,
          Booking: true,
        },
      },
    },
  });
}

async function createBooking({ roomId, userId, hotelId }: CreateParams) {
  deleteCachedKey(["hotels", `roomsFromHotelId${hotelId}`]);
  return prisma.booking.create({ data: { userId, roomId } });
}

async function updateBooking({ roomId, id, fromHotelId, toHotelId, userId }: UpdateParams) {
  deleteCachedKey([
    "hotels",
    `roomsFromHotelId${fromHotelId}`,
    `roomsFromHotelId${toHotelId}`,
    `bookingFromUserId${userId}`,
  ]);

  return prisma.booking.update({ where: { id }, data: { roomId } });
}

async function cacheBooking<Type>({ userId, value }: CacheBookingParams<Type>) {
  cacheData({ key: `bookingFromUserId${userId}`, value });
}

async function findCachedBooking<Type>({ userId }: FindCachedBookingParams<Type>) {
  return findCachedData(`bookingFromUserId${userId}`);
}

export type CacheBookingParams<Type> = {
  userId: number;
  value: Type;
};

export type FindCachedBookingParams<Type> = Omit<CacheBookingParams<Type>, "value">;

const bookingRepository = {
  findBookingByUserId,
  createBooking,
  updateBooking,
  findBookingById,
  cacheBooking,
  findCachedBooking,
};

export default bookingRepository;
