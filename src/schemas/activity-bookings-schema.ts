import { BookActivityParams } from "@/services/activity-booking-service";
import Joi from "joi";

export const createActivityBookingSchema = Joi.object<BookActivityParams>({
  activityId: Joi.number().integer().min(1).required(),
});
