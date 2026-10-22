"use client";

import Link from "next/link";
import { useState } from "react";
import ProductArt, { toneBg } from "./ProductArt";
import { cld, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CatalogProduct } from "@/lib/types";

export function Stars({ rating, count }: { rating: number | null; count: number }) {
  if (!count || rating == null) return <span className="text-xs text-muted">No reviews yet</span>;
  return (
    <span className="text-xs text-muted" aria-label={`${rating} out of 5 from ${count} reviews`}>
      <span className="text-gold">{"★".repeat(Math.round(rating))}</span>
      <span className="text-line">{"★".repeat(5 - Math.round(rating))}</span> {rating.toFixed(1)} ({count})
    </span>
  );
}

export default function ProductCard({ p }: { p: CatalogProduct }) {
  const { mode, settings, add } = useStore();
  const [added, setAdded] = useState(false);
  const wholesale = mode === "wholesale" && p.wholesale != null;
  const moq = p.moq ?? settings.default_moq;
  const soldOut = p.stock <= 0;
  const img = cld(p.image, 500);

  function onAdd() {
    add(p.id, wholesale ? moq : 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="card flex min-w-0 flex-col overflow-hidden">
      <Link href={`/product/${p.slug}`} className="relative grid aspect-square place-items-center overflow-hidden" style={{ background: toneBg(p.tone) }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <ProductArt tone={p.tone} category={p.category} id={p.id} />
        )}
        {p.tag && <span className="absolute left-2.5 top-2.5 rounded-full border border-line bg-ink/80 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gold-soft">{p.tag}</span>}
        {soldOut && <span className="absolute right-2.5 top-2.5 rounded-full border border-line bg-ink/80 px-2 py-0.5 text-[11px] uppercase tracking-wide text-warn">Sold out</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="text-xs text-muted">{p.category}</div>
        <h3 className="font-display text-xl font-semibold leading-tight [overflow-wrap:anywhere]">
          <Link href={`/product/${p.slug}`}>{p.name}</Link>
        </h3>
        <Stars rating={p.rating} count={p.reviews} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1.5 tabular-nums">
          <span className="text-[17px] font-semibold text-gold-soft">{money(wholesale ? p.wholesale : p.retail, settings.currency)}</span>
          {wholesale && <span className="text-[12.5px] text-muted line-through">{money(p.retail, settings.currency)}</span>}
        </div>
        {wholesale && <div className="text-xs text-ok">Minimum {moq} pcs</div>}
        {!soldOut && p.stock <= 5 && <div className="text-xs text-warn">Only {p.stock} left</div>}
        <button className="btn mt-2 border-gold text-gold-soft hover:bg-gold hover:text-on-gold" onClick={onAdd} disabled={soldOut}>
          {soldOut ? "Sold out" : added ? "Added" : wholesale ? `Add ${moq} to cart` : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
