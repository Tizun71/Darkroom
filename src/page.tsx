// Entry for the small static pages: contribute, privacy, terms and 404.
// Each HTML file picks its page with <body data-page="...">.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Contribute from "./pages/Contribute";
import Legal, { LEGAL, type LegalKind } from "./pages/Legal";
import NotFound from "./pages/NotFound";
import "./index.css";

function Page({ kind }: { kind: string }) {
  if (kind === "contribute") return <Contribute />;
  if (Object.hasOwn(LEGAL, kind)) return <Legal kind={kind as LegalKind} />;
  return <NotFound />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page kind={document.body.dataset.page ?? "404"} />
  </StrictMode>
);
