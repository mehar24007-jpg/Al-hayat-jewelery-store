"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FadeImg from "./FadeImg";
import ProductArt, { toneBg } from "./ProductArt";
import ProductCard from "./ProductCard";
import { cld, money, waNumber } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CatalogProduct } from "@/lib/types";

const SAVED = "__saved";

type Props = {
  products: CatalogProduct[];
  categories: string[];
  categoryImages: Record<string, string | null>;
  newIds: string[];
  bestIds: string[];
};

function goShop() {
  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Catalog({ products, categories, categoryImages, newIds, bestIds }: Props) {
  const { settings, mode, setMode, isDealer, profile, wish } = useStore();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"feat" | "lo" | "hi">("feat");
  const [limit, setLimit] = useState<number | null>(null);
  const [sheet, setSheet] = useState(false);

  const priceOf = (p: CatalogProduct) => (mode === "wholesale" && p.wholesale != null ? p.wholesale : p.retail);
  const top = useMemo(() => Math.max(1, ...products.map(priceOf)), [products, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const cap = limit ?? top;

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    products.forEach((p) => (m[p.category] = (m[p.category] ?? 0) + 1));
    return m;
  }, [products]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const out = products.filter(
      (p) =>
        (cat === "All" || (cat === SAVED ? wish.includes(p.id) : p.category === cat)) &&
        priceOf(p) <= cap &&
        (!s || `${p.name} ${p.category}`.toLowerCase().includes(s))
    );
    if (sort === "lo") out.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "hi") out.sort((a, b) => priceOf(b) - priceOf(a));
    return out;
  }, [products, cat, q, sort, cap, mode, wish]); // eslint-disable-line react-hooks/exhaustive-deps

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const newest = newIds.map((id) => byId.get(id)).filter(Boolean) as CatalogProduct[];
  const best = bestIds.map((id) => byId.get(id)).filter(Boolean) as CatalogProduct[];
  const newSet = useMemo(() => new Set(newIds), [newIds]);

  const wa = waNumber(settings.whatsapp);
  const savedCount = products.filter((p) => wish.includes(p.id)).length;
  const all = ["All", ...(savedCount > 0 || cat === SAVED ? [SAVED] : []), ...categories];
  const label = (c: string) => (c === SAVED ? "♥ Saved" : c);
  const hero = cld(settings.hero_image, 1800);

  function pick(c: string) {
    setCat(c);
    setSheet(false);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {hero ? (
          <FadeImg src={hero} alt="" className="kenburns absolute inset-0 -z-20 h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 -z-20"
            style={{ background: "radial-gradient(ellipse at 82% 18%, rgb(201 164 92 / .38), transparent 55%), linear-gradient(135deg, #1d1713, #2e2316 60%, #15110f)" }}
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
        <div className="wrap flex min-h-[440px] flex-col justify-center gap-4 py-14 text-white sm:min-h-[540px]">
          <span className="reveal text-xs font-medium uppercase tracking-[.28em] text-white/75">
            {settings.store_name} {settings.store_sub}
          </span>
          <h1 className="reveal reveal-2 max-w-[18ch] font-display text-[clamp(38px,7vw,68px)] font-medium leading-[1.03] [text-wrap:balance]">{settings.hero_title}</h1>
          <p className="reveal reveal-3 max-w-[48ch] text-base text-white/80 sm:text-lg">{settings.hero_text}</p>
          <div className="reveal reveal-3 mt-2 flex flex-wrap gap-3">
            <a href="#shop" onClick={(e) => { e.preventDefault(); goShop(); }} className="btn btn-gold px-6 py-3 text-[15px]">Shop now</a>
            {isDealer ? (
              <button onClick={() => { setMode("wholesale"); goShop(); }} className="btn border-white/50 bg-transparent px-6 py-3 text-[15px] text-white hover:bg-white/10">Wholesale prices</button>
            ) : (
              <Link href="/dealer" className="btn border-white/50 bg-transparent px-6 py-3 text-[15px] text-white hover:bg-white/10">Become a dealer</Link>
            )}
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* Trust strip */}
        <ul className="grid grid-cols-2 gap-3 py-6 text-[13px] sm:grid-cols-4">
          <Trust d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.7 1.7 0 1 0 0-.01M17 19a1.7 1.7 0 1 0 0-.01" text={settings.free_delivery_over ? `Free delivery above ${money(settings.free_delivery_over, settings.currency)}` : "Cash on delivery available"} />
          <Trust d="M4 5h16v11H9l-5 4z" text="WhatsApp support" />
          <Trust d="M4 12 12 4h8v8l-8 8zM15.5 8.5h.01" text="Retail and wholesale rates" />
          <Trust d="M12 3 5 6v6c0 4.2 3 7.2 7 9 4-1.8 7-4.8 7-9V6zM9 12l2.2 2.2L15.5 10" text="Prices checked when you order" />
        </ul>

        {/* Price mode */}
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[14px] border border-line bg-panel px-4 py-3">
          <ModeSwitch mode={mode} setMode={setMode} isDealer={isDealer} />
          <p className="min-w-[220px] flex-1 text-[13.5px] text-gold-soft">
            {mode === "wholesale"
              ? `Wholesale prices on. Each design has a minimum quantity. Orders start at ${money(settings.min_wholesale_order, settings.currency)}.`
              : isDealer
              ? "Retail prices on. Order any quantity."
              : profile?.dealer_status === "pending"
              ? "Your dealer application is under review. Wholesale prices appear once approved."
              : "Retail prices on. Are you a shop owner? Apply as a dealer to see wholesale prices."}
          </p>
        </div>

        {/* Category cards */}
        {categories.length > 0 && (
          <section className="mb-10" aria-label="Shop by category">
            <h2 className="section-title mb-4">Shop by category</h2>
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
              {categories.map((c) => {
                const img = cld(categoryImages[c], 600);
                return (
                  <button
                    key={c}
                    onClick={() => { setCat(c); goShop(); }}
                    className="group relative aspect-[4/5] overflow-hidden rounded-[14px] border border-line text-left transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl"
                    style={{ background: toneBg("gold") }}
                  >
                    {img ? (
                      <FadeImg src={img} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <ProductArt tone="gold" category={c} id={`cat-${c}`} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3.5 pt-12 text-white">
                      <div className="font-display text-2xl font-semibold leading-none">{c}</div>
                      <div className="mt-1 text-xs text-white/75">{counts[c] ?? 0} {(counts[c] ?? 0) === 1 ? "piece" : "pieces"}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* New arrivals and best sellers */}
        <Row title="New arrivals" items={newest} newSet={newSet} />
        <Row title="Best sellers" items={best} newSet={newSet} />

        {/* Full shop */}
        <section id="shop" className="scroll-mt-20 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          {sheet && <div className="fixed inset-0 z-40 bg-black/55 lg:hidden" onClick={() => setSheet(false)} />}
          <aside
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-line bg-panel p-5 pb-8 transition-transform duration-300 lg:visible lg:sticky lg:top-24 lg:z-auto lg:max-h-none lg:h-fit lg:translate-y-0 lg:self-start lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:pt-1 ${
              sheet ? "translate-y-0" : "invisible translate-y-full"
            }`}
            aria-label="Filters"
          >
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <b className="font-display text-2xl">Filters</b>
              <button className="btn h-9 w-9 p-0" onClick={() => setSheet(false)} aria-label="Close filters">×</button>
            </div>

            <div className="grid gap-6">
              <section className="lg:hidden">
                <ModeSwitch mode={mode} setMode={setMode} isDealer={isDealer} />
              </section>
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-gold">Categories</h4>
                <div className="grid gap-0.5">
                  {all.map((c) => (
                    <button
                      key={c}
                      onClick={() => pick(c)}
                      aria-pressed={cat === c}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left ${cat === c ? "bg-panel2 text-gold-soft" : "text-muted hover:text-cream"}`}
                    >
                      {label(c)}
                      <span className="text-[12.5px] tabular-nums">{c === "All" ? products.length : c === SAVED ? savedCount : counts[c] ?? 0}</span>
                    </button>
                  ))}
                </div>
              </section>
              <section className="grid gap-3.5">
                <h4 className="text-xs font-semibold uppercase tracking-[.12em] text-gold">Filter</h4>
                <label className="grid gap-1.5 text-[13px] text-muted">
                  <span>
                    Price up to <b className="font-medium text-cream">{money(cap, settings.currency)}</b>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((cap / top) * 100)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setLimit(v >= 100 ? null : Math.round((top * v) / 100 / 500) * 500);
                    }}
                    className="w-full accent-gold"
                  />
                </label>
                <label className="grid gap-1.5 text-[13px] text-muted">
                  Sort by
                  <select className="input" value={sort} onChange={(e) => setSort(e.target.value as "feat" | "lo" | "hi")}>
                    <option value="feat">Featured</option>
                    <option value="lo">Price: low to high</option>
                    <option value="hi">Price: high to low</option>
                  </select>
                </label>
              </section>
              <section className="grid gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-[.12em] text-gold">More</h4>
                {wa && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn justify-start">
                    Chat on WhatsApp
                  </a>
                )}
                {profile?.role === "admin" && <Link href="/admin" className="btn justify-start">Admin panel</Link>}
              </section>
              <button className="btn btn-gold py-3 lg:hidden" onClick={() => setSheet(false)}>
                Show {list.length} {list.length === 1 ? "piece" : "pieces"}
              </button>
            </div>
          </aside>

          <main className="min-w-0">
            <h2 className="section-title mb-3">All jewellery</h2>
            <div className="sticky top-[61px] z-10 -mx-4 flex gap-2.5 border-b border-line bg-ink px-4 py-3">
              <input className="input h-10" type="search" placeholder="Search by name or category" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
              <button className="btn h-10 shrink-0 px-3.5 lg:hidden" onClick={() => setSheet(true)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4" />
                </svg>
                Filters
              </button>
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 pt-3 lg:hidden">
              {all.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13.5px] ${cat === c ? "border-gold bg-panel text-gold-soft" : "border-line text-muted"}`}
                >
                  {label(c)}
                </button>
              ))}
            </div>

            <p className="py-3 text-[13px] text-muted">
              {list.length} {list.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-5" aria-live="polite">
              {list.map((p) => (
                <ProductCard key={p.id} p={p} isNew={newSet.has(p.id)} />
              ))}
              {!products.length && <Empty text="No products yet. Add your first piece from the admin panel." />}
              {products.length > 0 && !list.length && (
                <Empty text={cat === SAVED ? "You have not saved anything yet. Tap the heart on a piece to save it." : "Nothing matches these filters. Clear the search or raise the price limit."} />
              )}
            </div>
          </main>
        </section>
      </div>
    </>
  );
}

function Trust({ d, text }: { d: string; text: string }) {
  return (
    <li className="flex items-center gap-2.5 rounded-[12px] border border-line bg-panel px-3 py-2.5 text-muted">
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
      <span className="leading-snug">{text}</span>
    </li>
  );
}

function Row({ title, items, newSet }: { title: string; items: CatalogProduct[]; newSet: Set<string> }) {
  if (!items.length) return null;
  return (
    <section className="mb-10" aria-label={title}>
      <h2 className="section-title mb-4">{title}</h2>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-3 md:gap-5">
        {items.map((p) => (
          <div key={p.id} className="w-[200px] shrink-0 snap-start sm:w-[240px]">
            <ProductCard p={p} isNew={newSet.has(p.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="col-span-full rounded-[14px] border border-dashed border-line px-4 py-14 text-center text-muted">{text}</div>;
}

function ModeSwitch({ mode, setMode, isDealer }: { mode: "retail" | "wholesale"; setMode: (m: "retail" | "wholesale") => void; isDealer: boolean }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-panel p-[3px]" role="group" aria-label="Price mode">
      <button onClick={() => setMode("retail")} aria-pressed={mode === "retail"} className={`rounded-full px-4 py-1.5 text-[13.5px] font-medium ${mode === "retail" ? "bg-gold text-on-gold" : "text-muted"}`}>
        Retail
      </button>
      {isDealer ? (
        <button onClick={() => setMode("wholesale")} aria-pressed={mode === "wholesale"} className={`rounded-full px-4 py-1.5 text-[13.5px] font-medium ${mode === "wholesale" ? "bg-gold text-on-gold" : "text-muted"}`}>
          Wholesale
        </button>
      ) : (
        <Link href="/dealer" className="rounded-full px-4 py-1.5 text-[13.5px] font-medium text-muted" title="Wholesale is for approved dealers">
          Wholesale
        </Link>
      )}
    </div>
  );
}
