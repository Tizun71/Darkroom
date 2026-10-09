import { REPO_URL } from "../config";

const link = "inline-flex min-h-11 items-center underline underline-offset-4 hover:text-fg sm:min-h-0";
const repo = REPO_URL.replace(/\/$/, "");

export default function SiteFooter() {
  return (
    <footer className="mx-auto grid max-w-[1600px] gap-2 border-t border-surface-3 px-3 pt-6 pb-8 text-sm text-fg-faint sm:px-6">
      <p>
        Flags like <code className="text-fg-dim">--ar 4:5</code> only work in Midjourney. Delete them for other tools. Paste negative prompts
        into the separate negative prompt field.
      </p>
      <p>
        Images and prompts are shared under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-4 hover:text-fg">CC BY 4.0</a>. Credit the
        creator when you reuse them. The code is MIT licensed.
      </p>
      <p className="flex flex-wrap items-center gap-x-4">
        <a href="./contribute.html" className={link}>Contribute</a>
        {repo && <a href={repo} className={link}>Source code</a>}
        {repo && <a href={`${repo}/issues`} className={link}>Report a problem</a>}
        <a href="./privacy.html" className={link}>Privacy</a>
        <a href="./terms.html" className={link}>Terms</a>
      </p>
    </footer>
  );
}
