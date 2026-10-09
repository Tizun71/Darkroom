import { GithubLogoIcon, PlusIcon } from "@phosphor-icons/react";
import Brand from "./Brand";
import { REPO_URL } from "../config";

export default function SiteHeader({ total }: { total: number }) {
  return (
    <header className="mx-auto grid max-w-[1600px] gap-6 px-3 pt-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="flex shrink-0 items-center gap-2 text-base font-semibold">
          <Brand />
        </h1>
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
              aria-label="Source code on GitHub"
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold text-fg-dim transition-colors duration-150 hover:bg-surface-2 hover:text-fg sm:h-9 sm:px-3"
            >
              <GithubLogoIcon size={18} aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          )}
        </nav>
      </div>

      <div className="grid max-w-2xl gap-2">
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">AI images with the exact prompt that made them</p>
        <p className="text-base text-fg-dim">
          Open an image and copy its prompt into Midjourney, FLUX, GPT Image or any other tool.
          {total > 0 && ` ${total} ${total === 1 ? "prompt" : "prompts"}, free to reuse under CC BY 4.0.`} Open source and added by the
          community.
        </p>
      </div>
    </header>
  );
}
