import { parseFaq } from "@/lib/faq";

/** Questions and answers that open and close. Plain <details>, so it works without scripts. */
export default function Faq({ text, title = "Questions we hear often" }: { text: string; title?: string }) {
  const items = parseFaq(text);
  if (!items.length) return null;
  return (
    <section className="mb-4 mt-14" aria-label={title}>
      <h2 className="section-title mb-4">{title}</h2>
      <div className="grid gap-2.5">
        {items.map((f, i) => (
          <details key={i} className="group rounded-[12px] border border-line bg-panel px-4 py-3 open:border-gold">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-gold transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-2 whitespace-pre-line text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
