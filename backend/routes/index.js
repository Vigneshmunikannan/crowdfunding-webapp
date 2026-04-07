const { Router } = require("express");
const { statusRouter } = require("./status.routes");
const { authRouter } = require("./authRoutes");
const { companyRouter } = require("./companyRoutes");
const { requestRouter } = require("./requestRoutes");
const { campaignRouter } = require("./campaignRoutes");

const apiRouter = Router();

apiRouter.use(statusRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/company", companyRouter);
apiRouter.use("/campaign", campaignRouter);
apiRouter.use("/request", requestRouter);

module.exports = { apiRouter };
