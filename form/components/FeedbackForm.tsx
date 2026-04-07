"use client";

import { useState } from "react";
import { feedbackBodySchema } from "@/lib/validation/feedback";

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const inputClass =
  "mt-2 w-full min-h-11 rounded-xl border border-zinc-200/90 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none transition " +
  "placeholder:text-zinc-400 focus:border-teal-500/80 focus:ring-2 focus:ring-teal-500/25 " +
  "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-500/20 sm:min-h-10 sm:text-sm";

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateClient(): boolean {
    const parsed = feedbackBodySchema.safeParse({ name, email, message });
    if (parsed.success) {
      setFieldErrors({});
      return true;
    }
    const flat = parsed.error.flatten().fieldErrors;
    setFieldErrors({
      name: flat.name?.[0],
      email: flat.email?.[0],
      message: flat.message?.[0],
    });
    return false;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccess(null);
    if (!validateClient()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setSuccess(
          typeof data.message === "string"
            ? data.message
            : "Thank you — your feedback was received."
        );
        setName("");
        setEmail("");
        setMessage("");
        setFieldErrors({});
        return;
      }

      if (res.status === 400 && data.errors) {
        const err = data.errors as Record<string, string[] | undefined>;
        setFieldErrors({
          name: err.name?.[0],
          email: err.email?.[0],
          message: err.message?.[0],
        });
        setServerError(
          typeof data.message === "string" ? data.message : "Please fix the form."
        );
        return;
      }

      setServerError(
        typeof data.message === "string"
          ? data.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="feedback"
      className="scroll-mt-8 rounded-2xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-teal-950/10 ring-1 ring-zinc-200/80 backdrop-blur-md sm:rounded-3xl sm:p-8 lg:p-10"
    >
      {success ? (
        <div
          className="mb-6 flex gap-3 rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4 sm:p-5"
          role="status"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg text-white shadow-md shadow-teal-600/25"
            aria-hidden
          >
            ✓
          </span>
          <div>
            <p className="font-medium text-teal-950">Message received</p>
            <p className="mt-1 text-sm text-teal-900/90">{success}</p>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6" noValidate>
        {serverError && !success ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {serverError}
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div className="sm:col-span-1">
            <label
              htmlFor="home-feedback-name"
              className="text-sm font-medium text-zinc-800"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="home-feedback-name"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "home-name-err" : undefined}
            />
            {fieldErrors.name ? (
              <p id="home-name-err" className="mt-1.5 text-sm text-red-600">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-1">
            <label
              htmlFor="home-feedback-email"
              className="text-sm font-medium text-zinc-800"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="home-feedback-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "home-email-err" : undefined
              }
            />
            {fieldErrors.email ? (
              <p id="home-email-err" className="mt-1.5 text-sm text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="home-feedback-message"
            className="text-sm font-medium text-zinc-800"
          >
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="home-feedback-message"
            name="message"
            rows={5}
            placeholder="What’s on your mind? (at least 10 characters)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} min-h-[140px] resize-y sm:min-h-[160px]`}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={
              fieldErrors.message ? "home-msg-err" : "home-msg-hint"
            }
          />
          {fieldErrors.message ? (
            <p id="home-msg-err" className="mt-1.5 text-sm text-red-600">
              {fieldErrors.message}
            </p>
          ) : (<></>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden
              />
              Sending…
            </span>
          ) : (
            "Submit feedback"
          )}
        </button>
      </form>
    </div>
  );
}
