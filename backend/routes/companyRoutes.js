const { Router } = require("express");
const { body, param } = require("express-validator");
const {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { validateRequest } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

const router = Router();

const mongoIdParam = [
  param("id")
    .isMongoId()
    .withMessage("Invalid company id"),
];

const createRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 200 })
    .withMessage("Name must be at most 200 characters"),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be text")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must be at most 5000 characters"),
  body("contactEmail")
    .trim()
    .notEmpty()
    .withMessage("Contact email is required")
    .isEmail()
    .withMessage("Enter a valid contact email")
    .normalizeEmail(),
];

const updateRules = [
  body().custom((_value, { req }) => {
    const b = req.body || {};
    const keys = ["name", "description", "contactEmail"];
    const ok = keys.some((k) =>
      Object.prototype.hasOwnProperty.call(b, k)
    );
    if (!ok) {
      throw new Error(
        "Provide at least one of: name, description, contactEmail"
      );
    }
    return true;
  }),
  body("name")
    .optional({ values: "null" })
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 200 })
    .withMessage("Name must be at most 200 characters"),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be text")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must be at most 5000 characters"),
  body("contactEmail")
    .optional({ values: "null" })
    .trim()
    .notEmpty()
    .withMessage("Contact email cannot be empty")
    .isEmail()
    .withMessage("Enter a valid contact email")
    .normalizeEmail(),
];

router.get("/", asyncHandler(listCompanies));

router.post(
  "/",
  authMiddleware,
  requireRoles("admin"),
  createRules,
  validateRequest,
  asyncHandler(createCompany)
);

router.put(
  "/:id",
  authMiddleware,
  requireRoles("admin"),
  ...mongoIdParam,
  updateRules,
  validateRequest,
  asyncHandler(updateCompany)
);

router.delete(
  "/:id",
  authMiddleware,
  requireRoles("admin"),
  ...mongoIdParam,
  validateRequest,
  asyncHandler(deleteCompany)
);

module.exports = { companyRouter: router };
