import { Response } from "express";
import httpStatus from "http-status";
import { AuthenticatedRequest } from "@/middlewares";
import activyService from "@/services/activy-service";

export async function getDatesEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const dateEvent = await activyService.getActivyDates();

    return res.status(httpStatus.OK).send(dateEvent);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function getEventByIdDate(req: AuthenticatedRequest, res: Response) {
  const dateId = Number(req.params.eventDateId);
  
  try {
    const events = await activyService.getActivyByDate(dateId);
  
    return res.status(httpStatus.OK).send(events);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
