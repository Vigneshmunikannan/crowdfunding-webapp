const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
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
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
function formatPublic(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  const cb = plain.createdBy;

  const createdBy =
    cb && typeof cb === "object" && cb._id != null
      ? {
          id: cb._id.toString(),
          name: cb.name,
          email: cb.email,
        }
      : { id: cb ? String(cb) : "" };

  return {
    id: plain._id.toString(),
    name: plain.name,
    description: plain.description ?? "",
    contactEmail: plain.contactEmail,
    createdBy,
    createdAt: plain.createdAt,
  };
}

companySchema.methods.toPublicObject = function toPublicObject() {
  return formatPublic(this);
};

companySchema.statics.formatPublic = formatPublic;

module.exports = mongoose.model("Company", companySchema);
