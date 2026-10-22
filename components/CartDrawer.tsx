"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toneBg } from "./ProductArt";
import { cld, money } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import type { Quote } from "@/lib/types";

/** Cart that slides in from the right. Prices come from the database, same as the checkout page. */
export default function CartDrawer() {
  const { cart, mode, settings, setQty, remove, cartOpen, setCartOpen } = useStore();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);

  const items = useMemo(() => cart.map((c) => ({ product_id: c.id, qty: c.qty })), [cart]);

  useEffect(() => {
    if (!cartOpen) return;
    if (!items.length) {
      setQuote(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const sb = createClient();
      const { data, error } = await sb.rpc("quote_cart", { p_items: items, p_mode: mode, p_coupon: null });
      setLoading(false);
      if (!error && data) setQuote(data as Quote);
    }, 200);
    return () => clearTimeout(t);
  }, [items, mode, cartOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [cartOpen, setCartOpen]);

  const cur = quote?.currency ?? settings.currency;
  const lines = quote?.lines ?? [];
  const close = () => setCartOpen(false);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/55 transition-opacity ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(420px,100%)] flex-col border-l border-line bg-panel shadow-2xl transition-transform duration-300 ${cartOpen ? "translate-x-0" : "invisible translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        aria-hidden={!cartOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl font-semibold">Your cart</h2>
          <button className="btn h-9 w-9 p-0" onClick={close} aria-label="Close cart">×</button>
        </div>

        {!cart.length ? (
          <div className="grid flex-1 place-content-center gap-3 px-6 text-center">
            <p className="font-display text-2xl">Your cart is empty</p>
            <p className="text-sm text-muted">Add a piece from the shop to get started.</p>
            <Link href="/#shop" onClick={close} className="btn btn-gold mx-auto mt-2">Browse the shop</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {!quote && <p className="py-6 text-sm text-muted">Updating prices…</p>}
              {lines.map((l) => {
                const low = quote!.mode === "wholesale" && l.qty < l.moq;
                return (
                  <div key={l.product_id} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-line py-4">
                    <Link href={`/product/${l.slug}`} onClick={close} className="grid h-16 w-16 place-items-center overflow-hidden rounded-[10px]" style={{ background: toneBg(l.tone) }}>
                      {l.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cld(l.image, 160) ?? l.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl text-gold">◆</span>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/product/${l.slug}`} onClick={close} className="block font-display text-lg font-semibold leading-tight [overflow-wrap:anywhere]">{l.name}</Link>
                      <div className="text-[12.5px] tabular-nums text-muted">
                        {money(l.unit_price, cur)} each{quote!.mode === "wholesale" ? ` · min ${l.moq}` : ""}
                      </div>
                      {low && <em className="block text-xs not-italic text-warn">Add {l.moq - l.qty} more to meet the minimum</em>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-line">
                          <button className="h-8 w-8" onClick={() => setQty(l.product_id, l.qty - 1)} aria-label="Fewer">−</button>
                          <span className="min-w-7 text-center tabular-nums">{l.qty}</span>
                          <button className="h-8 w-8" onClick={() => setQty(l.product_id, l.qty + 1)} aria-label="More">+</button>
                        </div>
                        <strong className="tabular-nums text-gold-soft">{money(l.line_total, cur)}</strong>
                      </div>
                      <button className="mt-1 text-[12.5px] text-muted underline" onClick={() => remove(l.product_id)}>Remove</button>
                    </div>
                  </div>
                );
              })}
              {quote && quote.issues.length > 0 && (
                <ul className="my-3 grid gap-1 rounded-lg border border-warn p-3 text-sm text-warn" role="alert">
                  {quote.issues.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              )}
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-1 flex justify-between text-sm text-muted tabular-nums">
                <span>Subtotal</span>
                <span>{money(quote?.subtotal ?? 0, cur)}</span>
              </div>
              <p className="mb-3 text-xs text-muted">Delivery and coupons are added at checkout.</p>
              <Link
                href="/cart"
                onClick={close}
                className={`btn btn-gold w-full py-3 ${loading ? "pointer-events-none opacity-60" : ""}`}
              >
                Checkout
              </Link>
              <button className="btn mt-2 w-full" onClick={close}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
