/// <reference types="vite/client" />

declare module "virtual:gallery" {
  export interface Work {
    id: string;
    title: string;
    prompt: string;
    negative: string;
    model: string;
    date: string;
    /** Contributor, from an X or GitHub profile link or a GitHub username */
    author: import("../plugins/content.ts").Author | null;
    tags: string[];
    src: string;
    width: number | null;
    height: number | null;
  }
  const works: Work[];
  export default works;
}
