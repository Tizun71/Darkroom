import { useMemo, useState } from "react";
import type { Work } from "virtual:gallery";

/** Search text and tag filter over the gallery. Tags are sorted by how often they appear. */
export function useGalleryFilter(works: Work[]) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    works.forEach((w) => w.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [works]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return works.filter((w) => {
      if (tag && !w.tags.includes(tag)) return false;
      if (!q) return true;
      return [w.title, w.prompt, w.negative, w.model, w.author?.name ?? "", ...w.tags].join(" ").toLowerCase().includes(q);
    });
  }, [works, query, tag]);

  const clear = () => {
    setQuery("");
    setTag(null);
  };

  return { query, setQuery, tag, setTag, tags, visible, filtered: Boolean(query.trim() || tag), clear };
}
