const FundingRequest = require("../models/FundingRequest");
const Company = require("../models/Company");
const FundingCampaign = require("../models/FundingCampaign");

const populateList = [
  { path: "companyId" },
  { path: "donorId", select: "name email role" },
  { path: "campaignId", select: "title goalAmount status" },
];

async function createRequest(req, res) {
  const { title, description, amount, companyId, campaignId } = req.body;

  let resolvedCompanyId = companyId;
  let resolvedCampaignId = null;

  if (campaignId) {
    const campaign = await FundingCampaign.findById(campaignId);
    if (!campaign) {
      const err = new Error("Funding opportunity not found");
      err.statusCode = 404;
      throw err;
    }
    if (campaign.status !== "open") {
      const err = new Error("This funding opportunity is closed");
      err.statusCode = 400;
      throw err;
    }
    resolvedCompanyId = campaign.companyId.toString();
    resolvedCampaignId = campaignId;
  } else {
    const company = await Company.findById(companyId);
    if (!company) {
      const err = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }
  }

  const request = await FundingRequest.create({
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    amount: Number(amount),
    companyId: resolvedCompanyId,
    campaignId: resolvedCampaignId,
    donorId: req.user.id,
    status: "pending",
  });

  await request.populate(populateList);

  res.status(201).json({
    success: true,
    request: request.toPublicObject(),
  });
}

async function listMyRequests(req, res) {
  const requests = await FundingRequest.find({ donorId: req.user.id })
    .sort({ createdAt: -1 })
    .populate(populateList)
    .lean();

  res.json({
    success: true,
    requests: requests.map((doc) => FundingRequest.formatPublic(doc)),
  });
}

async function listAllRequests(_req, res) {
  const requests = await FundingRequest.find()
    .sort({ createdAt: -1 })
    .populate(populateList)
    .lean();

  res.json({
    success: true,
    requests: requests.map((doc) => FundingRequest.formatPublic(doc)),
  });
}

async function updateRequestStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const request = await FundingRequest.findById(id);
  if (!request) {
    const err = new Error("Funding request not found");
    err.statusCode = 404;
    throw err;
  }

  request.status = status;
  await request.save();
  await request.populate(populateList);

  res.json({
    success: true,
    request: request.toPublicObject(),
  });
}

async function deleteRequest(req, res) {
  const { id } = req.params;

  const request = await FundingRequest.findByIdAndDelete(id);
  if (!request) {
    const err = new Error("Funding request not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({
    success: true,
    message: "Funding request deleted",
  });
}

module.exports = {
  createRequest,
  listMyRequests,
  listAllRequests,
  updateRequestStatus,
  deleteRequest,
};
