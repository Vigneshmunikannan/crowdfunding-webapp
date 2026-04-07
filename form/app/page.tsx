import { FeedbackForm } from "@/components/FeedbackForm";
import { ScrollToFeedbackAnchor } from "@/components/ScrollToFeedbackAnchor";

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-x-clip font-sans text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 home-bg-base"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 home-bg-mesh"
        aria-hidden
      />
      <div
        className="home-bg-blob home-bg-blob--a pointer-events-none absolute -left-32 top-[15%] h-[22rem] w-[22rem] rounded-full bg-teal-400/15 blur-3xl sm:h-96 sm:w-96 motion-reduce:opacity-60"
        aria-hidden
      />
      <div
        className="home-bg-blob home-bg-blob--b pointer-events-none absolute -right-24 top-[40%] h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl sm:h-96 sm:w-96 motion-reduce:opacity-60"
        aria-hidden
      />
      <div
        className="home-bg-blob home-bg-blob--c pointer-events-none absolute bottom-[5%] left-[20%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl motion-reduce:opacity-60"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 home-bg-grid" aria-hidden />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <ScrollToFeedbackAnchor />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-4 py-12 sm:gap-8 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Building full stack applications using AI tools
            </h1>
            <h2
              id="feedback-heading"
              className="text-lg font-semibold text-teal-300 sm:text-xl"
            >
              Feedback form
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              Tell us what works, what doesn’t, or what you’d love to see next.
              We read every submission.
            </p>
          </div>
          <section
            className="w-full max-w-xl"
            aria-labelledby="feedback-heading"
          >
            <FeedbackForm />
          </section>
        </main>
      </div>
    </div>
  );
}
