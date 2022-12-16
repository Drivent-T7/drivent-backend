import { prisma } from "@/config";
import { Booking } from "@prisma/client";

type CreateParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;
type UpdateParams = Omit<Booking, "createdAt" | "updatedAt">;

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

async function createBooking({ roomId, userId }: CreateParams) {
  return prisma.booking.create({ data: { userId, roomId } });
}

async function updateBooking({ roomId, id }: UpdateParams) {
  return prisma.booking.update({ where: { id }, data: { roomId } });
}

const bookingRepository = {
  findBookingByUserId,
  createBooking,
  updateBooking,
  findBookingById,
};

export default bookingRepository;
