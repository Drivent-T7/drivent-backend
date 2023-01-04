import { singInPost, singInWithFireAuth } from "@/controllers";
import { validateBody } from "@/middlewares";
import { signInSchema, signInSchemaWithFireAuth } from "@/schemas";
import { Router } from "express";

const authenticationRouter = Router();

authenticationRouter
  .post("/sign-in", validateBody(signInSchema), singInPost)
  .post("/sign-in/method", validateBody(signInSchemaWithFireAuth), singInWithFireAuth);

export { authenticationRouter };
