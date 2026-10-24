"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Gallery from "./Gallery";
import { Stars } from "./ProductCard";
import { money, waNumber } from "@/lib/format";
import { useStore } from "@/lib/store";

type Props = {
  id: string;
  name: string;
  category: string;
  description: string;
  retail: number;
  compare: number | null;
  sizes: string[];
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
  const { mode, settings, add, setCartOpen, isDealer, profile } = useStore();
  const wholesale = mode === "wholesale" && p.wholesale != null;
  const moq = wholesale ? p.wholesale!.moq ?? settings.default_moq : 1;
  const [qty, setQty] = useState<number | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [needSize, setNeedSize] = useState(false);
  const [done, setDone] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const q = Math.max(qty ?? moq, moq);
  const soldOut = p.stock <= 0;
  const hasSizes = p.sizes.length > 0;

  const base = wholesale ? p.wholesale!.special ?? p.wholesale!.price * (1 - (profile?.dealer_discount_pct ?? 0) / 100) : p.retail;
  const slab = wholesale && p.wholesale!.special == null ? [...p.slabs].filter((s) => s.min_qty <= q).sort((a, b) => b.min_qty - a.min_qty)[0] : undefined;
  const unit = slab ? slab.unit_price : base;
  const sale = !wholesale && p.compare != null && p.compare > p.retail;
  const off = sale ? Math.round((1 - p.retail / p.compare!) * 100) : 0;
  const wa = waNumber(settings.whatsapp);
  const bulkText = `Hi, I want to order ${p.name}${size ? ` (Size ${size})` : ""} in bulk. What is your best rate?`;

  // On a phone, show a small add-to-cart bar once the real button has scrolled out of view.
  useEffect(() => {
    const el = addRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function onAdd() {
    if (hasSizes && !size) {
      setNeedSize(true);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add(p.id, q, size);
    setDone(true);
    setCartOpen(true);
    setTimeout(() => setDone(false), 1400);
  }

  const policies: [string, string][] = [
    ["Shipping", settings.shipping_policy],
    ["Exchange and returns", settings.exchange_policy],
    ["Care", settings.care_text],
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Gallery images={p.images} name={p.name} tone={p.tone} category={p.category} id={p.id} tag={p.tag} />

      <div className="grid content-start gap-4">
        <div>
          <div className="text-sm text-muted">{p.category}</div>
          <h1 className="font-display text-4xl font-semibold leading-tight [overflow-wrap:anywhere]">{p.name}</h1>
          <div className="mt-1"><Stars rating={p.rating} count={p.reviews} /></div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
          <span className="text-3xl font-semibold text-gold-soft">{money(unit, settings.currency)}</span>
          {wholesale && <span className="text-muted line-through">{money(p.retail, settings.currency)}</span>}
          {sale && <span className="text-muted line-through">{money(p.compare, settings.currency)}</span>}
          {sale && <span className="rounded-full bg-warn/15 px-2.5 py-0.5 text-xs font-semibold text-warn">{off}% OFF</span>}
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

        {hasSizes && (
          <div ref={sizeRef} className={`rounded-[12px] ${needSize && !size ? "ring-2 ring-warn ring-offset-4 ring-offset-ink" : ""}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Size{size ? `: ${size}` : ""}</span>
              <Link href="/size-guide" className="text-sm text-gold-soft underline">Size guide</Link>
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => { setSize(s); setNeedSize(false); }}
                  className={`min-w-14 rounded-full border px-4 py-2 text-sm tabular-nums transition ${size === s ? "border-gold bg-gold text-on-gold" : "border-line hover:border-gold"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {needSize && !size && <p className="err mt-2" role="alert">Choose a size first.</p>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-lg border border-line">
            <button className="h-10 w-10" onClick={() => setQty(Math.max(moq, q - 1))} aria-label="Fewer">−</button>
            <span className="min-w-10 text-center tabular-nums">{q}</span>
            <button className="h-10 w-10" onClick={() => setQty(Math.min(p.stock || q, q + 1))} aria-label="More">+</button>
          </div>
          <button ref={addRef} className="btn btn-gold flex-1 py-3" disabled={soldOut} onClick={onAdd}>
            {soldOut ? "Sold out" : done ? "Added to cart" : `Add to cart · ${money(unit * q, settings.currency)}`}
          </button>
        </div>

        {wa && !wholesale && !soldOut && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(bulkText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gold-soft underline"
          >
            Buying in bulk? Message us on WhatsApp for a better rate
          </a>
        )}

        <ul className="grid grid-cols-3 gap-2 text-center text-xs text-muted">
          <li className="rounded-[10px] border border-line px-2 py-2.5">Prices checked when you order</li>
          <li className="rounded-[10px] border border-line px-2 py-2.5">WhatsApp support</li>
          <li className="rounded-[10px] border border-line px-2 py-2.5">Cash on delivery available</li>
        </ul>

        <div className="grid gap-2">
          {policies.filter(([, t]) => t.trim()).map(([title, t]) => (
            <details key={title} className="group rounded-[12px] border border-line bg-panel px-4 py-3 open:border-gold">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {title}
                <span className="text-gold transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{t}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Phone only: add-to-cart bar above the bottom menu */}
      {!soldOut && (
        <div
          className={`fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-20 flex items-center gap-3 border-t border-line bg-ink/95 px-4 py-2.5 backdrop-blur transition duration-300 md:hidden ${showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}
          aria-hidden={!showBar}
        >
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-medium">{p.name}</div>
            <div className="text-sm tabular-nums text-gold-soft">{money(unit, settings.currency)}</div>
          </div>
          <button className="btn btn-gold shrink-0 px-5" onClick={onAdd} tabIndex={showBar ? 0 : -1}>
            {hasSizes && !size ? "Choose size" : "Add to cart"}
          </button>
        </div>
      )}
    </div>
  );
}
