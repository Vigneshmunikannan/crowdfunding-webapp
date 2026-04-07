const mongoose = require("mongoose");
const Company = require("./Company");

const fundingCampaignSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    goalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/** @param {import("mongoose").Document | Record<string, unknown>} doc */
function formatPublic(doc, { includeAdmin = false } = {}) {
  const plain = doc.toObject ? doc.toObject() : doc;
  const comp = plain.companyId;

  const company =
    comp && typeof comp === "object" && comp._id != null
      ? Company.formatPublic(comp)
      : { id: comp ? String(comp) : "" };

  const base = {
    id: plain._id.toString(),
    title: plain.title,
    description: plain.description ?? "",
    goalAmount: plain.goalAmount,
    status: plain.status,
    company,
    createdAt: plain.createdAt,
  };

  if (includeAdmin && plain.createdBy && typeof plain.createdBy === "object") {
    base.createdBy = {
      id: plain.createdBy._id.toString(),
      name: plain.createdBy.name,
    };
  }

  return base;
}

fundingCampaignSchema.methods.toPublicObject = function toPublicObject(opts) {
  return formatPublic(this, opts);
};

fundingCampaignSchema.statics.formatPublic = formatPublic;

module.exports = mongoose.model("FundingCampaign", fundingCampaignSchema);
