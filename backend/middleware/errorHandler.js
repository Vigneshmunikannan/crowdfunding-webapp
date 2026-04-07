/**
 * Central error handler. Must be registered after all routes.
 * @param {Error & { statusCode?: number; errors?: unknown }} err
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    err.statusCode && Number.isInteger(err.statusCode)
      ? err.statusCode
      : 500;

  const isProd = process.env.NODE_ENV === "production";
  const payload = {
    success: false,
    message:
      statusCode === 500 && isProd
        ? "Internal server error"
        : err.message || "Something went wrong",
  };

  if (!isProd && statusCode === 500 && err.stack) {
    payload.stack = err.stack;
  }

  if (err.errors) {
    payload.errors = err.errors;
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler };
