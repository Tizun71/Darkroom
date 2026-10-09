import { ImageBrokenIcon } from "@phosphor-icons/react";
import BackLink from "../components/BackLink";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-4 text-center">
      <div className="grid justify-items-center gap-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-fg-dim">
          <ImageBrokenIcon size={16} className="text-accent" aria-hidden="true" /> Error 404
        </span>
        <h1 className="hero-gradient max-w-[680px] text-5xl font-semibold tracking-tight md:text-6xl">
          This frame
          <br />
          was never rendered
        </h1>
        <p className="max-w-[680px] text-lg text-fg-dim">The page you asked for does not exist. The prompts are still where you left them.</p>
        <BackLink />
      </div>
    </main>
  );
}
