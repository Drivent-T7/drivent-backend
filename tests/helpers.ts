import * as jwt from "jsonwebtoken";
import { TicketStatus, User } from "@prisma/client";

import { createEnrollmentWithAddress, createTicket, createTicketTypeWithOrWithoutHotel, createUser } from "./factories";
import { createSession } from "./factories/sessions-factory";
import { prisma, redis } from "@/config";

export async function cleanDb() {
  await redis.flushAll();
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.activityBooking.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.activities.deleteMany({});
  await prisma.activityDate.deleteMany({});
  await prisma.activityLocal.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
}

export async function generateValidTicket(user?: User) {
  const incomingUser = user || (await createUser());
  const enrollment = await createEnrollmentWithAddress(incomingUser);
  const ticketType = await createTicketTypeWithOrWithoutHotel();

  await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
}
