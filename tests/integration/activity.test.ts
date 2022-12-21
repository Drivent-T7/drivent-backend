import app, { init } from "@/app";
import supertest from "supertest";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidTicket, generateValidToken } from "../helpers";
import {
  createUser,
  createHotelWithRooms,
  createEnrollmentWithAddress,
  createTicket,
  createTicketTypeWithOrWithoutHotel,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
} from "../factories";
import { createActivity, createActivityBooking, createDateActivity, createLocalActivity } from "../factories/activy-factory";
import { prisma } from "@/config";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /activity", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activity");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user does not have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 401 when ticket is online", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 200 and an empty array when there are no activity date created", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithOrWithoutHotel();

        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([]);
      });

      it("should respond with status 200 and with activity date data", async () => {
        await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);
        const date = await createDateActivity();

        const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            id: date.id,
            date: date.date.toISOString(),
            createdAt: date.createdAt.toISOString(),
            updatedAt: date.updatedAt.toISOString(),
          },
        ]);
      });
    });
  });
});

describe("GET /activity/:eventDateId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activity/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activity/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activity/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user does not have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/activity/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 when ticket is online", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/activity/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/activity/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 400 when param eventDateId is invalid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);

        const response = await server.get("/activity/0").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 200 and an empty array of events when there are no events created", async () => {
        await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);
        const local = await createLocalActivity();
        const date = await createDateActivity();

        const response = await server.get(`/activity/${date.id}`).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            id: local.id,
            name: local.name,
            createdAt: local.createdAt.toISOString(),
            updatedAt: local.updatedAt.toISOString(),
            Activities: []
          },
        ]);
      });

      it("should respond with status 200 and with events data", async () => {
        await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);
        const local = await createLocalActivity();
        const date = await createDateActivity();
        const activity = await createActivity(date.id, local.id);

        const response = await server.get(`/activity/${date.id}`).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            id: local.id,
            name: local.name,
            createdAt: local.createdAt.toISOString(),
            updatedAt: local.updatedAt.toISOString(),
            Activities: [
              {
                id: activity.id,
                name: activity.name,
                dateId: date.id,
                ActivityBooking: [],
                capacity: activity.capacity,
                localId: local.id,
                startsAt: activity.startsAt.toISOString(),
                endsAt: activity.endsAt.toISOString(),
                createdAt: activity.createdAt.toISOString(),
                updatedAt: activity.updatedAt.toISOString()
              }
            ]
          },
        ]);
      });
    });
  });
});

describe("GET /activity/booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activity/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activity/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activity/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and an empty array if user does not have activities booked", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/activity/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([]);
    });

    it("should respond with status 200 and activity booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const local = await createLocalActivity();
      const date = await createDateActivity();
      const activity = await createActivity(date.id, local.id);
      const booking = await createActivityBooking(user.id, activity.id);

      const response = await server.get("/activity/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          activityBookingId: booking.id,
          activities: {
            id: activity.id,
            name: activity.name,
            dateId: activity.dateId,
            capacity: activity.capacity,
            localId: activity.localId,
            startsAt: activity.startsAt.toISOString(),
            endsAt: activity.endsAt.toISOString()
          }
        }
      ]);
    });
  });
});

describe("POST /activity/booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/activity/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when body is valid", () => {
    it("should respond with status 400 if body param activityId is invalid", async () => {
      const token = await generateValidToken();
      const body = { activityId: 0 };

      const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 if body param activityId is missing", async () => {
      const token = await generateValidToken();
      const body = {};

      const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
      it("should respond with status 403 if user does not have an enrollment", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const body = { activityId: 1 };

        const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if ticket does not have a valid ticket type", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const body = { activityId: 1 };

        const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const body = { activityId: 1 };

        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      describe("when ticket is valid", () => {
        it("should respond with status 404 if activityId does not exist", async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketTypeWithHotel();
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const local = await createLocalActivity();
          const date = await createDateActivity();
          const activity = await createActivity(date.id, local.id);
          const body = { activityId: (activity.id + 10) };

          const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

          expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 403 if activity has no vacancy", async () => {
          const user = await createUser();
          const secondUser = await createUser();
          const token = await generateValidToken(user);
          await generateValidToken(secondUser);
          const enrollment = await createEnrollmentWithAddress(user);
          const secondEnrollment = await createEnrollmentWithAddress(secondUser);
          const ticketType = await createTicketTypeWithHotel();
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          await createTicket(secondEnrollment.id, ticketType.id, TicketStatus.PAID);
          const local = await createLocalActivity();
          const date = await createDateActivity();
          const capacity = 1;
          const activity = await createActivity(date.id, local.id, capacity);
          await createActivityBooking(secondUser.id, activity.id);
          const body = { activityId: activity.id };

          const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

          expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 200 and with created activityBooking id", async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketTypeWithHotel();
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const local = await createLocalActivity();
          const date = await createDateActivity();
          const activity = await createActivity(date.id, local.id);
          const body = { activityId: activity.id };

          const response = await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

          expect(response.status).toBe(httpStatus.OK);
          expect(response.body).toEqual({ activityBookingId: expect.any(Number) });
        });

        it("should insert a new activityBooking in the database", async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketTypeWithHotel();
          await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          const local = await createLocalActivity();
          const date = await createDateActivity();
          const activity = await createActivity(date.id, local.id);
          const body = { activityId: activity.id };

          const beforeCount = await prisma.activityBooking.count();

          await server.post("/activity/booking").set("Authorization", `Bearer ${token}`).send(body);

          const afterCount = await prisma.activityBooking.count();

          expect(afterCount).toBe(beforeCount + 1);
        });
      });
    });
  });
});
