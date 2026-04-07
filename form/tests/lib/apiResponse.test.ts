import { describe, it, expect, vi, afterEach } from "vitest";
import { ZodError, z } from "zod";
import { jsonError, jsonOk, handleRouteError } from "@/lib/apiResponse";

describe("jsonError / jsonOk", () => {
  it("jsonError sets status and body", async () => {
    const res = jsonError(400, "Bad", { code: "x" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ success: false, message: "Bad", code: "x" });
  });

  it("jsonOk merges success and body", async () => {
    const res = jsonOk(201, { message: "Created" });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ success: true, message: "Created" });
  });
});

describe("handleRouteError", () => {
  const prevEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = prevEnv;
    vi.restoreAllMocks();
  });

  it("maps ZodError to 400", async () => {
    let err: ZodError;
    try {
      z.string().email().parse("nope");
    } catch (e) {
      err = e as ZodError;
    }
    const res = handleRouteError(err!);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Validation failed");
  });

  it("hides internal message in production", async () => {
    process.env.NODE_ENV = "production";
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = handleRouteError(new Error("DB exploded"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe("Internal server error");
  });

  it("shows error message in development", async () => {
    process.env.NODE_ENV = "development";
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = handleRouteError(new Error("Visible in dev"));
    const body = await res.json();
    expect(body.message).toBe("Visible in dev");
  });
});
