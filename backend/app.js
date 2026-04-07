const express = require("express");
const cors = require("cors");
const { apiRouter } = require("./routes");
const { notFound } = require("./middleware/notFound");
const { multerErrorHandler } = require("./middleware/multerError");
const { errorHandler } = require("./middleware/errorHandler");

/** Browsers send Origin without a trailing slash; env values often include one. */
function normalizeOriginUrl(value) {
  return String(value).trim().replace(/\/+$/, "");
}

function corsOriginOption() {
  const raw =
    process.env.CLIENT_URL || process.env.CORS_ORIGIN;
  if (!raw) return true;
  const parts = raw
    .split(",")
    .map((s) => normalizeOriginUrl(s))
    .filter(Boolean);
  if (parts.length === 0) return true;
  if (parts.length === 1) return parts[0];
  return parts;
}

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: corsOriginOption(),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(multerErrorHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
