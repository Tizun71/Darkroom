import { useEffect, useState } from "react";

const idFromHash = () => {
  const m = /^#\/(.+)$/.exec(window.location.hash);
  return m ? decodeURIComponent(m[1]) : null;
};

/**
 * Keeps the open work in sync with the URL hash, so `#/<id>` is a share link.
 * Only ids that pass `exists` open; unknown hashes are ignored.
 */
export function useShareLink(exists: (id: string) => boolean) {
  const [openId, setOpenId] = useState<string | null>(() => {
    const id = idFromHash();
    return id && exists(id) ? id : null;
  });

  useEffect(() => {
    if (openId && window.location.hash !== `#/${openId}`) history.replaceState(null, "", `#/${openId}`);
    if (!openId && idFromHash()) history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [openId]);

  useEffect(() => {
    const onHash = () => {
      const id = idFromHash();
      if (id && exists(id)) setOpenId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [exists]);

  return [openId, setOpenId] as const;
}
