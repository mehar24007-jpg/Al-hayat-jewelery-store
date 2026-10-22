"use client";

import { useState } from "react";
import ProductArt, { toneBg } from "./ProductArt";
import { Stars } from "./ProductCard";
import { cld, money } from "@/lib/format";
import { useStore } from "@/lib/store";

type Props = {
  id: string;
  name: string;
  category: string;
  description: string;
  retail: number;
  tag: string | null;
  tone: string;
  images: string[];
  stock: number;
  rating: number | null;
  reviews: number;
  wholesale: { price: number; moq: number | null; special: number | null } | null;
  slabs: { min_qty: number; unit_price: number }[];
};

export default function ProductView(p: Props) {
  const { mode, settings, add, isDealer, profile } = useStore();
  const wholesale = mode === "wholesale" && p.wholesale != null;
  const moq = wholesale ? p.wholesale!.moq ?? settings.default_moq : 1;
  const [qty, setQty] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);
  const q = Math.max(qty ?? moq, moq);
  const soldOut = p.stock <= 0;

  const base = wholesale ? p.wholesale!.special ?? p.wholesale!.price * (1 - (profile?.dealer_discount_pct ?? 0) / 100) : p.retail;
  const slab = wholesale && p.wholesale!.special == null ? [...p.slabs].filter((s) => s.min_qty <= q).sort((a, b) => b.min_qty - a.min_qty)[0] : undefined;
  const unit = slab ? slab.unit_price : base;
  const img = cld(p.images[active], 900);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="min-w-0">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[14px] border border-line" style={{ background: toneBg(p.tone) }}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <ProductArt tone={p.tone} category={p.category} id={p.id} />
          )}
          {p.tag && <span className="absolute left-3 top-3 rounded-full border border-line bg-ink/80 px-2.5 py-0.5 text-xs uppercase tracking-wide text-gold-soft">{p.tag}</span>}
        </div>
        {p.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {p.images.map((u, i) => (
              <button key={u} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${i === active ? "border-gold" : "border-line"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(u, 160) ?? u} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid content-start gap-4">
        <div>
          <div className="text-sm text-muted">{p.category}</div>
          <h1 className="font-display text-4xl font-semibold leading-tight [overflow-wrap:anywhere]">{p.name}</h1>
          <div className="mt-1"><Stars rating={p.rating} count={p.reviews} /></div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 tabular-nums">
          <span className="text-3xl font-semibold text-gold-soft">{money(unit, settings.currency)}</span>
          {wholesale && <span className="text-muted line-through">{money(p.retail, settings.currency)}</span>}
          <span className="text-sm text-muted">{wholesale ? "per piece, wholesale" : "per piece"}</span>
        </div>

        {wholesale && p.slabs.length > 0 && p.wholesale!.special == null && (
          <div className="card p-4">
            <h2 className="mb-2 text-sm font-semibold text-gold">Buy more, pay less</h2>
            <table className="w-full text-sm tabular-nums">
              <tbody>
                <tr className="border-b border-line"><td className="py-1.5 text-muted">{moq}+ pieces</td><td className="py-1.5 text-right">{money(base, settings.currency)}</td></tr>
                {p.slabs.map((s) => (
                  <tr key={s.min_qty} className="border-b border-line last:border-0"><td className="py-1.5 text-muted">{s.min_qty}+ pieces</td><td className="py-1.5 text-right">{money(s.unit_price, settings.currency)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isDealer && <p className="note">Dealers see wholesale prices and quantity discounts. <a className="text-gold-soft underline" href="/dealer">Apply as a dealer</a>.</p>}

        <p className="whitespace-pre-line text-muted">{p.description || "Handcrafted piece from our workshop."}</p>

        <p className={`text-sm ${soldOut ? "text-warn" : p.stock <= 5 ? "text-warn" : "text-ok"}`}>
          {soldOut ? "Sold out" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}
        </p>
        {wholesale && <p className="text-sm text-ok">Minimum order {moq} pieces</p>}

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-lg border border-line">
            <button className="h-10 w-10" onClick={() => setQty(Math.max(moq, q - 1))} aria-label="Fewer">−</button>
            <span className="min-w-10 text-center tabular-nums">{q}</span>
            <button className="h-10 w-10" onClick={() => setQty(Math.min(p.stock || q, q + 1))} aria-label="More">+</button>
          </div>
          <button
            className="btn btn-gold flex-1 py-3"
            disabled={soldOut}
            onClick={() => {
              add(p.id, q);
              setDone(true);
              setTimeout(() => setDone(false), 1400);
            }}
          >
            {soldOut ? "Sold out" : done ? "Added to cart" : `Add to cart · ${money(unit * q, settings.currency)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
