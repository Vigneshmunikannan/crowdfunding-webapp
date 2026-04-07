"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Sign-in failed"
        );
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Admin sign in</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Credentials are configured via environment variables (never committed).
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="user" className="text-sm font-medium text-zinc-700">
            Username
          </label>
          <input
            id="user"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            required
          />
        </div>
        <div>
          <label htmlFor="pass" className="text-sm font-medium text-zinc-700">
            Password
          </label>
          <input
            id="pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Link
        href="/#feedback"
        className="mt-6 text-center text-sm text-teal-700 hover:underline"
      >
        ← Public feedback form
      </Link>
    </div>
  );
}
