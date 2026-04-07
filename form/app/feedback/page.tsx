"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Form lives on `/`. Session flag lets the home page scroll to the card after navigation. */
export default function FeedbackRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    sessionStorage.setItem("scrollToFeedback", "1");
    router.replace("/");
  }, [router]);
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-zinc-950 px-4 text-sm text-zinc-400">
      Taking you to the feedback form…
    </div>
  );
}
