import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "./config/env";
import routes from "./routes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
