import { SignInParams, SignInWithEmailParams } from "@/services";
import Joi from "joi";

export const signInSchema = Joi.object<SignInParams>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const signInSchemaWithFireAuth = Joi.object<SignInWithEmailParams>({
  email: Joi.string().email().required(),
  idSession: Joi.number().required(),
});
