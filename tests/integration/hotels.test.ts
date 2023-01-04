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
  createHotelWithoutRooms,
  createBooking,
} from "../factories";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user does not have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 when ticket does not have a valid ticket type", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel(false);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 200 and an empty array when there are no hotels created", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([]);
      });

      it("should respond with status 200 and with hotels data", async () => {
        const hotel = await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            capacity: "Single e Double",
            availableVacancies: 3,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
          },
        ]);
      });
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session with given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 when user does not have an enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 when ticket does not have a valid ticket type", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel(false);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 402 when ticket have a valid ticket type but not is paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithOrWithoutHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 400 when param hotelId is invalid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);

        const response = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 404 when there is no hotel with given id", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 200 and an empty array of rooms when there are no rooms created", async () => {
        const hotel = await createHotelWithoutRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);

        const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [],
        });
      });

      it("should respond with status 200 and with rooms data", async () => {
        const hotel = await createHotelWithRooms();
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user);
        await createBooking(hotel.Rooms[0].id, user.id);

        const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [
            {
              id: hotel.Rooms[0].id,
              name: hotel.Rooms[0].name,
              capacity: hotel.Rooms[0].capacity,
              hotelId: hotel.id,
              bookeds: 1,
              createdAt: hotel.Rooms[0].createdAt.toISOString(),
              updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
            },
            {
              id: hotel.Rooms[1].id,
              name: hotel.Rooms[1].name,
              capacity: hotel.Rooms[1].capacity,
              hotelId: hotel.id,
              bookeds: expect.any(Number),
              createdAt: hotel.Rooms[1].createdAt.toISOString(),
              updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
            },
          ],
        });
      });
    });
  });
});
