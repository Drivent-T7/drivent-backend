import { Response } from "express";
import httpStatus from "http-status";
import { AuthenticatedRequest } from "@/middlewares";
import activyService from "@/services/activy-service";

export async function getDatesEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const dateEvent = await activyService.getActivyDates(userId);

    return res.status(httpStatus.OK).send(dateEvent);
  } catch (error) {
    if(error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function getEventByIdDate(req: AuthenticatedRequest, res: Response) {
  const dateId = Number(req.params.eventDateId);

  if (!dateId || dateId < 1) return res.sendStatus(httpStatus.BAD_REQUEST);
  
  try {
    const { userId } = req;
    const events = await activyService.getActivyByDate(dateId, userId);
  
    return res.status(httpStatus.OK).send(events);
  } catch (error) {
    if(error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
