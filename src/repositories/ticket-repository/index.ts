import { prisma } from "@/config";
import { cacheData, findCachedData } from "@/utils/cache";
import { Ticket, TicketStatus } from "@prisma/client";

async function findTicketTypes() {
  const cachedData = await findCachedData("ticketTypes");

  if (cachedData.length > 0) return cachedData;

  const ticketTypes = await prisma.ticketType.findMany();

  cacheData({ key: "ticketTypes", value: ticketTypes });

  return ticketTypes;
}

async function findTickeyById(ticketId: number) {
  const cachedData = await findCachedData(`ticket${ticketId}`);

  if (cachedData.length > 0) return cachedData;

  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      Enrollment: true,
    },
  });
}

async function findTickeWithTypeById(ticketId: number) {
  const cachedData = await findCachedData(`ticket${ticketId}`);

  if (cachedData.length > 0) return cachedData;

  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      TicketType: true,
    },
  });
}

async function findTicketByEnrollmentId(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true,
    },
  });
}

async function createTicket(ticket: CreateTicketParams) {
  const createdTicket = await prisma.ticket.create({
    data: {
      ...ticket,
    },
    include: {
      TicketType: true,
      Enrollment: true,
    },
  });

  cacheData({ key: `ticket${createdTicket.id}`, value: createdTicket });

  return createdTicket;
}

async function ticketProcessPayment(ticketId: number) {
  const updatedTicket = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: TicketStatus.PAID,
    },
  });

  cacheData({ key: `ticket${ticketId}`, value: updatedTicket });

  return updatedTicket;
}

export type CreateTicketParams = Omit<Ticket, "id" | "createdAt" | "updatedAt">;

const ticketRepository = {
  findTicketTypes,
  findTicketByEnrollmentId,
  createTicket,
  findTickeyById,
  findTickeWithTypeById,
  ticketProcessPayment,
};

export default ticketRepository;
