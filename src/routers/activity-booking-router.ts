import { bookActivity, getActivityBooking } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { createActivityBookingSchema } from "@/schemas";
import { Router } from "express";

const activityBookingRouter = Router();

activityBookingRouter
  .all("/*", authenticateToken)
  .post("/", validateBody(createActivityBookingSchema), bookActivity)
  .get("/", getActivityBooking);

export { activityBookingRouter };
