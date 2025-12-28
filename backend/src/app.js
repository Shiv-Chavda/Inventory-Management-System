require("dotenv/config");

const express = require("express");
const cors = require("cors");
const { ZodError } = require("zod");
const { randomUUID } = require("crypto");

const { productsRouter } = require("./routes/products");
const { movementsRouter } = require("./routes/movements");
const { reportsRouter } = require("./routes/reports");
const { logger } = require("./models/logger");
const { prisma } = require("./models/db");

function attachRequestContext(_req, res, next) {
  const incomingId = res.req && res.req.headers ? res.req.headers["x-request-id"] : undefined;
  const requestId = typeof incomingId === "string" && incomingId.length ? incomingId : randomUUID();

  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  res.locals.startHrTime = process.hrtime.bigint();
  next();
}

function requestLogger(req, res, next) {
  res.on("finish", () => {
    const start = res.locals.startHrTime;
    const durationMs = start ? Number((process.hrtime.bigint() - start) / 1_000_000n) : undefined;

    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    const path = req.originalUrl || req.url;
    const requestId = res.locals.requestId;
    const shortId = requestId ? String(requestId).split("-")[0] : undefined;
    const durationText = typeof durationMs === "number" ? `${durationMs}ms` : "-";

    logger[level](`${req.method} ${path} ${status} ${durationText}`, shortId ? { id: shortId } : undefined);
  });

  next();
}

function notFound(_req, res) {
  res.status(404).json({ error: "Not found" });
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    logger.warn("validation_error", {
      requestId: res.locals.requestId,
      issues: err.issues
    });
    return res.status(400).json({ error: "Validation error", details: err.flatten() });
  }

  if (err instanceof Error) {
    logger.error("unhandled_error", {
      requestId: res.locals.requestId,
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({ error: err.message });
  }

  logger.error("unknown_error", {
    requestId: res.locals.requestId,
    err
  });
  return res.status(500).json({ error: "Unknown error" });
}

const app = express();

app.use(express.json());
app.use(attachRequestContext);
app.use(requestLogger);

const frontendOrigin = process.env.FRONTEND_ORIGIN;
app.use(
  cors({
    origin: frontendOrigin ? [frontendOrigin] : true
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/products", productsRouter);
app.use("/api/products/:id/movements", movementsRouter);
app.use("/api/reports", reportsRouter);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);

async function start() {
  logger.info("backend_starting", {
    port,
    nodeEnv: process.env.NODE_ENV || "development",
    frontendOrigin: process.env.FRONTEND_ORIGIN
  });

  await prisma.$connect();
  logger.info("db_connected");

  const server = app.listen(port, () => {
    logger.info("backend_listening", { url: `http://localhost:${port}` });
  });

  const shutdown = async (signal) => {
    logger.warn("backend_shutdown", { signal });
    server.close(() => {
      logger.info("http_server_closed");
    });
    await prisma.$disconnect();
    logger.info("db_disconnected");
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((err) => {
  const e = err instanceof Error ? err : new Error("Startup failed");
  logger.error("fatal_startup_error", { message: e.message, stack: e.stack });
  process.exitCode = 1;
});
