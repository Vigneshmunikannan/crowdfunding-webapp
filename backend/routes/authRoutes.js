const { Router } = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const { validateRequest } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/asyncHandler");

const router = Router();

const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 120 })
    .withMessage("Name must be at most 120 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .optional()
    .isIn(["admin", "donor"])
    .withMessage("Role must be admin or donor"),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post(
  "/register",
  registerRules,
  validateRequest,
  asyncHandler(register)
);

router.post("/login", loginRules, validateRequest, asyncHandler(login));

module.exports = { authRouter: router };
