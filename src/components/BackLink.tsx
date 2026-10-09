import { ArrowLeftIcon } from "@phosphor-icons/react";

export default function BackLink() {
  return (
    <a
      href="./"
      className="inline-flex items-center gap-2 rounded-lg bg-fg px-3 py-2 text-base font-semibold text-bg transition-colors duration-150 hover:bg-white active:scale-[0.98]"
    >
      <ArrowLeftIcon size={18} aria-hidden="true" /> Back to the gallery
    </a>
  );
}
