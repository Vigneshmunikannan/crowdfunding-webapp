import { describe, it, expect } from "vitest";
import { safeStringEqual } from "@/lib/secureCompare";

describe("safeStringEqual", () => {
  it("returns true for identical strings", () => {
    expect(safeStringEqual("admin", "admin")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(safeStringEqual("admin", "admim")).toBe(false);
  });

  it("returns false when lengths differ", () => {
    expect(safeStringEqual("a", "ab")).toBe(false);
  });

  it("handles unicode consistently", () => {
    expect(safeStringEqual("café", "café")).toBe(true);
    expect(safeStringEqual("café", "cafe")).toBe(false);
  });
});
