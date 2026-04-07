import { listFeedbackNewestFirst } from "@/lib/feedbackRepository";
import { FeedbackTable, type FeedbackRow } from "./FeedbackTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const items = await listFeedbackNewestFirst();
  const rows: FeedbackRow[] = items.map((f) => {
    const created =
      f.createdAt instanceof Date
        ? f.createdAt.toISOString()
        : f.createdAt
          ? String(f.createdAt)
          : null;
    return {
      id: String(f._id),
      name: f.name,
      email: f.email,
      message: f.message,
      createdAt: created,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <FeedbackTable rows={rows} />
    </div>
  );
}
