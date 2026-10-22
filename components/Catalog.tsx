"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { money, waNumber } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CatalogProduct } from "@/lib/types";

export default function Catalog({ products, categories }: { products: CatalogProduct[]; categories: string[] }) {
  const { settings, mode, setMode, isDealer, profile } = useStore();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"feat" | "lo" | "hi">("feat");
  const [limit, setLimit] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);

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
      (p) => (cat === "All" || p.category === cat) && priceOf(p) <= cap && (!s || `${p.name} ${p.category}`.toLowerCase().includes(s))
    );
    if (sort === "lo") out.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "hi") out.sort((a, b) => priceOf(b) - priceOf(a));
    return out;
  }, [products, cat, q, sort, cap, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const wa = waNumber(settings.whatsapp);
  const all = ["All", ...categories];

  return (
    <div className="wrap lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      {menu && <div className="fixed inset-0 z-40 bg-black/55 lg:hidden" onClick={() => setMenu(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(320px,86%)] overflow-y-auto border-r border-line bg-panel p-5 transition-transform lg:visible lg:sticky lg:top-24 lg:z-auto lg:h-fit lg:w-auto lg:translate-x-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:pt-5 ${
          menu ? "translate-x-0" : "invisible -translate-x-full"
        }`}
        aria-label="Menu"
      >
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <b className="font-display text-2xl">Menu</b>
          <button className="btn h-9 w-9 p-0" onClick={() => setMenu(false)} aria-label="Close menu">×</button>
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
                  onClick={() => {
                    setCat(c);
                    setMenu(false);
                  }}
                  aria-pressed={cat === c}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left ${cat === c ? "bg-panel2 text-gold-soft" : "text-muted hover:text-cream"}`}
                >
                  {c}
                  <span className="text-[12.5px] tabular-nums">{c === "All" ? products.length : counts[c] ?? 0}</span>
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
            <Link href="/cart" className="btn justify-start">View cart</Link>
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn justify-start">
                Chat on WhatsApp
              </a>
            )}
            {profile?.role === "admin" && <Link href="/admin" className="btn justify-start">Admin panel</Link>}
          </section>
        </div>
      </aside>

      <main className="min-w-0">
        <section className="grid gap-2 pb-2 pt-6">
          <h1 className="font-display text-[clamp(30px,5.5vw,48px)] font-medium leading-[1.05] [text-wrap:balance]">{settings.hero_title}</h1>
          <p className="max-w-[60ch] text-muted">{settings.hero_text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2.5">
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
        </section>

        <div className="sticky top-[65px] z-10 -mx-4 flex gap-2.5 border-b border-line bg-ink px-4 py-3">
          <button className="btn h-10 w-10 shrink-0 p-0 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">☰</button>
          <input className="input h-10" type="search" placeholder="Search by name or category" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 pt-3 lg:hidden [scrollbar-width:none]">
          {all.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13.5px] ${cat === c ? "border-gold bg-panel text-gold-soft" : "border-line text-muted"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="py-3 text-[13px] text-muted">
          {list.length} {list.length === 1 ? "piece" : "pieces"}
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-5" aria-live="polite">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
          {!products.length && <Empty text="No products yet. Add your first piece from the admin panel." />}
          {products.length > 0 && !list.length && <Empty text="Nothing matches these filters. Clear the search or raise the price limit." />}
        </div>
        <div className="h-12" />
      </main>
    </div>
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
