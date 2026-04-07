import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_MAX_AGE,
  ADMIN_TOKEN_COOKIE,
} from "@/lib/constants";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return secret;
}

export function signAdminJwt(): string {
  return jwt.sign(
    { sub: "admin", role: "admin" },
    getJwtSecret(),
    { expiresIn: ADMIN_SESSION_MAX_AGE }
  );
}

export function verifyAdminJwt(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = jwt.verify(token, getJwtSecret()) as {
      role?: string;
    };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}

/** Attach HTTP-only cookie with JWT (use on login response). */
export function setAdminAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_TOKEN_COOKIE, token, adminCookieOptions());
}

export function clearAdminAuthCookie(response: NextResponse) {
  response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
}

/** For Route Handlers: returns 401 JSON if not authenticated. */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!verifyAdminJwt(token)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}

/** For Server Components / layouts */
export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminJwt(jar.get(ADMIN_TOKEN_COOKIE)?.value);
}
