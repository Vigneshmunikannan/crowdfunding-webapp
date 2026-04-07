import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackForm } from "@/components/FeedbackForm";

describe("FeedbackForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          message: "Thank you — your feedback was received.",
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows validation hints for empty submit", async () => {
    const user = userEvent.setup();
    const { container } = render(<FeedbackForm />);
    const formRoot = container.querySelector("#feedback")!;
    const submit = within(formRoot).getByRole("button", {
      name: /submit feedback/i,
    });
    await user.click(submit);
    expect(
      await within(formRoot).findByText(/name is required/i)
    ).toBeInTheDocument();
  });

  it("submits valid data and shows success", async () => {
    const user = userEvent.setup();
    const { container } = render(<FeedbackForm />);
    const formRoot = container.querySelector("#feedback")!;
    await user.type(
      within(formRoot).getByLabelText(/name/i),
      "Sam"
    );
    await user.type(
      within(formRoot).getByLabelText(/^email/i),
      "sam@example.com"
    );
    await user.type(
      within(formRoot).getByLabelText(/message/i),
      "This is ten chars min"
    );
    await user.click(
      within(formRoot).getByRole("button", { name: /submit feedback/i })
    );

    await waitFor(() => {
      expect(within(formRoot).getByRole("status")).toBeInTheDocument();
    });
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/feedback",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    const call = vi.mocked(fetch).mock.calls[0];
    const init = call[1] as RequestInit;
    expect(JSON.parse(init.body as string)).toMatchObject({
      name: "Sam",
      email: "sam@example.com",
    });
  });
});
