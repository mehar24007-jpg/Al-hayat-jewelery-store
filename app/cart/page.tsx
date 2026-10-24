"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toneBg } from "@/components/ProductArt";
import { cld, money, waNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import type { Quote } from "@/lib/types";

type Pay = "cod" | "bank_transfer" | "jazzcash" | "easypaisa";

export default function CartPage() {
  const router = useRouter();
  const { cart, mode, settings, profile, email, setQty, remove, clear, isDealer } = useStore();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<Pay>("cod");
  const [payRef, setPayRef] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName((v) => v || profile.full_name || "");
    setPhone((v) => v || profile.phone || "");
    setCity((v) => v || profile.city || "");
  }, [profile]);

  const items = useMemo(() => cart.map((c) => ({ product_id: c.id, qty: c.qty, ...(c.size ? { size: c.size } : {}) })), [cart]);

  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const sb = createClient();
      const { data, error } = await sb.rpc("quote_cart", { p_items: items, p_mode: mode, p_coupon: coupon || null });
      setLoading(false);
      if (!error && data) setQuote(data as Quote);
    }, 250);
    return () => clearTimeout(t);
  }, [items, mode, coupon]);

  const cur = quote?.currency ?? settings.currency;
  const blocked = !quote || quote.issues.length > 0 || quote.lines.length === 0 || loading;

  function whatsappText(): string {
    if (!quote) return "";
    const L = [`*${settings.store_name} ${settings.store_sub}: new order*`, `Mode: ${quote.mode === "wholesale" ? "Wholesale" : "Retail"}`, ""];
    quote.lines.forEach((l, i) => {
      L.push(`${i + 1}. ${l.name}${l.size ? ` (Size ${l.size})` : ""}`, `   ${l.qty} x ${money(l.unit_price, cur)} = ${money(l.line_total, cur)}`);
    });
    L.push("", `Total pieces: ${quote.lines.reduce((n, l) => n + l.qty, 0)}`);
    if (quote.discount > 0) L.push(`Discount: -${money(quote.discount, cur)}`);
    if (quote.delivery_fee > 0) L.push(`Delivery: ${money(quote.delivery_fee, cur)}`);
    L.push(`*Total: ${money(quote.total, cur)}*`, "", `Name: ${name}`, `Phone: ${phone}`, `City: ${city}`, `Address: ${address}`);
    return L.join("\n");
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!quote || blocked) return;
    setPlacing(true);
    setError("");
    const sb = createClient();
    const { data, error } = await sb.rpc("place_order_v2", {
      p_items: items,
      p_mode: quote.mode,
      p_customer_name: name,
      p_phone: phone,
      p_address: address,
      p_city: city,
      p_payment_method: pay,
      p_coupon: coupon || null,
      p_notes: notes || null,
      p_payment_ref: payRef.trim() || null,
    });
    setPlacing(false);
    if (error || !data || !data[0]) {
      setError(error?.message || "Could not place the order. Try again.");
      return;
    }
    const o = data[0] as { o_id: string; o_number: string; o_total: number };
    try {
      sessionStorage.setItem(
        "ah_last",
        JSON.stringify({ id: o.o_id, number: o.o_number, total: Number(o.o_total), mode: quote.mode, currency: cur, lines: quote.lines, discount: quote.discount, delivery_fee: quote.delivery_fee, name, phone, city, address, pay, ref: payRef.trim() })
      );
    } catch {}
    clear();
    router.push("/thanks");
  }

  if (!cart.length) {
    return (
      <main className="wrap py-16 text-center">
        <h1 className="h-display text-4xl">Your cart is empty</h1>
        <p className="mt-2 text-muted">Add a piece from the shop to get started.</p>
        <Link href="/" className="btn btn-gold mt-6">Browse the shop</Link>
      </main>
    );
  }

  const wa = waNumber(settings.whatsapp);

  return (
    <main className="wrap grid gap-8 py-8 lg:grid-cols-[1fr_400px]">
      <section className="min-w-0">
        <h1 className="h-display mb-1 text-4xl">Your cart</h1>
        <p className="mb-4 text-sm text-gold-soft">{quote?.mode === "wholesale" ? "Wholesale prices" : "Retail prices"}{!isDealer && " · Dealers get wholesale rates after approval"}</p>

        <div className="grid gap-0">
          {(quote?.lines ?? []).map((l) => {
            const low = quote!.mode === "wholesale" && l.qty < l.moq;
            return (
              <div key={`${l.product_id}|${l.size ?? ""}`} className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-3.5">
                <Link href={`/product/${l.slug}`} className="grid h-16 w-16 place-items-center overflow-hidden rounded-[10px]" style={{ background: toneBg(l.tone) }}>
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cld(l.image, 160) ?? l.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl text-gold">◆</span>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link href={`/product/${l.slug}`} className="block font-display text-lg font-semibold leading-tight [overflow-wrap:anywhere]">{l.name}</Link>
                  {l.size && <span className="mr-2 rounded-full border border-line px-2 py-0.5 text-xs text-gold-soft">Size {l.size}</span>}
                  <span className="text-[12.5px] tabular-nums text-muted">
                    {money(l.unit_price, cur)} each{quote!.mode === "wholesale" ? ` · min ${l.moq}` : ""}
                  </span>
                  {low && <em className="block text-xs not-italic text-warn">Add {l.moq - l.qty} more to meet the minimum</em>}
                </div>
                <div className="inline-flex items-center rounded-lg border border-line">
                  <button className="h-8 w-8" onClick={() => setQty(l.product_id, l.qty - 1, l.size)} aria-label="Fewer">−</button>
                  <span className="min-w-7 text-center tabular-nums">{l.qty}</span>
                  <button className="h-8 w-8" onClick={() => setQty(l.product_id, l.qty + 1, l.size)} aria-label="More">+</button>
                </div>
                <div className="col-span-3 flex items-center justify-between pl-[76px]">
                  <button className="text-[12.5px] text-muted underline" onClick={() => remove(l.product_id, l.size)}>Remove</button>
                  <strong className="tabular-nums text-gold-soft">{money(l.line_total, cur)}</strong>
                </div>
              </div>
            );
          })}
          {!quote && <p className="py-6 text-muted">Updating prices…</p>}
        </div>

        {quote && quote.issues.length > 0 && (
          <ul className="card mt-4 grid gap-1 border-warn p-4 text-sm text-warn" role="alert">
            {quote.issues.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-start gap-2">
          <input className="input max-w-[220px] uppercase" placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} aria-label="Coupon code" />
          <button className="btn" onClick={() => setCoupon(couponInput.trim().toUpperCase())}>Apply</button>
          {coupon && <button className="btn" onClick={() => { setCoupon(""); setCouponInput(""); }}>Remove</button>}
        </div>
        {quote?.coupon_error && <p className="err mt-1.5">{quote.coupon_error}</p>}
        {quote && quote.discount > 0 && <p className="mt-1.5 text-sm text-ok">Coupon applied. You save {money(quote.discount, cur)}.</p>}
      </section>

      <form onSubmit={placeOrder} className="card h-fit min-w-0 p-5 lg:sticky lg:top-24">
        <h2 className="h-display mb-3 text-2xl">Checkout</h2>
        <dl className="mb-4 grid gap-1.5 text-sm tabular-nums">
          <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd>{money(quote?.subtotal ?? 0, cur)}</dd></div>
          {quote && quote.discount > 0 && <div className="flex justify-between text-ok"><dt>Discount</dt><dd>−{money(quote.discount, cur)}</dd></div>}
          <div className="flex justify-between text-muted"><dt>Delivery</dt><dd>{quote && quote.delivery_fee > 0 ? money(quote.delivery_fee, cur) : "Free"}</dd></div>
          <div className="flex justify-between text-lg font-semibold"><dt>Total</dt><dd>{money(quote?.total ?? 0, cur)}</dd></div>
        </dl>

        {!email && (
          <p className="note mb-3">
            Ordering as a guest. <Link href="/login?next=/cart" className="text-gold-soft underline">Sign in</Link> to keep your order history and get invoices.
          </p>
        )}

        <div className="grid gap-3">
          <div><label className="label" htmlFor="c-name">Full name</label><input id="c-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          <div><label className="label" htmlFor="c-phone">Phone / WhatsApp</label><input id="c-phone" className="input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="c-city">City</label><input id="c-city" className="input" required value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="col-span-2"><label className="label" htmlFor="c-addr">Delivery address</label><input id="c-addr" className="input" required value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" /></div>
          </div>
          <div><label className="label" htmlFor="c-notes">Notes (optional)</label><input id="c-notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>

          <fieldset className="grid gap-2">
            <legend className="label">Payment</legend>
            {(
              [
                ["cod", "Cash on delivery"],
                ["bank_transfer", "Bank transfer"],
                ...(settings.jazzcash_number ? [["jazzcash", "JazzCash"]] : []),
                ...(settings.easypaisa_number ? [["easypaisa", "Easypaisa"]] : []),
              ] as [Pay, string][]
            ).map(([v, label]) => (
              <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${pay === v ? "border-gold" : "border-line"}`}>
                <input
                  type="radio"
                  name="pay"
                  checked={pay === v}
                  onChange={() => {
                    setPay(v);
                    setPayRef("");
                  }}
                  className="accent-gold"
                />{" "}
                {label}
              </label>
            ))}
            {pay === "bank_transfer" && (
              <div className="rounded-lg border border-line bg-ink p-3 text-sm">
                {settings.bank_details ? (
                  <>
                    <p className="mb-1 text-muted">Send the total to this account, then message us the receipt on WhatsApp.</p>
                    <pre className="whitespace-pre-wrap font-body text-cream">{settings.bank_details}</pre>
                  </>
                ) : (
                  <p className="text-muted">We will send the account details on WhatsApp after you place the order.</p>
                )}
              </div>
            )}
            {(pay === "jazzcash" || pay === "easypaisa") && (
              <div className="rounded-lg border border-line bg-ink p-3 text-sm">
                <p className="text-muted">
                  Send <b className="text-cream">{money(quote?.total ?? 0, cur)}</b> to this {pay === "jazzcash" ? "JazzCash" : "Easypaisa"} account:
                </p>
                <p className="my-1 text-lg font-semibold tabular-nums text-gold-soft">{pay === "jazzcash" ? settings.jazzcash_number : settings.easypaisa_number}</p>
                {(pay === "jazzcash" ? settings.jazzcash_title : settings.easypaisa_title) && (
                  <p className="text-muted">Account name: {pay === "jazzcash" ? settings.jazzcash_title : settings.easypaisa_title}</p>
                )}
                <label className="label mt-3" htmlFor="c-ref">Transaction ID from your payment</label>
                <input id="c-ref" className="input" required value={payRef} onChange={(e) => setPayRef(e.target.value)} maxLength={80} placeholder="e.g. 3456789012" />
                <p className="note mt-1">We confirm your order once we see the payment.</p>
              </div>
            )}
          </fieldset>
        </div>

        {error && <p className="err mt-3" role="alert">{error}</p>}
        <button className="btn btn-gold mt-4 w-full py-3" disabled={blocked || placing}>{placing ? "Placing order" : "Place order"}</button>
        {wa && quote && quote.lines.length > 0 && (
          <a
            className={`btn mt-2.5 w-full ${blocked ? "pointer-events-none opacity-45" : ""}`}
            href={`https://wa.me/${wa}?text=${encodeURIComponent(whatsappText())}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send cart on WhatsApp instead
          </a>
        )}
        <p className="note mt-2">Prices and stock are checked again when you place the order.</p>
      </form>
    </main>
  );
}
