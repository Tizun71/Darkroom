import type React from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

type Props = {
  query: string;
  onQuery: (q: string) => void;
  tags: string[];
  tag: string | null;
  onTag: (t: string | null) => void;
  /** Shown as "<count> of <total>" while a filter is active */
  count: number | null;
  total: number;
};

const chip = (active: boolean) =>
  `inline-flex h-11 shrink-0 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150 active:scale-[0.98] sm:h-9 ${
    active ? "border-fg bg-fg text-bg" : "border-line text-fg-dim hover:bg-surface-2 hover:text-fg"
  }`;

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

// Sticky search box and tag chips above the gallery
export default function FilterBar({ query, onQuery, tags, tag, onTag, count, total }: Props) {
  return (
    <div className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-3 sm:items-start sm:gap-3 sm:px-6">
        <label className="flex h-11 w-36 shrink-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-fg-faint transition-colors duration-150 focus-within:border-fg-dim sm:h-9 sm:w-72">
          <MagnifyingGlassIcon size={16} aria-hidden="true" />
          <span className="sr-only">Search prompts</span>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onQuery("")}
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
          <button type="button" data-chip aria-pressed={tag === null} tabIndex={tag === null ? 0 : -1} onClick={() => onTag(null)} className={chip(tag === null)}>
            All
          </button>
          {tags.map((t) => (
            <button key={t} type="button" data-chip aria-pressed={tag === t} tabIndex={tag === t ? 0 : -1} onClick={() => onTag(tag === t ? null : t)} className={chip(tag === t)}>
              {t}
            </button>
          ))}
        </div>
        {count !== null && (
          <p role="status" className="sr-only shrink-0 self-center text-sm text-fg-faint tabular-nums sm:not-sr-only sm:ml-auto">
            {count} of {total}
          </p>
        )}
      </div>
    </div>
  );
}
