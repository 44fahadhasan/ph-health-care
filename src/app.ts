import express, { Application, Request, Response } from "express";
import { indexRoutes } from "./app/routes";

const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World with TypeScript and Express!");
});

app.use("/api/v1", indexRoutes);

export default app;
