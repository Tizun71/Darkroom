// Viewer adapted from the 21st.dev "Masonry Lightbox" modal: portal,
// scroll lock with scrollbar compensation, Escape to close, and the shared
// layoutId spring. Extended with the prompt panel, arrows and focus trap.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeftIcon, ArrowRightIcon, CalendarBlankIcon, CpuIcon, HashIcon, XIcon } from "@phosphor-icons/react";
import type { Work } from "virtual:gallery";
import CopyButton from "./CopyButton";
import { AuthorAvatar, authorLabel } from "./Author";
import PromptText from "./PromptText";
import ExpandableText from "./ExpandableText";
import { formatDate } from "../lib/format";
import { EASE } from "../lib/motion";

type Props = {
  work: Work | null;
  layoutId: string;
  position: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
};

const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

export default function Lightbox({ work, layoutId, position, hasPrev, hasNext, onPrev, onNext, onClose }: Props) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const open = Boolean(work);

  useEffect(() => {
    if (!open) return;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const returnTo = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      window.removeEventListener("keydown", onKey);
      returnTo?.focus({ preventScroll: true });
    };
  }, [open, onClose, onPrev, onNext]);

  const iconButton =
    "grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-surface-2 transition-colors duration-150 hover:bg-surface-3 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

  return createPortal(
    <AnimatePresence>
      {work && (
        <motion.div
          key="viewer"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-2 backdrop-blur-3xl sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewer-title"
            className="mx-auto grid max-w-7xl gap-4 rounded-2xl border border-line bg-surface p-3 sm:p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6"
          >
            <div className="flex items-center justify-between gap-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <button type="button" className={iconButton} onClick={onPrev} disabled={!hasPrev} aria-label="Previous image">
                  <ArrowLeftIcon size={18} aria-hidden="true" />
                </button>
                <button type="button" className={iconButton} onClick={onNext} disabled={!hasNext} aria-label="Next image">
                  <ArrowRightIcon size={18} aria-hidden="true" />
                </button>
                <span className="px-2 text-sm text-fg-faint tabular-nums">{position}</span>
              </div>
              <button ref={closeRef} type="button" className={iconButton} onClick={onClose} aria-label="Close">
                <XIcon size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="grid place-items-center overflow-hidden rounded-lg bg-bg lg:sticky lg:top-0 lg:self-start">
              <motion.img
                layoutId={layoutId}
                src={work.src}
                alt={work.title}
                transition={reduced ? { duration: 0 } : SPRING}
                className="block h-auto max-h-[40vh] w-auto max-w-full lg:max-h-[78vh]"
              />
            </div>

            <motion.aside
              key={work.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
              className="grid content-start gap-4 lg:gap-6"
            >
              <div className="grid gap-3">
                <h2 id="viewer-title" className="text-2xl font-semibold tracking-tight lg:text-3xl">{work.title}</h2>
                <ul className="flex flex-wrap gap-2 text-xs text-fg-dim">
                  {work.model && (
                    <li className="inline-flex items-center gap-1 rounded-full border border-surface-3 bg-surface-2 px-3 py-1">
                      <CpuIcon size={14} aria-hidden="true" /> {work.model}
                    </li>
                  )}
                  {work.date && (
                    <li className="inline-flex items-center gap-1 rounded-full border border-surface-3 bg-surface-2 px-3 py-1">
                      <CalendarBlankIcon size={14} aria-hidden="true" /> {formatDate(work.date)}
                    </li>
                  )}
                  {work.author && (
                    <li>
                      <a
                        href={work.author.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-surface-3 bg-surface-2 py-0.5 pr-3 pl-1 transition-colors duration-150 hover:text-fg"
                      >
                        <AuthorAvatar author={work.author} size={20} /> {authorLabel(work.author)}
                      </a>
                    </li>
                  )}
                  {work.tags.map((t) => (
                    <li key={t} className="inline-flex items-center gap-1 rounded-full border border-surface-3 bg-surface-2 px-3 py-1">
                      <HashIcon size={14} aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <section aria-label="Prompt" className="grid gap-3 rounded-xl border border-surface-3 bg-surface-2 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-fg-dim">Prompt</h3>
                  <CopyButton value={work.prompt} label="Copy" errorLabel="Failed" size="sm" variant="solid" />
                </div>
                <ExpandableText resetKey={work.id}>
                  <p className="text-base text-fg select-text">
                    <PromptText text={work.prompt} />
                  </p>
                </ExpandableText>
              </section>

              {work.negative && (
                <section aria-label="Negative prompt" className="grid gap-3 rounded-xl border border-surface-3 bg-surface-2 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-fg-dim">Negative prompt</h3>
                    <CopyButton value={work.negative} label="Copy" errorLabel="Failed" size="sm" />
                  </div>
                  <ExpandableText resetKey={work.id} collapsedHeight={120}>
                    <p className="text-base text-fg select-text">{work.negative}</p>
                  </ExpandableText>
                </section>
              )}

              <div>
                <CopyButton
                  value={`${window.location.origin}${window.location.pathname}#/${work.id}`}
                  label="Copy share link"
                  copiedLabel="Link copied"
                  size="sm"
                />
              </div>
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
