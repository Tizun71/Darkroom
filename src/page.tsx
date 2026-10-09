// Entry for the small static pages: contribute, privacy, terms and 404.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeftIcon, ImageBrokenIcon } from "@phosphor-icons/react";
import Contribute from "./components/Contribute";
import "./index.css";

const PAGES: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy",
    body: [
      "Darkroom is a static website. It has no accounts, no forms, no analytics and sets no cookies.",
      "When you press a copy button, the prompt goes to your own clipboard and nowhere else.",
      "Fonts load from Google Fonts, which receives your IP address as part of a normal web request. The host that serves this site may keep standard access logs."
    ]
  },
  terms: {
    title: "Terms",
    body: [
      "Prompts on this site are shared for learning and remixing. You may copy and adapt them for your own work.",
      "Images remain the work of whoever generated them. Ask the owner before reusing an image itself.",
      "Results from image models vary between runs and tools. The same prompt will not always give the same picture."
    ]
  }
};

function Page({ kind }: { kind: string }) {
  if (kind === "contribute") return <Contribute />;
  const page = PAGES[kind];
  const back = (
    <a
      href="./"
      className="inline-flex items-center gap-2 rounded-lg bg-fg px-3 py-2 text-base font-semibold text-bg transition-colors duration-150 hover:bg-white active:scale-[0.98]"
    >
      <ArrowLeftIcon size={18} aria-hidden="true" /> Back to the gallery
    </a>
  );

  if (!page) {
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
          {back}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-4 py-24">
      <a href="./" className="flex items-center gap-2 text-sm font-semibold">
        <img src="./logo-mark.png" alt="" aria-hidden="true" className="size-6 rounded-md" />
        Darkroom
      </a>
      <h1 className="hero-gradient text-5xl font-semibold tracking-tight">{page.title}</h1>
      <p className="text-sm text-fg-faint">Last updated 25 September 2026</p>
      {page.body.map((p) => (
        <p key={p} className="text-lg text-fg-dim">{p}</p>
      ))}
      <div>{back}</div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page kind={document.body.dataset.page ?? "404"} />
  </StrictMode>
);
