import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";

type Props = {
  children: ReactNode;
  /** Collapsed height in px. Text shorter than this shows in full with no button. */
  collapsedHeight?: number;
  /** Changing this collapses the text again, e.g. when the viewer moves to another image */
  resetKey?: string;
  className?: string;
};

// Long text is clipped with a fade and a "Show full prompt" button, so the layout never stretches
export default function ExpandableText({ children, collapsedHeight = 240, resetKey, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => setExpanded(false), [resetKey]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > collapsedHeight + 24);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedHeight, resetKey]);

  const clipped = overflows && !expanded;

  return (
    <div className="grid gap-2">
      <div
        id={id}
        ref={ref}
        className={`overflow-hidden ${className}`}
        style={
          clipped
            ? {
                maxHeight: collapsedHeight,
                maskImage: "linear-gradient(to bottom, black 70%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent)"
              }
            : undefined
        }
      >
        {children}
      </div>
      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex h-11 cursor-pointer items-center gap-1 justify-self-start rounded-lg px-2 text-sm font-semibold text-fg-dim transition-colors duration-150 hover:bg-surface-3 hover:text-fg sm:h-9"
        >
          {expanded ? "Show less" : "Show full prompt"}
          <CaretDownIcon size={16} aria-hidden="true" className={`transition-transform duration-150 ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
