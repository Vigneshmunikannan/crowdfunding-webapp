import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation/feedback";
import { safeStringEqual } from "@/lib/secureCompare";
import {
  setAdminAuthCookie,
  signAdminJwt,
} from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/apiResponse";
import { rateLimitWithEviction } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimitWithEviction(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.ok) {
      return jsonError(429, "Too many attempts. Try again later.");
    }

    const json = await req.json().catch(() => null);
    const parsed = adminLoginSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, "Invalid credentials");
    }

    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    if (!envUser || !envPass) {
      console.error("ADMIN_USERNAME / ADMIN_PASSWORD not configured");
      return jsonError(500, "Server configuration error");
    }

    const userOk = safeStringEqual(parsed.data.username, envUser);
    const passOk = safeStringEqual(parsed.data.password, envPass);

    if (!userOk || !passOk) {
      // Same response shape/timing as far as practical
      return jsonError(401, "Invalid username or password");
    }

    const token = signAdminJwt();
    const res = NextResponse.json(
      { success: true, message: "Signed in" },
      { status: 200 }
    );
    setAdminAuthCookie(res, token);
    return res;
  } catch (e) {
    return handleRouteError(e);
  }
}
