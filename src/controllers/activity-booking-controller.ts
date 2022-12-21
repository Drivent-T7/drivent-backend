import httpStatus from "http-status";
import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import activityBookingService, { BookActivityParams } from "@/services/activity-booking-service";

export async function bookActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.body as BookActivityParams;

  try {
    const createdActivityBooking = await activityBookingService.bookActivity({ userId, activityId });

    return res.status(httpStatus.OK).send(createdActivityBooking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }

    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function getActivityBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const activityBooking = await activityBookingService.getActivityBooking(userId);

    return res.status(httpStatus.OK).send(activityBooking);
  } catch (error) {
    console.log(error);
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
