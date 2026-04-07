import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(
  status: number,
  message: string,
  extras?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: false, message, ...extras },
    { status }
  );
}

export function jsonOk<T extends Record<string, unknown>>(
  status: number,
  body: T
) {
  return NextResponse.json({ success: true, ...body }, { status });
}

export function handleRouteError(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError(400, "Validation failed", {
      errors: err.flatten().fieldErrors,
    });
  }
  console.error("[api]", err);
  const isProd = process.env.NODE_ENV === "production";
  return jsonError(
    500,
    isProd ? "Internal server error" : (err as Error).message
  );
}
