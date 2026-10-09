// Adapted from 21st.dev "Copy Button" by ddoemonn:
// idle / copied / error states, crossfading labels, clipboard fallback,
// reduced motion support. Icons swapped to Phosphor.
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckIcon, CopyIcon, WarningIcon } from "@phosphor-icons/react";

const CROSSFADE = { duration: 0.15, ease: [0.32, 0.72, 0, 1] } as const;
const INSTANT = { duration: 0 } as const;

export type CopyStatus = "idle" | "copied" | "error";

function writeFallback(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  Object.assign(area.style, { position: "fixed", top: "0", left: "0", opacity: "0" });
  // Inside a modal, append to it so focus trapping does not block the copy
  (document.querySelector("[aria-modal='true']") ?? document.body).appendChild(area);
  const selection = document.getSelection();
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  if (selection && previous) {
    selection.removeAllRanges();
    selection.addRange(previous);
  }
  return ok;
}

export function useCopyToClipboard(timeout = 2000) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [ticket, setTicket] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    if (!text) return false;
    let ok = false;
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = writeFallback(text);
      }
    } catch {
      ok = writeFallback(text);
    }
    if (!mounted.current) return ok;
    setStatus(ok ? "copied" : "error");
    setTicket((t) => t + 1);
    return ok;
  }, []);

  useEffect(() => {
    if (ticket === 0 || status === "idle") return;
    const id = setTimeout(() => setStatus("idle"), timeout);
    return () => clearTimeout(id);
  }, [ticket, status, timeout]);

  return { copy, status };
}

type Props = {
  value: string;
  label?: string;
  copiedLabel?: string;
  errorLabel?: string;
  variant?: "solid" | "ghost";
  size?: "md" | "sm";
  /** Accessible name when the visible label is short, e.g. "Copy prompt for Night tram" */
  ariaLabel?: string;
  className?: string;
};

export function CopyButton({
  value,
  label = "Copy prompt",
  copiedLabel = "Copied",
  errorLabel = "Copy failed",
  variant = "ghost",
  size = "md",
  ariaLabel,
  className = ""
}: Props) {
  const { copy, status } = useCopyToClipboard();
  const reduced = useReducedMotion();
  const fade = reduced ? INSTANT : CROSSFADE;

  const labels: Array<[CopyStatus, string]> = [
    ["idle", label],
    ["copied", copiedLabel],
    ["error", errorLabel]
  ];
  const icons = [
    ["idle", CopyIcon],
    ["copied", CheckIcon],
    ["error", WarningIcon]
  ] as const;

  const tone =
    status === "copied"
      ? "border-accent bg-accent text-bg"
      : status === "error"
        ? "border-danger bg-surface-2 text-danger"
        : variant === "solid"
          ? "border-fg bg-fg text-bg hover:bg-white"
          : "border-line bg-surface-2 text-fg hover:bg-surface-3";

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        void copy(value);
      }}
      className={`inline-flex cursor-pointer select-none items-center justify-center gap-2 overflow-hidden min-h-11 rounded-lg border px-3 py-2 font-semibold transition-colors duration-150 ease-fluid active:scale-[0.98] sm:min-h-9 ${
        size === "sm" ? "text-sm" : "text-base"
      } ${tone} ${className}`}
    >
      <span className="grid shrink-0 place-items-center" aria-hidden="true">
        {icons.map(([key, Icon]) => (
          <motion.span
            key={key}
            className="col-start-1 row-start-1 grid"
            initial={false}
            animate={{ opacity: status === key ? 1 : 0, scale: status === key ? 1 : 0.6 }}
            transition={fade}
          >
            <Icon size={size === "sm" ? 16 : 18} weight={key === "idle" ? "regular" : "bold"} />
          </motion.span>
        ))}
      </span>

      <span aria-hidden="true" className="relative grid">
        {labels.map(([key, text]) => (
          <motion.span
            key={key}
            initial={false}
            animate={key === status ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 4, filter: "blur(4px)" }}
            transition={fade}
            className="col-start-1 row-start-1 whitespace-nowrap text-center"
          >
            {text}
          </motion.span>
        ))}
      </span>

      <span className="sr-only">{label}</span>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? `${label.replace(/^Copy /, "")} copied to clipboard` : status === "error" ? "Copy failed. Select the text and press Ctrl+C." : ""}
      </span>
    </motion.button>
  );
}

export default CopyButton;
