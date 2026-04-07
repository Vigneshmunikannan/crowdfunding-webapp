import { NextRequest, NextResponse } from "next/server";
import { feedbackBodySchema } from "@/lib/validation/feedback";
import { createFeedback } from "@/lib/feedbackRepository";
import { handleRouteError, jsonError, jsonOk } from "@/lib/apiResponse";
import { rateLimitWithEviction } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * POST /api/feedback — public, rate-limited, validated, persisted.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimitWithEviction(`feedback:${ip}`, 8, 15 * 60 * 1000);
    if (!rl.ok) {
      return jsonError(429, "Too many submissions. Try again later.", {
        retryAfterSec: rl.retryAfterSec,
      });
    }

    const json = await req.json().catch(() => null);
    if (!json || typeof json !== "object") {
      return jsonError(400, "Invalid JSON body");
    }

    const parsed = feedbackBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await createFeedback(parsed.data);
    return jsonOk(201, { message: "Thank you — your feedback was received." });
  } catch (e) {
    const err = e as Error & { statusCode?: number };
    if (err.statusCode === 429) {
      return jsonError(429, err.message);
    }
    return handleRouteError(e);
  }
}
