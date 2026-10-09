import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGroup } from "motion/react";
import { GithubLogoIcon, ImageBrokenIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import works from "virtual:gallery";
import Wall from "./components/Wall";
import Lightbox from "./components/Lightbox";
import { REPO_URL } from "./config";

const idFromHash = () => {
  const m = /^#\/(.+)$/.exec(window.location.hash);
  return m ? decodeURIComponent(m[1]) : null;
};
const exists = (id: string | null) => Boolean(id && works.some((w) => w.id === id));

export default function App() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(() => (exists(idFromHash()) ? idFromHash() : null));

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    works.forEach((w) => w.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return works.filter((w) => {
      if (tag && !w.tags.includes(tag)) return false;
      if (!q) return true;
      return [w.title, w.prompt, w.negative, w.model, w.author?.name ?? "", ...w.tags].join(" ").toLowerCase().includes(q);
    });
  }, [query, tag]);

  // Share links: #/<id> opens that work
  useEffect(() => {
    if (openId && window.location.hash !== `#/${openId}`) history.replaceState(null, "", `#/${openId}`);
    if (!openId && idFromHash()) history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [openId]);

  useEffect(() => {
    const onHash = () => {
      const id = idFromHash();
      if (exists(id)) setOpenId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // "/" focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (e.key !== "/" || openId || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      document.getElementById("search")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const sequence = visible.some((w) => w.id === openId) ? visible : works;
  const index = openId ? sequence.findIndex((w) => w.id === openId) : -1;
  const current = index >= 0 ? sequence[index] : null;

  const step = useCallback(
    (dir: number) => {
      const next = sequence[index + dir];
      if (next) setOpenId(next.id);
    },
    [sequence, index]
  );
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);
  const close = useCallback(() => setOpenId(null), []);

  const clear = () => {
    setQuery("");
    setTag(null);
  };
  const filtered = Boolean(query.trim() || tag);

  // Tag chips form one tab stop; arrow keys move between them
  const onChipKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    const chips = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-chip]")];
    const i = chips.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    const n =
      e.key === "Home" ? 0 : e.key === "End" ? chips.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + chips.length) % chips.length;
    chips.forEach((c, k) => (c.tabIndex = k === n ? 0 : -1));
    chips[n].focus();
    chips[n].scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const chip = (active: boolean) =>
    `inline-flex h-11 shrink-0 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150 active:scale-[0.98] sm:h-9 ${
      active ? "border-fg bg-fg text-bg" : "border-line text-fg-dim hover:bg-surface-2 hover:text-fg"
    }`;

  return (
    <LayoutGroup>
      <a
        href="#gallery"
        className="fixed top-2 left-2 z-[60] -translate-y-24 rounded-lg bg-fg px-3 py-2 text-sm font-semibold text-bg focus:translate-y-0"
      >
        Skip to the gallery
      </a>

      <header className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-3 pt-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <h1 className="flex shrink-0 items-center gap-2 text-base font-semibold">
            <img src="./logo-mark.png" alt="" aria-hidden="true" className="size-6 rounded-md" />
            Darkroom
          </h1>
          <p className="text-sm text-fg-dim">Open source AI image prompts. Open an image to copy its prompt.</p>
        </div>
        <nav aria-label="Project" className="flex shrink-0 items-center gap-1">
          <a
            href="./contribute.html"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-fg transition-colors duration-150 hover:bg-surface-2 sm:h-9"
          >
            <PlusIcon size={16} aria-hidden="true" /> Add your prompt
          </a>
          {REPO_URL && (
            <a
              href={REPO_URL}
              aria-label="GitHub repository"
              className="inline-flex size-11 items-center justify-center rounded-lg text-fg-dim transition-colors duration-150 hover:bg-surface-2 hover:text-fg sm:size-9"
            >
              <GithubLogoIcon size={18} aria-hidden="true" />
            </a>
          )}
        </nav>
      </header>

      {works.length > 0 && (
        <div className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-3 sm:items-start sm:gap-3 sm:px-6">
            <label className="flex h-11 w-36 shrink-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-fg-faint transition-colors duration-150 focus-within:border-fg-dim sm:h-9 sm:w-72">
              <MagnifyingGlassIcon size={16} aria-hidden="true" />
              <span className="sr-only">Search prompts</span>
              <input
                id="search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                placeholder="Search"
                autoComplete="off"
                className="w-full bg-transparent text-base text-fg placeholder:text-fg-faint focus:outline-none sm:text-sm"
              />
              <kbd aria-hidden="true" className="hidden rounded border border-line px-1 text-xs sm:inline">/</kbd>
            </label>
            <div
              role="group"
              aria-label="Filter by tag"
              onKeyDown={onChipKey}
              className="-mr-3 -my-1 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 pr-6 [mask-image:linear-gradient(to_right,black_80%,transparent)] [scrollbar-width:none] sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
            >
              <button type="button" data-chip aria-pressed={tag === null} tabIndex={tag === null ? 0 : -1} onClick={() => setTag(null)} className={chip(tag === null)}>
                All
              </button>
              {tags.map((t) => (
                <button key={t} type="button" data-chip aria-pressed={tag === t} tabIndex={tag === t ? 0 : -1} onClick={() => setTag(tag === t ? null : t)} className={chip(tag === t)}>
                  {t}
                </button>
              ))}
            </div>
            {filtered && (
              <p role="status" className="sr-only shrink-0 self-center text-sm text-fg-faint tabular-nums sm:not-sr-only sm:ml-auto">
                {visible.length} of {works.length}
              </p>
            )}
          </div>
        </div>
      )}

      <main id="gallery" tabIndex={-1} className="mx-auto max-w-[1600px] px-3 pb-12 outline-none sm:px-6">
        {visible.length > 0 ? (
          <Wall works={visible} onOpen={setOpenId} />
        ) : (
          <div className="mx-auto mt-12 grid max-w-md justify-items-center gap-3 rounded-2xl border border-surface-3 bg-surface px-6 py-12 text-center">
            <ImageBrokenIcon size={32} className="text-fg-faint" aria-hidden="true" />
            {works.length ? (
              <>
                <h2 className="text-lg font-semibold">No prompts match that search</h2>
                <button
                  type="button"
                  onClick={clear}
                  className="h-11 cursor-pointer rounded-lg border border-line bg-surface-2 px-3 text-base font-semibold transition-colors duration-150 hover:bg-surface-3 active:scale-[0.98]"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">No images yet</h2>
                <p className="text-sm text-fg-dim">
                  Add <code className="text-fg">harbor.jpg</code> and <code className="text-fg">harbor.md</code> to the{" "}
                  <code className="text-fg">content</code> folder. The prompt goes in the text file.
                </p>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="mx-auto grid max-w-[1600px] gap-2 px-3 pb-8 text-sm text-fg-faint sm:px-6">
        <p>
          Flags like <code className="text-fg-dim">--ar 4:5</code> only work in Midjourney. Delete them for other tools. Paste negative prompts
          into the separate negative prompt field.
        </p>
        <p className="flex flex-wrap items-center gap-x-4">
          <span>Prompts are free to copy and remix. Images belong to their creators.</span>
          <a href="./contribute.html" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-fg sm:min-h-0">Contribute</a>
          <a href="./privacy.html" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-fg sm:min-h-0">Privacy</a>
          <a href="./terms.html" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-fg sm:min-h-0">Terms</a>
        </p>
      </footer>

      <Lightbox
        work={current}
        layoutId={`work-${openId}`}
        position={current ? `${index + 1} of ${sequence.length}` : ""}
        hasPrev={index > 0}
        hasNext={index >= 0 && index < sequence.length - 1}
        onPrev={prev}
        onNext={next}
        onClose={close}
      />
    </LayoutGroup>
  );
}
