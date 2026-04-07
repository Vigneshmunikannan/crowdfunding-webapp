import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const feedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10_000,
    },
  },
  {
    timestamps: true,
  }
);

/** Speeds up admin list sorted by newest first; helps under concurrent read load. */
feedbackSchema.index({ createdAt: -1 });

export type FeedbackDoc = InferSchemaType<typeof feedbackSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type FeedbackModel = Model<FeedbackDoc>;

export const Feedback: FeedbackModel =
  (mongoose.models.Feedback as FeedbackModel) ||
  mongoose.model<FeedbackDoc>("Feedback", feedbackSchema);
