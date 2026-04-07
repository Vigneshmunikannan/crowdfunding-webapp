import { requireAdminApi } from "@/lib/auth";
import { deleteFeedbackById } from "@/lib/feedbackRepository";
import { handleRouteError, jsonError, jsonOk } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const unauthorized = await requireAdminApi();
    if (unauthorized) return unauthorized;

    const { id } = await ctx.params;
    const { deleted } = await deleteFeedbackById(id);
    if (!deleted) {
      return jsonError(404, "Feedback not found");
    }
    return jsonOk(200, { message: "Deleted" });
  } catch (e) {
    return handleRouteError(e);
  }
}
