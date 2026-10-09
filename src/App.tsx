import { useCallback, useEffect } from "react";
import { LayoutGroup } from "motion/react";
import works from "virtual:gallery";
import Wall from "./components/Wall";
import Lightbox from "./components/Lightbox";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import { useShareLink } from "./hooks/useShareLink";
import { useGalleryFilter } from "./hooks/useGalleryFilter";

const exists = (id: string) => works.some((w) => w.id === id);

export default function App() {
  const { query, setQuery, tag, setTag, tags, visible, filtered, clear } = useGalleryFilter(works);
  const [openId, setOpenId] = useShareLink(exists);

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

  // Prev/next walk the filtered list when the open work is in it, else the whole gallery
  const sequence = visible.some((w) => w.id === openId) ? visible : works;
  const index = openId ? sequence.findIndex((w) => w.id === openId) : -1;
  const current = index >= 0 ? sequence[index] : null;

  const step = useCallback(
    (dir: number) => {
      const next = sequence[index + dir];
      if (next) setOpenId(next.id);
    },
    [sequence, index, setOpenId]
  );
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);
  const close = useCallback(() => setOpenId(null), [setOpenId]);

  return (
    <LayoutGroup>
      <a
        href="#gallery"
        className="fixed top-2 left-2 z-[60] -translate-y-24 rounded-lg bg-fg px-3 py-2 text-sm font-semibold text-bg focus:translate-y-0"
      >
        Skip to the gallery
      </a>

      <SiteHeader total={works.length} />

      {works.length > 0 && (
        <FilterBar
          query={query}
          onQuery={setQuery}
          tags={tags}
          tag={tag}
          onTag={setTag}
          count={filtered ? visible.length : null}
          total={works.length}
        />
      )}

      <main id="gallery" tabIndex={-1} className="mx-auto max-w-[1600px] px-3 pb-12 outline-none sm:px-6">
        {visible.length > 0 ? <Wall works={visible} onOpen={setOpenId} invite={!filtered} /> : <EmptyState onClear={works.length ? clear : undefined} />}
      </main>

      <SiteFooter />

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
