const FundingCampaign = require("../models/FundingCampaign");
const Company = require("../models/Company");

const populatePublic = [
  { path: "companyId" },
  { path: "createdBy", select: "name" },
];

async function listOpenCampaigns(_req, res) {
  const list = await FundingCampaign.find({ status: "open" })
    .sort({ createdAt: -1 })
    .populate("companyId")
    .lean();

  res.json({
    success: true,
    campaigns: list.map((doc) => FundingCampaign.formatPublic(doc)),
  });
}

async function listAllCampaigns(_req, res) {
  const list = await FundingCampaign.find()
    .sort({ createdAt: -1 })
    .populate(populatePublic)
    .lean();

  res.json({
    success: true,
    campaigns: list.map((doc) =>
      FundingCampaign.formatPublic(doc, { includeAdmin: true })
    ),
  });
}

async function getCampaign(req, res) {
  const campaign = await FundingCampaign.findById(req.params.id).populate(
    "companyId"
  );

  if (!campaign) {
    const err = new Error("Funding opportunity not found");
    err.statusCode = 404;
    throw err;
  }

  if (campaign.status !== "open") {
    const err = new Error("This funding opportunity is not available");
    err.statusCode = 404;
    throw err;
  }

  res.json({
    success: true,
    campaign: campaign.toPublicObject(),
  });
}

async function createCampaign(req, res) {
  const { companyId, title, description, goalAmount } = req.body;

  const company = await Company.findById(companyId);
  if (!company) {
    const err = new Error("Company not found");
    err.statusCode = 404;
    throw err;
  }

  const campaign = await FundingCampaign.create({
    companyId,
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    goalAmount: Number(goalAmount),
    status: "open",
    createdBy: req.user.id,
  });

  await campaign.populate(populatePublic);

  res.status(201).json({
    success: true,
    campaign: campaign.toPublicObject({ includeAdmin: true }),
  });
}

async function updateCampaign(req, res) {
  const { id } = req.params;
  const { title, description, goalAmount, status, companyId } = req.body;

  const campaign = await FundingCampaign.findById(id);
  if (!campaign) {
    const err = new Error("Funding opportunity not found");
    err.statusCode = 404;
    throw err;
  }

  if (companyId !== undefined) {
    const company = await Company.findById(companyId);
    if (!company) {
      const err = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }
    campaign.companyId = companyId;
  }
  if (title !== undefined) campaign.title = title.trim();
  if (description !== undefined) {
    campaign.description =
      typeof description === "string" ? description.trim() : "";
  }
  if (goalAmount !== undefined) campaign.goalAmount = Number(goalAmount);
  if (status !== undefined) campaign.status = status;

  await campaign.save();
  await campaign.populate(populatePublic);

  res.json({
    success: true,
    campaign: campaign.toPublicObject({ includeAdmin: true }),
  });
}

async function deleteCampaign(req, res) {
  const { id } = req.params;

  const campaign = await FundingCampaign.findByIdAndDelete(id);
  if (!campaign) {
    const err = new Error("Funding opportunity not found");
    err.statusCode = 404;
    throw err;
  }

  res.json({
    success: true,
    message: "Funding opportunity removed",
  });
}

module.exports = {
  listOpenCampaigns,
  listAllCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};
