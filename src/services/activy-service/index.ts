import { notFoundError } from "@/errors";
import acitivyRepository from "@/repositories/activy-repository";

async function getActivyDates() {
  const activyDate = await acitivyRepository.findActivyDates();

  if (!activyDate) {
    throw notFoundError();
  }
  
  return activyDate;
}

async function getActivyByDate(dateId: number) {
  const events = await acitivyRepository.findActivysByDateId(dateId);
  
  if (!events) {
    throw notFoundError();
  }
    
  return events;
}

const activyService = {
  getActivyDates,
  getActivyByDate
};

export default activyService;
