"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cld, money } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";

type Item = { name: string; slug: string; price: number; image: string | null; category: string };

/** Full width search with category shortcuts. Products load the first time it opens. */
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { settings } = useStore();
  const [items, setItems] = useState<Item[] | null>(null);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || items) return;
    createClient()
      .from("products")
      .select("name,slug,retail_price,images,category:categories(name)")
      .eq("is_active", true)
      .limit(500)
      .then(({ data }) =>
        setItems(
          ((data ?? []) as any[]).map((p) => {
            const c = Array.isArray(p.category) ? p.category[0] : p.category;
            return { name: p.name, slug: p.slug, price: Number(p.retail_price), image: p.images?.[0] ?? null, category: c?.name ?? "" };
          })
        )
      );
  }, [open, items]);

  const cats = useMemo(() => Array.from(new Set((items ?? []).map((i) => i.category).filter(Boolean))), [items]);
  const s = q.trim().toLowerCase();
  const results = useMemo(() => (s ? (items ?? []).filter((i) => `${i.name} ${i.category}`.toLowerCase().includes(s)).slice(0, 6) : []), [items, s]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;
    onClose();
    router.push(`/?q=${encodeURIComponent(q.trim())}#shop`);
  }

  return (
    <div className="fixed inset-0 z-[55] bg-ink/95 backdrop-blur reveal" role="dialog" aria-modal="true" aria-label="Search">
      <div className="wrap max-w-2xl pt-5">
        <form onSubmit={submit} className="flex items-center gap-2.5">
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="I'm looking for… rings, bangles, bridal sets"
            className="input h-12 text-base"
            aria-label="Search products"
          />
          <button type="button" className="btn h-12 shrink-0" onClick={onClose}>Close</button>
        </form>

        {!s && (
          <div className="mt-6">
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[.12em] text-gold">Trending searches</h2>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link key={c} href={`/?cat=${encodeURIComponent(c)}#shop`} onClick={onClose} className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:border-gold">
                  {c}
                </Link>
              ))}
              {items && !cats.length && <p className="text-sm text-muted">No categories yet.</p>}
              {!items && <p className="text-sm text-muted">Loading…</p>}
            </div>
          </div>
        )}

        {s && (
          <div className="mt-5 grid gap-1">
            {results.map((r) => (
              <Link key={r.slug} href={`/product/${r.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-[12px] p-2 hover:bg-panel">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-panel2 text-gold">
                  {r.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cld(r.image, 140) ?? r.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "◆"
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="text-xs text-muted">{r.category}</span>
                </span>
                <span className="shrink-0 tabular-nums text-gold-soft">{money(r.price, settings.currency)}</span>
              </Link>
            ))}
            {items && !results.length && <p className="py-4 text-muted">Nothing found for “{q.trim()}”.</p>}
            {!items && <p className="py-4 text-muted">Searching…</p>}
            {results.length > 0 && (
              <button onClick={submit} className="btn mt-2">See all results for “{q.trim()}”</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
