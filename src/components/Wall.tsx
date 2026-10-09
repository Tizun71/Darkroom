// Masonry layout adapted from 21st.dev "Masonry Lightbox" by ayushmxxn:
// CSS columns, intrinsic image proportions, shared layoutId into the viewer.
// Each tile is the image with its model and contributor. Copying happens in the viewer.
import { useState } from "react";
import { motion } from "motion/react";
import { ImageBrokenIcon, PlusIcon } from "@phosphor-icons/react";
import type { Work } from "virtual:gallery";
import { AuthorAvatar, authorLabel } from "./Author";

type Props = { works: Work[]; onOpen: (id: string) => void; invite?: boolean };

function Tile({ work, eager, onOpen }: { work: Work; eager: boolean; onOpen: () => void }) {
  const [state, setState] = useState<"loading" | "ready" | "broken">("loading");
  const ratio = work.width && work.height ? `${work.width} / ${work.height}` : "4 / 5";
  const author = work.author;
  const badge = "min-w-0 truncate rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-md";

  return (
    <li className="relative mb-2 break-inside-avoid sm:mb-3">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${work.title}${author ? ` by ${authorLabel(author)}` : ""} to read and copy the prompt`}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-3"
        style={{ aspectRatio: ratio }}
      >
        {state === "loading" && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-surface-3" />}
        {state === "broken" ? (
          <span className="absolute inset-0 grid place-items-center content-center gap-2 p-3 text-center text-xs text-fg-faint">
            <ImageBrokenIcon size={24} aria-hidden="true" />
            Image missing in content
          </span>
        ) : (
          <motion.img
            layoutId={`work-${work.id}`}
            src={work.src}
            alt={work.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setState("ready")}
            onError={() => setState("broken")}
            className={`block h-full w-full object-cover transition-opacity duration-150 ${state === "ready" ? "opacity-100" : "opacity-0"}`}
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent p-3 pb-8 text-left text-sm font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {work.title}
        </span>
        {(work.model || author) && (
          <span className="absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">
            {work.model && <span className={`${badge} max-w-full`}>{work.model}</span>}
            {author && (
              <span className={`${badge} inline-flex max-w-full items-center gap-1.5 py-1 pl-1`}>
                <AuthorAvatar author={author} size={16} />
                <span className="truncate">{authorLabel(author)}</span>
              </span>
            )}
          </span>
        )}
      </button>
    </li>
  );
}

// Last tile of the unfiltered gallery: points visitors to the contribute guide
function InviteTile() {
  return (
    <li className="mb-2 break-inside-avoid sm:mb-3">
      <a
        href="./contribute.html"
        className="grid aspect-[4/5] content-center justify-items-center gap-3 rounded-lg border border-dashed border-line p-4 text-center text-fg-dim transition-colors duration-150 hover:border-fg-dim hover:bg-surface hover:text-fg"
      >
        <PlusIcon size={28} aria-hidden="true" />
        <span className="text-base font-semibold text-fg">Add your prompt</span>
        <span className="text-sm">Share an image you made and the prompt behind it.</span>
      </a>
    </li>
  );
}

export default function Wall({ works, onOpen, invite = false }: Props) {
  return (
    <ul className="columns-2 gap-x-2 sm:columns-3 sm:gap-x-3 lg:columns-4 xl:columns-5">
      {works.map((w, i) => (
        <Tile key={w.id} work={w} eager={i < 10} onOpen={() => onOpen(w.id)} />
      ))}
      {invite && <InviteTile />}
    </ul>
  );
}
