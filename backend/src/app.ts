import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth-route";
import userRouter from "./routes/user-route";
import chatRouter from "./routes/chat-route";

import {
  BadRequest,
  ConflictError,
  DatabaseError,
  ForbiddenRequest,
  NotFoundError,
  PaymentRequired,
  UnauthorizedClient,
  ValidationError,
} from "./error";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BadRequest) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof UnauthorizedClient) {
    res.status(401).send(err.message);
  } else if (err instanceof PaymentRequired) {
    res.status(402).send(err.message);
  } else if (err instanceof ForbiddenRequest) {
    res.status(403).send(err.message);
  } else if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
  } else if (err instanceof DatabaseError) {
    res.status(500).json({ error: "Unexpected Error Occured" });
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
  } else {
    res.status(500).send("Internal Server Error");
  }
});
