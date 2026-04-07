"use client";

import { useEffect } from "react";

/**
 * Scrolls to `#feedback` after redirect from `/feedback` or when opening `/#feedback`.
 */
export function ScrollToFeedbackAnchor() {
  useEffect(() => {
    function scrollToForm() {
      document.getElementById("feedback")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    if (typeof window === "undefined") return;

    if (sessionStorage.getItem("scrollToFeedback") === "1") {
      sessionStorage.removeItem("scrollToFeedback");
      const t = window.setTimeout(scrollToForm, 120);
      return () => window.clearTimeout(t);
    }

    if (window.location.hash === "#feedback") {
      const t = window.setTimeout(scrollToForm, 120);
      return () => window.clearTimeout(t);
    }
  }, []);

  return null;
}
