// Keeps Midjourney style flags such as "--ar 4:5" on one line,
// so the browser never breaks between the two hyphens.
export default function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(--\S+(?:\s+[^\s-][^\s]*)?)/g).map((part, i) =>
        part.startsWith("--") ? (
          <span key={i} className="whitespace-nowrap">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}
