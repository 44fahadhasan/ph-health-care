import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import { globalError } from "./app/middleware/global-error-handler";
import { notFound } from "./app/middleware/not-found";
import { indexRoutes } from "./app/routes";
import { envVars } from "./config/env";

const app: Application = express();

app.use(express.json());
app.use(cookieParser(envVars.COOKIE_SECRET));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World with TypeScript and Express!");
});

app.use("/api/v1", indexRoutes);

app.use(notFound);
app.use(globalError);

export default app;
