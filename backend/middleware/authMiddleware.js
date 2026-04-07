const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("Access denied. No token provided.");
    err.statusCode = 401;
    return next(err);
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    const err = new Error("Access denied. No token provided.");
    err.statusCode = 401;
    return next(err);
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch {
    const err = new Error("Invalid or expired token");
    err.statusCode = 401;
    next(err);
  }
}

module.exports = { authMiddleware };
