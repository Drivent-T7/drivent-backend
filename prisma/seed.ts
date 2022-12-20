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

  await createLocals();

  await createActivitiesByDate()
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

async function createLocals() {
  let local = await prisma.activityLocal.findMany();

  if (!local[0]) {
    await prisma.activityLocal.createMany({
      data: [{
        name: "Auditório Principal"
      },
      {
        name: "Auditório Lateral"
      },
      {
        name: "Auditório Superior"
      }]
    })

    local = await prisma.activityLocal.findMany();
  }

  console.log({ local })
}

async function createActivitiesByDate() {
  let activitysDate = await prisma.activityDate.findMany({ include: { Activities: true } });

  if (!activitysDate[0]) {

    await prisma.activityDate.create({
      data: {
        date: dayjs().add(1, "days").startOf('hour').toDate(),
        Activities: {
          createMany: {
            data: [{
              name: "Palestra de Abertura",
              capacity: 100,
              localId: 1,
              startsAt: dayjs().add(1, 'days').startOf('hour').hour(8).toDate(),
              endsAt: dayjs().add(1, 'days').startOf('hour').hour(10).toDate()
            },
            {
              name: "Apresentação da grade",
              capacity: 100,
              localId: 1,
              startsAt: dayjs().add(1, 'days').startOf('hour').hour(10).toDate(),
              endsAt: dayjs().add(1, 'days').startOf('hour').hour(11).toDate()
            },
            {
              name: "Mesa Redonda: Mundo do T.I.",
              capacity: 10,
              localId: 3,
              startsAt: dayjs().add(1, 'days').startOf('hour').hour(15).toDate(),
              endsAt: dayjs().add(1, 'days').startOf('hour').hour(16).toDate()
            },
            {
              name: "Lunch and Talk",
              capacity: 100,
              localId: 2,
              startsAt: dayjs().add(1, 'days').startOf('hour').hour(11).toDate(),
              endsAt: dayjs().add(1, 'days').startOf('hour').hour(14).toDate()
            }
            ]
          }
        }
      }
    })

    await prisma.activityDate.create({
      data: {
        date: dayjs().add(2, "days").startOf('hour').toDate(),
        Activities: {
          createMany: {
            data: [{
              name: "Minecraft: Como montar seu pc gamer",
              capacity: 20,
              localId: 1,
              startsAt: dayjs().add(2, 'days').startOf('hour').hour(8).toDate(),
              endsAt: dayjs().add(2, 'days').startOf('hour').hour(9).toDate()
            },
            {
              name: "LOL: Como montar seu pc gamer",
              capacity: 10,
              localId: 1,
              startsAt: dayjs().add(2, 'days').startOf('hour').hour(9).toDate(),
              endsAt: dayjs().add(2, 'days').startOf('hour').hour(11).toDate()
            },
            {
              name: "Palestra: Stack Overflow",
              capacity: 10,
              localId: 2,
              startsAt: dayjs().add(2, 'days').startOf('hour').hour(8).toDate(),
              endsAt: dayjs().add(2, 'days').startOf('hour').hour(11).toDate()
            },
            {
              name: "Mesa redonda: Bootcamps",
              capacity: 10,
              localId: 3,
              startsAt: dayjs().add(2, 'days').startOf('hour').hour(8).toDate(),
              endsAt: dayjs().add(2, 'days').startOf('hour').hour(9).toDate()
            },
            {
              name: "Mesa redonda: JavaScript",
              capacity: 10,
              localId: 3,
              startsAt: dayjs().add(2, 'days').startOf('hour').hour(9).toDate(),
              endsAt: dayjs().add(2, 'days').startOf('hour').hour(10).toDate()
            }]
          }
        }
      }
    });

    await prisma.activityDate.create({
      data: {
        date: dayjs().add(3, "days").startOf('hour').toDate(),
        Activities: {
          createMany: {
            data: [{
              name: "Minecraft: Como montar seu pc gamer",
              capacity: 40,
              localId: 1,
              startsAt: dayjs().add(3, 'days').startOf('hour').hour(8).toDate(),
              endsAt: dayjs().add(3, 'days').startOf('hour').hour(9).toDate()
            },
            {
              name: "LOL: Como montar seu pc gamer",
              capacity: 40,
              localId: 1,
              startsAt: dayjs().add(3, 'days').startOf('hour').hour(9).toDate(),
              endsAt: dayjs().add(3, 'days').startOf('hour').hour(11).toDate()
            },
            {
              name: "Palestra: Stack Overflow",
              capacity: 10,
              localId: 2,
              startsAt: dayjs().add(3, 'days').startOf('hour').hour(8).toDate(),
              endsAt: dayjs().add(3, 'days').startOf('hour').hour(11).toDate()
            },
            {
              name: "Mesa redonda: Ganhe dinheiro fácil",
              capacity: 2,
              localId: 3,
              startsAt: dayjs().add(3, 'days').startOf('hour').hour(8).toDate(),
              endsAt: dayjs().add(3, 'days').startOf('hour').hour(9).toDate()
            },
            {
              name: "Mesa redonda: Start-ups",
              capacity: 5,
              localId: 3,
              startsAt: dayjs().add(3, 'days').startOf('hour').hour(9).toDate(),
              endsAt: dayjs().add(3, 'days').startOf('hour').hour(10).toDate()
            }]
          }
        }
      }
    });

    activitysDate = await prisma.activityDate.findMany({ include: { Activities: true } })
  }

  console.log({ activitysDate });
}
