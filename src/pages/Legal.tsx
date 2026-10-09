import Brand from "../components/Brand";
import BackLink from "../components/BackLink";

export const LEGAL = {
  privacy: {
    title: "Privacy",
    updated: "25 September 2026",
    body: [
      "Darkroom is a static website. It has no accounts, no forms, no analytics and sets no cookies.",
      "When you press a copy button, the prompt goes to your own clipboard and nowhere else.",
      "Fonts load from Google Fonts, which receives your IP address as part of a normal web request. The host that serves this site may keep standard access logs."
    ]
  },
  terms: {
    title: "Terms",
    updated: "9 October 2026",
    body: [
      "Images and prompts on this site are shared under the Creative Commons Attribution 4.0 license (CC BY 4.0). You may copy, adapt and reuse them, including commercially, as long as you credit the creator and link to the license.",
      "Each image remains the work of the contributor named on it. The site's source code is under the MIT License.",
      "Results from image models vary between runs and tools. The same prompt will not always give the same picture."
    ]
  }
} as const;

export type LegalKind = keyof typeof LEGAL;

export default function Legal({ kind }: { kind: LegalKind }) {
  const page = LEGAL[kind];
  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-4 py-24">
      <a href="./" className="flex items-center gap-2 text-sm font-semibold">
        <Brand />
      </a>
      <h1 className="hero-gradient text-5xl font-semibold tracking-tight">{page.title}</h1>
      <p className="text-sm text-fg-faint">Last updated {page.updated}</p>
      {page.body.map((p) => (
        <p key={p} className="text-lg text-fg-dim">{p}</p>
      ))}
      <div>
        <BackLink />
      </div>
    </main>
  );
}
