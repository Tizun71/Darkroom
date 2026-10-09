import { GithubLogoIcon, PlusIcon } from "@phosphor-icons/react";
import Brand from "./Brand";
import { REPO_URL } from "../config";

export default function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-3 pt-4 sm:px-6">
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <h1 className="flex shrink-0 items-center gap-2 text-base font-semibold">
          <Brand />
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
  );
}
