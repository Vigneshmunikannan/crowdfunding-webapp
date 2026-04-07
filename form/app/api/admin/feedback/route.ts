import { requireAdminApi } from "@/lib/auth";
import { listFeedbackNewestFirst } from "@/lib/feedbackRepository";
import { handleRouteError, jsonOk } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const unauthorized = await requireAdminApi();
    if (unauthorized) return unauthorized;

    const items = await listFeedbackNewestFirst();
    const feedback = items.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      email: f.email,
      message: f.message,
      createdAt: f.createdAt?.toISOString() ?? null,
    }));

    return jsonOk(200, { feedback });
  } catch (e) {
    return handleRouteError(e);
  }
}
