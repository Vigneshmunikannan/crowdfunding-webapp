import { NextResponse } from "next/server";
import { clearAdminAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Signed out" });
  clearAdminAuthCookie(res);
  return res;
}
