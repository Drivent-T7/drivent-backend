import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function main() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }

  console.log({ event });

  await createTicketType();

  await createHotelsWithRooms();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




async function createTicketType() {
  let ticketType = await prisma.ticketType.findMany();
  if (!ticketType[0]) {
    await prisma.ticketType.createMany({
      data: [{
        name: "Online",
        price: 9000,
        isRemote: true,
        includesHotel: false,
      }, {
        name: "Presencial + Com Hotel",
        price: 50000,
        isRemote: false,
        includesHotel: true,
      },
      {
        name: "Presencial + Sem Hotel",
        price: 20000,
        isRemote: false,
        includesHotel: false,
      },
      ]
    });
  }

  ticketType = await prisma.ticketType.findMany();
  console.log({ ticketType })
};

async function createHotelsWithRooms() {
  let hotels = await prisma.hotel.findMany({ include: { Rooms: true } });
  if (!hotels[0]) {
    await prisma.hotel.create({
      data: {
        name: "Driven Resort",
        image: "https://www.melhoresdestinos.com.br/wp-content/uploads/2021/04/resort-salinas-maragogi-capa-05.jpg",
        Rooms: {
          createMany: {
            data: [
              {
                name: "101",
                capacity: 3,
              },
              {
                name: "102",
                capacity: 3,
              },
              {
                name: "103",
                capacity: 2,
              },
              {
                name: "104",
                capacity: 3,
              },
              {
                name: "105",
                capacity: 1,
              },
              {
                name: "106",
                capacity: 2,
              },
              {
                name: "107",
                capacity: 3,
              },
              {
                name: "108",
                capacity: 1,
              },
              {
                name: "109",
                capacity: 2,
              },
              {
                name: "110",
                capacity: 3,
              },
            ]
          }
        }
      },
      include: { Rooms: true }
    });

    await prisma.hotel.create({
      data: {
        name: "Driven Palace",
        image: "https://carltonhoteis.com.br/wp-content/uploads/2019/08/palace-banner.jpg",
        Rooms: {
          createMany: {
            data: [
              {
                name: "101",
                capacity: 1,
              },
              {
                name: "102",
                capacity: 1,
              },
              {
                name: "103",
                capacity: 1,
              },
              {
                name: "104",
                capacity: 2,
              },
              {
                name: "201",
                capacity: 1,
              },
              {
                name: "202",
                capacity: 2,
              },
              {
                name: "203",
                capacity: 2,
              },
              {
                name: "204",
                capacity: 1,
              },
              {
                name: "301",
                capacity: 2,
              },
              {
                name: "302",
                capacity: 2,
              },
              {
                name: "303",
                capacity: 2,
              },
              {
                name: "304",
                capacity: 2,
              },
            ]
          }
        }
      },
      include: { Rooms: true }
    });

    await prisma.hotel.create({
      data: {
        name: "Driven World",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg",
        Rooms: {
          createMany: {
            data: [
              {
                name: "101",
                capacity: 1,
              },
              {
                name: "102",
                capacity: 1,
              },
              {
                name: "103",
                capacity: 1,
              },
              {
                name: "104",
                capacity: 1,
              },
              {
                name: "105",
                capacity: 1,
              },
              {
                name: "201",
                capacity: 2,
              },
              {
                name: "202",
                capacity: 2,
              },
              {
                name: "203",
                capacity: 2,
              },
              {
                name: "204",
                capacity: 2,
              },
              {
                name: "205",
                capacity: 2,
              },
            ]
          }
        }
      },
      include: { Rooms: true }
    });
  }

  hotels = await prisma.hotel.findMany({ include: { Rooms: true } });
  console.log({ hotels })
}