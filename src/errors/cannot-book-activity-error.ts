import { ApplicationError } from "@/protocols";

export function cannotBookActivityError(): ApplicationError {
  return {
    name: "CannotBookActivityError",
    message: "Cannot booking this activity! Overcapacity!",
  };
}
