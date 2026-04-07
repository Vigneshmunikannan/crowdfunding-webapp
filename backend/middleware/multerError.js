const multer = require("multer");

/** Normalize Multer errors for the global error handler */
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    err.statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      err.message = "File too large";
    }
    return next(err);
  }
  if (err && err.message === "Unsupported file type for document upload") {
    err.statusCode = 400;
    return next(err);
  }
  next(err);
}

module.exports = { multerErrorHandler };
