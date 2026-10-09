export function formatDate(iso: string, month: "long" | "short" = "long"): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric" });
}
