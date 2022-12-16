import { getBooking, postBooking, putBooking } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { createAndUpdateBookingSchema, updateBookingSchema } from "@/schemas";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", validateBody(createAndUpdateBookingSchema), postBooking)
  .put("/:bookingId", validateBody(createAndUpdateBookingSchema), validateParams(updateBookingSchema), putBooking);

export { bookingRouter };
