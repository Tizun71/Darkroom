import type { ReactNode } from "react";
import { GithubLogoIcon } from "@phosphor-icons/react";
import CopyButton from "./CopyButton";
import { REPO_URL } from "../config";

const TEMPLATE = `---
title: Harbor at dawn
model: Midjourney v7
date: 2026-09-25
tags: landscape, morning
negative: text, watermark
author: https://x.com/your-handle
---
Fishing boats in a quiet harbor at dawn, mist on the water, ...`;

const GIT_STEPS = `git clone https://github.com/<you>/<your-fork>.git
cd <your-fork>
npm install
npm run dev
npm run add -- ~/Downloads/poster.png harbor-at-dawn
# fill in content/harbor-at-dawn/prompt.md
npm run check
git checkout -b add-harbor-at-dawn
git add content
git commit -m "Add harbor at dawn"
git push -u origin add-harbor-at-dawn`;

const repo = REPO_URL.replace(/\/$/, "");

// Links only render when the repository URL is configured, so nothing points nowhere
function RepoLink({ path, children }: { path: string; children: ReactNode }) {
  if (!repo) return <strong className="font-semibold text-fg">{children}</strong>;
  return (
    <a href={`${repo}${path}`} className="font-semibold text-fg underline underline-offset-4 hover:text-accent">
      {children}
    </a>
  );
}

function Code({ text, label }: { text: string; label: string }) {
  return (
    <div className="grid gap-2 rounded-xl border border-surface-3 bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-fg-dim">{label}</span>
        <CopyButton value={text} label="Copy" errorLabel="Failed" size="sm" />
      </div>
      <pre className="overflow-x-auto font-mono text-sm text-fg">{text}</pre>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-6">
      <span className="grid size-10 place-items-center rounded-full bg-surface-3 text-base font-semibold tabular-nums">{n}</span>
      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function Contribute() {
  return (
    <main className="mx-auto grid max-w-3xl gap-12 px-4 py-12 sm:py-16">
      <div className="flex items-center justify-between gap-4">
        <a href="./" className="flex items-center gap-2 text-base font-semibold">
          <img src="./logo-mark.png" alt="" aria-hidden="true" className="size-6 rounded-md" />
          Darkroom
        </a>
        <a href="./" className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-semibold text-fg-dim transition-colors duration-150 hover:bg-surface-2 hover:text-fg">
          Back to the gallery
        </a>
      </div>

      <header className="grid gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Add your prompt</h1>
        <p className="text-lg text-fg-dim">
          Anyone with a free GitHub account can add an image. You send a pull request with one folder holding two files, an automatic check validates them,
          and after a maintainer merges it your image shows up at the top of the gallery.
        </p>
      </header>

      <Step n={1} title="Prepare one folder with two files">
        <p className="text-base text-fg-dim">
          Name the folder with lowercase words joined by hyphens, for example <code className="text-fg">harbor-at-dawn</code>. Inside it
          put the image as <code className="text-fg">image.jpg</code> and its prompt as <code className="text-fg">prompt.md</code>.
        </p>
        <Code label="harbor-at-dawn/prompt.md" text={TEMPLATE} />
        <ul className="grid gap-2 text-base text-fg-dim">
          <li><strong className="font-semibold text-fg">Required:</strong> title, model, date (YYYY-MM-DD), tags, and the prompt below the second <code className="text-fg">---</code>.</li>
          <li><strong className="font-semibold text-fg">Optional:</strong> negative prompt, and author for credit: your X profile link, your GitHub profile link, or your GitHub username. Your avatar shows next to the image.</li>
          <li><strong className="font-semibold text-fg">Prompt:</strong> paste it exactly as you used it, flags like <code className="text-fg">--ar 4:5</code> included.</li>
          <li><strong className="font-semibold text-fg">Image:</strong> .jpg, .png, .webp or .avif, under 1.5 MB, long edge between 512 and 2560 px. <code className="text-fg">npm run add</code> shrinks it and creates the folder for you.</li>
        </ul>
      </Step>

      <Step n={2} title="Send them as a pull request">
        <div className="grid gap-3 rounded-2xl border border-surface-3 bg-surface p-4">
          <h3 className="text-lg font-semibold">Option A: on github.com, no install</h3>
          <ol className="grid list-decimal gap-2 pl-4 text-base text-fg-dim marker:text-fg-faint">
            <li>Open the <RepoLink path="/tree/main/content">content folder</RepoLink>.</li>
            <li>
              Click <strong className="font-semibold text-fg">Add file</strong>, then <RepoLink path="/upload/main/content">Upload files</RepoLink>.
            </li>
            <li>Drag in your whole folder (for example <code className="text-fg">harbor-at-dawn</code>) with the image and prompt.md inside.</li>
            <li>
              Choose <strong className="font-semibold text-fg">Create a new branch</strong> and click{" "}
              <strong className="font-semibold text-fg">Propose changes</strong>. GitHub forks the repository for you.
            </li>
            <li>Click <strong className="font-semibold text-fg">Create pull request</strong>.</li>
          </ol>
        </div>
        <div className="grid gap-3 rounded-2xl border border-surface-3 bg-surface p-4">
          <h3 className="text-lg font-semibold">Option B: with git</h3>
          <p className="text-base text-fg-dim">
            <RepoLink path="/fork">Fork the repository</RepoLink>, preview locally, and run the same check the pull request will run.
          </p>
          <Code label="Terminal" text={GIT_STEPS} />
        </div>
      </Step>

      <Step n={3} title="Wait for the check and the review">
        <ul className="grid gap-2 text-base text-fg-dim">
          <li>An automatic check runs on your pull request. If it fails, open the log: it lists exactly what to fix, such as a missing model line or an image that is too large. Push a fix to the same branch and it runs again.</li>
          <li>A maintainer looks at the image and the prompt, then merges.</li>
          <li>The site rebuilds and your image appears first in the gallery.</li>
        </ul>
      </Step>

      <section className="grid gap-3 rounded-2xl border border-surface-3 bg-surface p-4">
        <h2 className="text-lg font-semibold">What we accept</h2>
        <ul className="grid gap-2 text-base text-fg-dim">
          <li>Images you generated yourself, with the real prompt you used.</li>
          <li>No real people's likeness, no explicit content, no logos or trademarked characters.</li>
          <li>Several images in one pull request is fine.</li>
        </ul>
      </section>

      <p className="text-base text-fg-dim">
        Not comfortable with pull requests? <RepoLink path="/issues/new?template=new-prompt.yml">Open an issue with the prompt form</RepoLink>,
        attach the image, and a maintainer adds it for you.
      </p>

      {repo && (
        <a
          href={repo}
          className="inline-flex h-11 items-center gap-2 justify-self-start rounded-lg bg-fg px-3 text-base font-semibold text-bg transition-colors duration-150 hover:bg-white active:scale-[0.98]"
        >
          <GithubLogoIcon size={18} aria-hidden="true" /> Open the repository
        </a>
      )}
    </main>
  );
}
