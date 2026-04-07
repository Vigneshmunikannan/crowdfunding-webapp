const mongoose = require("mongoose");
const Company = require("./Company");

const fundingRequestSchema = new mongoose.Schema(
  {
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundingCampaign",
      default: null,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/** @param {import("mongoose").Document | Record<string, unknown>} c */
function formatCampaignRef(c) {
  if (c && typeof c === "object" && c._id != null) {
    return {
      id: c._id.toString(),
      title: c.title,
      goalAmount: c.goalAmount,
      status: c.status,
    };
  }
  return c ? { id: String(c) } : null;
}

/** @param {import("mongoose").Document | Record<string, unknown>} doc */
function formatDonor(d) {
  if (d && typeof d === "object" && d._id != null) {
    return {
      id: d._id.toString(),
      name: d.name,
      email: d.email,
      role: d.role,
    };
  }
  return { id: d ? String(d) : "" };
}

/** @param {import("mongoose").Document | Record<string, unknown>} doc */
function formatPublic(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  const comp = plain.companyId;

  const company =
    comp && typeof comp === "object" && comp._id != null
      ? Company.formatPublic(comp)
      : { id: comp ? String(comp) : "" };

  return {
    id: plain._id.toString(),
    title: plain.title,
    description: plain.description ?? "",
    amount: plain.amount,
    status: plain.status,
    company,
    campaign: formatCampaignRef(plain.campaignId),
    donor: formatDonor(plain.donorId),
    createdAt: plain.createdAt,
  };
}

fundingRequestSchema.methods.toPublicObject = function toPublicObject() {
  return formatPublic(this);
};

fundingRequestSchema.statics.formatPublic = formatPublic;

module.exports = mongoose.model("FundingRequest", fundingRequestSchema);
