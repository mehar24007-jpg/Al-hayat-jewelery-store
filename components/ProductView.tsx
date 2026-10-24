"use client";

import { useState } from "react";
import Gallery from "./Gallery";
import { Stars } from "./ProductCard";
import { money } from "@/lib/format";
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
  const [done, setDone] = useState(false);
  const q = Math.max(qty ?? moq, moq);
  const soldOut = p.stock <= 0;

  const base = wholesale ? p.wholesale!.special ?? p.wholesale!.price * (1 - (profile?.dealer_discount_pct ?? 0) / 100) : p.retail;
  const slab = wholesale && p.wholesale!.special == null ? [...p.slabs].filter((s) => s.min_qty <= q).sort((a, b) => b.min_qty - a.min_qty)[0] : undefined;
  const unit = slab ? slab.unit_price : base;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Gallery images={p.images} name={p.name} tone={p.tone} category={p.category} id={p.id} tag={p.tag} />

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
