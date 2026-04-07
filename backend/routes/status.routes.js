const { Router } = require("express");

const router = Router();

router.get("/status", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = { statusRouter: router };
