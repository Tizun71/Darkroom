const link = "inline-flex min-h-11 items-center underline underline-offset-4 hover:text-fg sm:min-h-0";

export default function SiteFooter() {
  return (
    <footer className="mx-auto grid max-w-[1600px] gap-2 px-3 pb-8 text-sm text-fg-faint sm:px-6">
      <p>
        Flags like <code className="text-fg-dim">--ar 4:5</code> only work in Midjourney. Delete them for other tools. Paste negative prompts
        into the separate negative prompt field.
      </p>
      <p className="flex flex-wrap items-center gap-x-4">
        <span>Images and prompts are shared under CC BY 4.0. Credit the creator when you reuse them.</span>
        <a href="./contribute.html" className={link}>Contribute</a>
        <a href="./privacy.html" className={link}>Privacy</a>
        <a href="./terms.html" className={link}>Terms</a>
      </p>
    </footer>
  );
}
