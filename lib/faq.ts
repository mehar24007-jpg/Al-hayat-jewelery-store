export type FaqItem = { q: string; a: string };

/**
 * The owner writes questions in Admin, Settings like this:
 *   Q: How long does delivery take?
 *   A: Two to four working days.
 * Blank line between questions.
 */
export function parseFaq(text: string): FaqItem[] {
  const out: FaqItem[] = [];
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const qi = lines.findIndex((l) => /^q\s*:/i.test(l));
    const ai = lines.findIndex((l) => /^a\s*:/i.test(l));
    if (qi < 0 || ai < 0 || ai < qi) continue;
    const q = lines.slice(qi, ai).join(" ").replace(/^q\s*:\s*/i, "").trim();
    const a = lines.slice(ai).join("\n").replace(/^a\s*:\s*/i, "").trim();
    if (q && a) out.push({ q, a });
  }
  return out;
}
