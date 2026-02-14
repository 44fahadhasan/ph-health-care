import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import path from "path";
import { auth } from "./app/lib/auth";
import { globalError } from "./app/middleware/global-error-handler";
import { notFound } from "./app/middleware/not-found";
import { indexRoutes } from "./app/routes";
import { envVars } from "./config/env";
const app: Application = express();

app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    origin: [envVars.BETTER_AUTH_URL, envVars.FRONT_END_URL],
  }),
);

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/views"));

// app.all("/api/auth/*", toNodeHandler(auth));
app.use("/api/auth/", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser(envVars.COOKIE_SECRET));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World with TypeScript and Express!");
});

app.use("/api/v1", indexRoutes);

app.use(notFound);
app.use(globalError);

export default app;
