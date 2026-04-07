"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type FeedbackRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string | null;
};

export function FeedbackTable({ rows }: { rows: FeedbackRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setError(null);
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Could not delete entry"
        );
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">Feedback inbox</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Log out
        </button>
      </div>
      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No submissions yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="align-top hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    <a
                      href={`mailto:${encodeURIComponent(r.email)}`}
                      className="text-teal-700 underline-offset-2 hover:underline"
                    >
                      {r.email}
                    </a>
                  </td>
                  <td className="max-w-md px-4 py-3 whitespace-pre-wrap text-zinc-700">
                    {r.message}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={pendingId === r.id}
                      onClick={() => remove(r.id)}
                      className="rounded-lg px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {pendingId === r.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
