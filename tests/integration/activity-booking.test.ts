import app, { init } from "@/app";
import supertest from "supertest";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidToken } from "../helpers";
import {
  createUser,
  createEnrollmentWithAddress,
  createTicket,
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

describe("GET /activitybooking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activity/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activitybooking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activitybooking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and an empty array if user does not have activities booked", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const local = await createLocalActivity();
      const date = await createDateActivity();
      await createActivity(date.id, local.id);

      const response = await server.get("/activitybooking").set("Authorization", `Bearer ${token}`);

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

      const response = await server.get("/activitybooking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: booking.id,
          Activities: {
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

describe("POST /activitybooking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/activitybooking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when body is valid", () => {
    it("should respond with status 400 if body param activityId is invalid", async () => {
      const token = await generateValidToken();
      const body = { activityId: 0 };

      const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 if body param activityId is missing", async () => {
      const token = await generateValidToken();
      const body = {};

      const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
      it("should respond with status 403 if user does not have an enrollment", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const body = { activityId: 1 };

        const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if ticket does not have a valid ticket type", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const body = { activityId: 1 };

        const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const body = { activityId: 1 };

        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

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

          const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

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

          const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

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

          const response = await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

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

          await server.post("/activitybooking").set("Authorization", `Bearer ${token}`).send(body);

          const afterCount = await prisma.activityBooking.count();

          expect(afterCount).toBe(beforeCount + 1);
        });
      });
    });
  });
});
