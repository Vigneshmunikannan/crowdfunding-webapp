import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison when lengths match.
 * Length mismatch returns false immediately (minor timing leak vs full constant-time).
 * Production: prefer env-stored password hash + bcrypt/scrypt.compare.
 */
export function safeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
