import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Feedback, type FeedbackDoc } from "@/models/Feedback";
import type { FeedbackInput } from "@/lib/validation/feedback";

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/** Plain objects from `.lean()` — explicit shape for TypeScript */
export type FeedbackListItem = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
};

export async function createFeedback(data: FeedbackInput): Promise<FeedbackDoc> {
  await connectDB();

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const dup = await Feedback.findOne({
    email: data.email.toLowerCase(),
    message: data.message,
    createdAt: { $gte: since },
  })
    .select("_id")
    .lean();

  if (dup) {
    const err = new Error("Duplicate submission. Please wait before sending again.");
    (err as Error & { statusCode?: number }).statusCode = 429;
    throw err;
  }

  const doc = await Feedback.create({
    name: data.name,
    email: data.email.toLowerCase(),
    message: data.message,
  });
  return doc;
}

export async function listFeedbackNewestFirst(): Promise<FeedbackListItem[]> {
  await connectDB();
  const rows = await Feedback.find()
    .sort({ createdAt: -1 })
    .select("name email message createdAt")
    .lean();
  return rows as FeedbackListItem[];
}

export async function deleteFeedbackById(
  id: string
): Promise<{ deleted: boolean }> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { deleted: false };
  }
  const res = await Feedback.findByIdAndDelete(id);
  return { deleted: Boolean(res) };
}
