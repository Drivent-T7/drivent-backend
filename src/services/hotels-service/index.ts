import { Hotel, Room, TicketStatus } from "@prisma/client";
import { notFoundError, unauthorizedError } from "@/errors";
import { paymentRequiredError } from "./errors";
import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number): Promise<GetHotelsResult[]> {
  await validateUserTicketOrFail(userId);
  const hotels = await hotelRepository.findHotels();
  return formatHotels(hotels);
}

export type GetHotelsResult = Hotel & {
  capacity: string;
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

function formatHotels(hotels: FormatHotelsParams) {
  return hotels.map((hotel) => {
    let availableVacancies = 0;
    const roomsCapacityMap: { [key: number]: boolean } = {};
    const roomsCapacityArray: number[] = [];

    hotel.Rooms.forEach(({ capacity, _count: { Booking: bookings } }) => {
      if (!roomsCapacityMap[capacity]) {
        roomsCapacityMap[capacity] = true;
        roomsCapacityArray.push(capacity);
      }
      availableVacancies += capacity;
      availableVacancies -= bookings;
    });

    const hotelCapacity = roomsCapacityArray
      .sort()
      .join(", ")
      .replace("1", "Single")
      .replace("2", "Double")
      .replace("3", "Triple")
      .replace(/,\s([^,]+)$/, " e $1");

    delete hotel.Rooms;

    return {
      ...hotel,
      capacity: hotelCapacity,
      availableVacancies,
    };
  });
}

type FormatHotelsParams = (Hotel & {
  Rooms: {
    capacity: number;
    _count: {
      Booking: number;
    };
  }[];
})[];

const hotelsService = {
  getHotels,
  getRoomsFromHotel,
};

export default hotelsService;
