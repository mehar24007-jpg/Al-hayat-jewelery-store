"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FadeImg from "./FadeImg";
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

const badge = "rounded-full bg-ink/85 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide backdrop-blur";

export default function ProductCard({ p, isNew = false }: { p: CatalogProduct; isNew?: boolean }) {
  const { mode, settings, add, setCartOpen, wish, toggleWish } = useStore();
  const [added, setAdded] = useState(false);
  const [beat, setBeat] = useState(false);
  const [hidden, setHidden] = useState(false);
  const card = useRef<HTMLElement>(null);

  // Cards fade up one after another as they scroll into view.
  useEffect(() => {
    const el = card.current;
    if (!el || typeof IntersectionObserver === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95) return;
    const idx = Array.from(el.parentElement?.children ?? []).indexOf(el);
    el.style.setProperty("--d", `${(idx % 4) * 80}ms`);
    setHidden(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHidden(false);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const wholesale = mode === "wholesale" && p.wholesale != null;
  const moq = p.moq ?? settings.default_moq;
  const soldOut = p.stock <= 0;
  const img = cld(p.image, 600);
  const img2 = cld(p.image2, 600);
  const saved = wish.includes(p.id);
  const hasSizes = p.sizes.length > 0;
  const sale = !wholesale && p.compare != null && p.compare > p.retail;
  const off = sale ? Math.round((1 - p.retail / p.compare!) * 100) : 0;

  function onAdd() {
    add(p.id, wholesale ? moq : 1, null);
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function onHeart() {
    toggleWish(p.id);
    setBeat(true);
    setTimeout(() => setBeat(false), 400);
  }

  return (
    <article ref={card} className={`${hidden ? "card-hidden" : "card-in"} group relative flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl active:scale-[.985]`}>
      <Link href={`/product/${p.slug}`} className="shine relative grid aspect-square place-items-center overflow-hidden" style={{ background: toneBg(p.tone) }}>
        {img ? (
          <FadeImg
            src={img}
            alt={p.name}
            className={`h-full w-full object-cover transition duration-700 ease-out ${img2 ? "group-hover:scale-105 group-hover:opacity-0" : "group-hover:scale-110"}`}
            loading="lazy"
          />
        ) : (
          <ProductArt tone={p.tone} category={p.category} id={p.id} />
        )}
        {img2 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img2} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100" loading="lazy" />
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {sale && !soldOut && <span className={`${badge} text-warn`}>{off}% off</span>}
          {isNew && !soldOut && !sale && <span className={`${badge} text-gold-soft`}>New</span>}
          {p.tag && <span className={`${badge} text-gold-soft`}>{p.tag}</span>}
          {soldOut ? (
            <span className={`${badge} text-warn`}>Sold out</span>
          ) : (
            p.stock <= 5 && <span className={`${badge} text-warn`}>Only {p.stock} left</span>
          )}
        </div>
      </Link>

      <button
        onClick={onHeart}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${p.name} from saved` : `Save ${p.name}`}
        className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-ink/85 backdrop-blur transition hover:scale-110 ${beat ? "pop" : ""}`}
      >
        <svg viewBox="0 0 24 24" className={`h-[19px] w-[19px] ${saved ? "fill-gold text-gold" : "fill-none text-cream"}`} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
        </svg>
      </button>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="font-display text-xl font-semibold leading-tight [overflow-wrap:anywhere]">
          <Link href={`/product/${p.slug}`}>{p.name}</Link>
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
          <span className="text-[17px] font-semibold text-gold-soft">{money(wholesale ? p.wholesale : p.retail, settings.currency)}</span>
          {wholesale && <span className="text-[12.5px] text-muted line-through">{money(p.retail, settings.currency)}</span>}
          {sale && <span className="text-[12.5px] text-muted line-through">{money(p.compare, settings.currency)}</span>}
        </div>
        {wholesale && <div className="text-xs text-ok">Minimum {moq} pcs</div>}
        {hasSizes && !soldOut ? (
          <Link href={`/product/${p.slug}`} className="btn mt-2.5 border-gold text-gold-soft hover:bg-gold hover:text-on-gold">Select size</Link>
        ) : (
          <button className="btn mt-2.5 border-gold text-gold-soft hover:bg-gold hover:text-on-gold active:scale-95" onClick={onAdd} disabled={soldOut}>
            {soldOut ? "Sold out" : added ? "Added" : wholesale ? `Add ${moq} to cart` : "Add to cart"}
          </button>
        )}
      </div>
    </article>
  );
}
