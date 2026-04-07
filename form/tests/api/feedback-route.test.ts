import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { clearRateLimitStore } from "@/lib/rateLimit";

vi.mock("@/lib/feedbackRepository", () => ({
  createFeedback: vi.fn(),
}));

import { POST } from "@/app/api/feedback/route";
import { createFeedback } from "@/lib/feedbackRepository";

const mockCreate = vi.mocked(createFeedback);

function postReq(
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimitStore();
    mockCreate.mockResolvedValue({} as never);
  });

  it("returns 201 when valid", async () => {
    const res = await POST(
      postReq({
        name: "Test",
        email: "t@example.com",
        message: "1234567890",
      })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("returns 400 for invalid JSON object", async () => {
    const res = await POST(postReq("null", {}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for validation errors", async () => {
    const res = await POST(
      postReq({
        name: "",
        email: "bad",
        message: "short",
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errors).toBeDefined();
  });

  it("returns 429 when createFeedback throws duplicate", async () => {
    mockCreate.mockRejectedValue(
      Object.assign(new Error("Duplicate"), { statusCode: 429 })
    );
    const res = await POST(
      postReq({
        name: "Test",
        email: "t@example.com",
        message: "1234567890",
      })
    );
    expect(res.status).toBe(429);
  });

  it("rate limits after many requests from same IP", async () => {
    const body = {
      name: "A",
      email: "a@b.co",
      message: "1234567890",
    };
    for (let i = 0; i < 8; i++) {
      const res = await POST(postReq(body));
      expect(res.status).toBe(201);
    }
    const blocked = await POST(postReq(body));
    expect(blocked.status).toBe(429);
    const json = await blocked.json();
    expect(json.retryAfterSec).toBeDefined();
  });
});
