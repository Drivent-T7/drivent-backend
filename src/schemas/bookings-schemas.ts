import { CreateBookingParams, UpdateBookingParams } from "@/services";
import Joi from "joi";

export const createAndUpdateBookingSchema = Joi.object<CreateBookingParams>({
  roomId: Joi.number().integer().min(1).required(),
});

export const updateBookingSchema = Joi.object<UpdateBookingParams>({
  bookingId: Joi.number().integer().min(1).required(),
});
