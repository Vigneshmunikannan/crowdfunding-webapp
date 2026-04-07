/**
 * Restrict route to users whose role is in `allowedRoles`.
 * Use after `authMiddleware`.
 * @param {...string} allowedRoles e.g. requireRoles("admin") or requireRoles("admin", "donor")
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }
    if (!allowedRoles.includes(req.user.role)) {
      const err = new Error("You do not have permission to perform this action");
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
}

module.exports = { requireRoles };
