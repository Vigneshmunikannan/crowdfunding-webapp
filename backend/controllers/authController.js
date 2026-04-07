const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const SALT_ROUNDS = 12;

function buildAuthResponse(userDoc) {
  const user = userDoc.toSafeObject();
  const token = signToken({ sub: user.id, role: user.role });
  return { token, user };
}

async function register(req, res, next) {
  const { name, email, password, role } = req.body;
  const resolvedRole = role === "admin" ? "admin" : "donor";

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: resolvedRole,
    });
  } catch (e) {
    if (e.code === 11000) {
      const dup = new Error("An account with this email already exists");
      dup.statusCode = 409;
      throw dup;
    }
    throw e;
  }

  res.status(201).json({
    success: true,
    ...buildAuthResponse(user),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password"
  );

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  res.json({
    success: true,
    ...buildAuthResponse(user),
  });
}

module.exports = { register, login };
