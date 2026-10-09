import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { list, parseAuthor, readContent } from "./content.ts";

/**
 * Turns the /content folder into a virtual module, `virtual:gallery`.
 * Image sizes are read at build time so the grid never jumps.
 *
 * When built on Vercel from a Git commit, images are not bundled. They are
 * served from GitHub through jsDelivr, pinned to the commit SHA. See
 * `imageCdnBase()`.
 */

const VIRTUAL_ID = "virtual:gallery";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/**
 * Base URL that serves the repository root, or null to bundle images with the site.
 *
 * - `IMAGE_CDN=off` always bundles.
 * - `IMAGE_CDN_BASE` sets it by hand, e.g. `https://cdn.jsdelivr.net/gh/you/repo@main`.
 * - On Vercel Git deploys, uses jsDelivr pinned to the deployed commit, so URLs never go stale.
 */
export function imageCdnBase(env: NodeJS.ProcessEnv = process.env): string | null {
  if (env.IMAGE_CDN === "off") return null;
  if (env.IMAGE_CDN_BASE) return env.IMAGE_CDN_BASE.replace(/\/+$/, "");
  const { VERCEL_GIT_REPO_OWNER: owner, VERCEL_GIT_REPO_SLUG: repo, VERCEL_GIT_COMMIT_SHA: sha, VERCEL_GIT_PROVIDER: provider } = env;
  if (owner && repo && sha && (!provider || provider === "github")) return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${sha}`;
  return null;
}

function generate(dir: string, warn: (msg: string) => void): string {
  const { entries, problems } = readContent(dir);
  problems.forEach(warn);
  const cdn = imageCdnBase();
  const imports: string[] = [];
  const items = entries.map((e, i) => {
    let src = JSON.stringify(e.imageUrl);
    if (e.imageFile && cdn) {
      src = JSON.stringify(`${cdn}/content/${e.imageFile.split("/").map(encodeURIComponent).join("/")}`);
    } else if (e.imageFile) {
      imports.push(`import img${i} from ${JSON.stringify("/content/" + e.imageFile)};`);
      src = `img${i}`;
    }
    return `{
      id: ${JSON.stringify(e.id)},
      title: ${JSON.stringify(e.meta.title || e.id.replace(/[-_]+/g, " "))},
      prompt: ${JSON.stringify(e.prompt)},
      negative: ${JSON.stringify(e.meta.negative || "")},
      model: ${JSON.stringify(e.meta.model || "")},
      date: ${JSON.stringify(e.meta.date || "")},
      author: ${JSON.stringify(parseAuthor(e.meta.author))},
      tags: ${JSON.stringify(list(e.meta.tags))},
      src: ${src},
      width: ${e.width},
      height: ${e.height}
    }`;
  });
  return `${imports.join("\n")}
const entries = [${items.join(",")}];
entries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
export default entries;`;
}

export default function gallery(contentDir = "content"): Plugin {
  let dir = "";
  let server: ViteDevServer | undefined;

  return {
    name: "darkroom-gallery",
    configResolved(config) {
      dir = path.resolve(config.root, contentDir);
    },
    configureServer(s) {
      server = s;
      s.watcher.add(dir);
      const reload = (file: string) => {
        if (!path.resolve(file).startsWith(dir)) return;
        const mod = s.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) s.moduleGraph.invalidateModule(mod);
        s.ws.send({ type: "full-reload" });
      };
      s.watcher.on("add", reload);
      s.watcher.on("unlink", reload);
      s.watcher.on("change", reload);
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const warn = (msg: string) => (server ? server.config.logger.warn(`[gallery] ${msg}`) : this.warn(msg));
      return generate(dir, warn);
    }
  };
}
