import { describe, it, expect } from "vitest";
import {
  feedbackBodySchema,
  adminLoginSchema,
} from "@/lib/validation/feedback";

describe("feedbackBodySchema", () => {
  it("accepts valid payload", () => {
    const r = feedbackBodySchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      message: "Great workshop, thanks!",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("ada@example.com");
      expect(r.data.name).toBe("Ada");
    }
  });

  it("rejects short message", () => {
    const r = feedbackBodySchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      message: "short",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = feedbackBodySchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      message: "Ten chars ok",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty name", () => {
    const r = feedbackBodySchema.safeParse({
      name: "   ",
      email: "a@b.co",
      message: "1234567890",
    });
    expect(r.success).toBe(false);
  });

  it("trims strings", () => {
    const r = feedbackBodySchema.safeParse({
      name: "  Bob  ",
      email: "  bob@example.com  ",
      message: "  hello world ten  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Bob");
      expect(r.data.email).toBe("bob@example.com");
      expect(r.data.message).toBe("hello world ten");
    }
  });
});

describe("adminLoginSchema", () => {
  it("accepts username and password", () => {
    const r = adminLoginSchema.safeParse({
      username: "admin",
      password: "secret",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty username", () => {
    const r = adminLoginSchema.safeParse({ username: "", password: "x" });
    expect(r.success).toBe(false);
  });
});
