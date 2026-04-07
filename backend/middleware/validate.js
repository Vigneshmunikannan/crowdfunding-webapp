const { validationResult } = require("express-validator");

/** Use after express-validator chains on a route */
function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  const err = new Error("Validation failed");
  err.statusCode = 422;
  err.errors = result.array();
  next(err);
}

module.exports = { validateRequest };
