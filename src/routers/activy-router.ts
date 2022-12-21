import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getDatesEvents, getEventByIdDate } from "@/controllers/activy-controller";
import { createActivityBookingSchema } from "@/schemas";
import { bookActivity } from "@/controllers";

const activyRouter = Router();

activyRouter
  .all("/*", authenticateToken)
  .get("/", getDatesEvents)
  .get("/:eventDateId", getEventByIdDate)
  .post("/booking", validateBody(createActivityBookingSchema), bookActivity)
  .get("/booking");

export { activyRouter };
