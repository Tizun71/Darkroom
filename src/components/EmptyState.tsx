import { ImageBrokenIcon } from "@phosphor-icons/react";

// Shown when no work matches the filters (`onClear` set) or the gallery has no works yet
export default function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="mx-auto mt-12 grid max-w-md justify-items-center gap-3 rounded-2xl border border-surface-3 bg-surface px-6 py-12 text-center">
      <ImageBrokenIcon size={32} className="text-fg-faint" aria-hidden="true" />
      {onClear ? (
        <>
          <h2 className="text-lg font-semibold">No prompts match that search</h2>
          <button
            type="button"
            onClick={onClear}
            className="h-11 cursor-pointer rounded-lg border border-line bg-surface-2 px-3 text-base font-semibold transition-colors duration-150 hover:bg-surface-3 active:scale-[0.98]"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold">No images yet</h2>
          <p className="text-sm text-fg-dim">
            Add a folder such as <code className="text-fg">content/harbor-at-dawn/</code> with <code className="text-fg">image.avif</code> and{" "}
            <code className="text-fg">prompt.md</code>. Run <code className="text-fg">npm run add</code> to create both.
          </p>
        </>
      )}
    </div>
  );
}
