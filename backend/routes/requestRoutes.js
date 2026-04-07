const { Router } = require("express");
const { body, param } = require("express-validator");
const {
  createRequest,
  listMyRequests,
  listAllRequests,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/requestController");
const { validateRequest } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

const router = Router();

const mongoIdParam = [
  param("id")
    .isMongoId()
    .withMessage("Invalid request id"),
];

const createRules = [
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
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("campaignId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Invalid campaign id"),
  body("companyId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Invalid company id"),
  body().custom((_value, { req }) => {
    const b = req.body || {};
    if (!b.companyId && !b.campaignId) {
      throw new Error("Provide companyId or campaignId");
    }
    return true;
  }),
];

const patchStatusRules = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be approved or rejected"),
];

router.post(
  "/",
  authMiddleware,
  requireRoles("donor"),
  createRules,
  validateRequest,
  asyncHandler(createRequest)
);

router.get(
  "/my",
  authMiddleware,
  requireRoles("donor"),
  asyncHandler(listMyRequests)
);

router.get(
  "/",
  authMiddleware,
  requireRoles("admin"),
  asyncHandler(listAllRequests)
);

router.patch(
  "/:id",
  authMiddleware,
  requireRoles("admin"),
  ...mongoIdParam,
  patchStatusRules,
  validateRequest,
  asyncHandler(updateRequestStatus)
);

router.delete(
  "/:id",
  authMiddleware,
  requireRoles("admin"),
  ...mongoIdParam,
  validateRequest,
  asyncHandler(deleteRequest)
);

module.exports = { requestRouter: router };
