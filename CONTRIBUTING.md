# Contributing a prompt

Anyone can add an image and its prompt. Each image is two files in the `content/` folder:

```
content/
  harbor-at-dawn.jpg   the image
  harbor-at-dawn.md    the prompt
```

Both files must have the same name: lowercase words joined by hyphens.

## The prompt file

```md
---
title: Harbor at dawn
model: Midjourney v7
date: 2026-09-25
tags: landscape, morning
negative: text, watermark
author: https://x.com/your-handle
---
Fishing boats in a quiet harbor at dawn, mist on the water, ...
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Short name shown in the detail view |
| `model` | yes | Model and version, e.g. `Midjourney v7`, `FLUX.1 pro`, `SDXL 1.0` |
| `date` | yes | When you made it, `YYYY-MM-DD` |
| `tags` | yes | Comma separated. Reuse existing tags when you can |
| `negative` | no | Negative prompt, if you used one |
| `author` | no | Credit with avatar: your X profile link (`https://x.com/you`), GitHub profile link, or GitHub username |

Everything below the second `---` is the prompt. Paste it exactly as you used it, flags included.

## Image rules

- `.jpg`, `.png`, `.webp` or `.avif`, under 1.5 MB. `npm run compress -- <image> <name>` resizes it and saves it to `content/`
- Long edge between 512 and 2560 px
- You generated it yourself
- No real people's likeness, no explicit content, no logos or trademarked characters

## Option A: upload on github.com (no install)

1. Open the `content` folder in this repository.
2. Click **Add file**, then **Upload files**.
3. Drag in your image and your `.md` file.
4. Choose **Create a new branch** and click **Propose changes**. GitHub forks the repository for you.
5. Click **Create pull request**.

To write the `.md` file in the browser instead, use **Add file**, then **Create new file**, and name it `harbor-at-dawn.md`.

## Option B: with git

```bash
git clone https://github.com/<you>/<your-fork>.git
cd <your-fork>
npm install
npm run dev          # preview at http://localhost:5173
# add your two files to content/
npm run check        # validates names, fields and image size
git checkout -b add-harbor-at-dawn
git add content
git commit -m "Add harbor at dawn"
git push -u origin add-harbor-at-dawn
```

Then open a pull request on GitHub.

## What happens next

1. An automatic check runs `npm run check` and `npm run build` on your pull request. If it fails, the log lists what to fix, for example a missing `model:` line or an image that is too large. Push a fix to the same branch and it runs again.
2. A maintainer reviews the image and prompt.
3. After the merge, the site rebuilds and your image appears at the top of the gallery.

## No GitHub pull request?

Open an issue with the **Submit a prompt** form and attach the image. A maintainer adds it for you.
