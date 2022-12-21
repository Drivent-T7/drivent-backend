import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getDatesEvents, getEventByIdDate } from "@/controllers/activy-controller";

const activyRouter = Router();

activyRouter
  .all("/*", authenticateToken)
  .get("/", getDatesEvents)
  .get("/:eventDateId", getEventByIdDate);

export { activyRouter };
