import { Hotel, Room, TicketStatus } from "@prisma/client";
import { notFoundError, unauthorizedError } from "@/errors";
import { paymentRequiredError } from "./errors";
import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number): Promise<GetHotelsResult[]> {
  await validateUserTicketOrFail(userId);
  const hotelsResult = await hotelRepository.findHotels();

  const hotels = hotelsResult.map((hotel) => {
    let totalVacancies = 0;
    let vacanciesReserved = 0;
    const roomsCapacity: number[] = [];

    hotel.Rooms.forEach(({ capacity, _count: { Booking: bookings } }) => {
      roomsCapacity.push(capacity);
      totalVacancies += capacity;
      vacanciesReserved += bookings;
    });

    delete hotel.Rooms;

    return {
      ...hotel,
      roomsCapacity,
      availableVacancies: totalVacancies - vacanciesReserved,
    };
  });

  return hotels;
}

export type GetHotelsResult = Hotel & {
  roomsCapacity: number[];
  availableVacancies: number;
};

async function getRoomsFromHotel(hotelId: number, userId: number): Promise<GetRoomsFromHotelResult> {
  await validateUserTicketOrFail(userId);

  const hotel = await hotelRepository.findRoomsFromHotelId(hotelId);

  if (!hotel) throw notFoundError();

  const rooms = hotel.Rooms.map(({ id, name, capacity, _count, createdAt, updatedAt }) => ({
    id,
    name,
    capacity,
    hotelId,
    bookeds: _count.Booking,
    createdAt,
    updatedAt,
  }));

  const hotelResult = { ...hotel, Rooms: rooms };

  return hotelResult;
}

export type GetRoomsFromHotelResult = Hotel & {
  Rooms: (Room & {
    bookeds: number;
  })[];
};

async function validateUserTicketOrFail(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw unauthorizedError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw unauthorizedError();

  if (ticket.status !== TicketStatus.PAID) throw paymentRequiredError();
}

const hotelsService = {
  getHotels,
  getRoomsFromHotel,
};

export default hotelsService;
