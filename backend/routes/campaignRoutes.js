const { Router } = require("express");
const { body, param } = require("express-validator");
const {
  listOpenCampaigns,
  listAllCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} = require("../controllers/campaignController");
const { validateRequest } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

const router = Router();

const mongoIdParam = [
  param("id").isMongoId().withMessage("Invalid id"),
];

const createRules = [
  body("companyId")
    .trim()
    .notEmpty()
    .withMessage("Company is required")
    .isMongoId()
    .withMessage("Invalid company id"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be text")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must be at most 5000 characters"),
  body("goalAmount")
    .notEmpty()
    .withMessage("Goal amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Goal amount must be a positive number"),
];

const updateRules = [
  body().custom((_value, { req }) => {
    const b = req.body || {};
    const keys = ["title", "description", "goalAmount", "status", "companyId"];
    const ok = keys.some((k) =>
      Object.prototype.hasOwnProperty.call(b, k)
    );
    if (!ok) {
      throw new Error(
        "Provide at least one of: title, description, goalAmount, status, companyId"
      );
    }
    return true;
  }),
  body("title")
    .optional({ values: "null" })
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be text")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must be at most 5000 characters"),
  body("goalAmount")
    .optional({ values: "null" })
    .isFloat({ gt: 0 })
    .withMessage("Goal amount must be a positive number"),
  body("status")
    .optional({ values: "null" })
    .isIn(["open", "closed"])
    .withMessage("Status must be open or closed"),
  body("companyId")
    .optional({ values: "null" })
    .isMongoId()
    .withMessage("Invalid company id"),
];

router.get("/", asyncHandler(listOpenCampaigns));

router.get(
  "/admin",
  authMiddleware,
  requireRoles("admin"),
  asyncHandler(listAllCampaigns)
);

router.post(
  "/",
  authMiddleware,
  requireRoles("admin"),
  createRules,
  validateRequest,
  asyncHandler(createCampaign)
);

router.get(
  "/:id",
  ...mongoIdParam,
  validateRequest,
  asyncHandler(getCampaign)
);

router.put(
  "/:id",
  authMiddleware,
  requireRoles("admin"),
  ...mongoIdParam,
  updateRules,
  validateRequest,
  asyncHandler(updateCampaign)
);

router.delete(
  "/:id",
  authMiddleware,
  requireRoles("admin"),
  ...mongoIdParam,
  validateRequest,
  asyncHandler(deleteCampaign)
);

module.exports = { campaignRouter: router };
