import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getRoomsFromHotel } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter.all("/*", authenticateToken).get("/", getHotels).get("/:hotelId", getRoomsFromHotel);

export { hotelsRouter };
