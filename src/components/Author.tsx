import { useState } from "react";
import { GithubLogoIcon, GlobeIcon, XLogoIcon } from "@phosphor-icons/react";
import type { Work } from "virtual:gallery";

type AuthorInfo = NonNullable<Work["author"]>;

const ICON = { x: XLogoIcon, github: GithubLogoIcon, web: GlobeIcon };

// Contributor avatar from unavatar.io, with the platform icon as a fallback
export function AuthorAvatar({ author, size }: { author: AuthorInfo; size: number }) {
  const [failed, setFailed] = useState(false);
  const Icon = ICON[author.platform];
  if (!author.avatar || failed) return <Icon size={size - 4} aria-hidden="true" className="shrink-0" />;
  return (
    <img
      src={author.avatar}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-surface-3 object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export const authorLabel = (a: AuthorInfo) => (a.platform === "web" ? a.name : `@${a.name}`);
