"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money, waNumber } from "@/lib/format";
import { useStore } from "@/lib/store";

type Last = {
  id: string;
  number: string;
  total: number;
  mode: string;
  currency: string;
  lines: { name: string; size?: string | null; qty: number; unit_price: number; line_total: number }[];
  discount: number;
  delivery_fee: number;
  name: string;
  phone: string;
  city: string;
  address: string;
  pay: string;
  ref?: string;
};

const PAY_LABEL: Record<string, string> = { cod: "Cash on delivery", bank_transfer: "Bank transfer", jazzcash: "JazzCash", easypaisa: "Easypaisa" };

export default function ThanksPage() {
  const { settings, email } = useStore();
  const [o, setO] = useState<Last | null>(null);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("ah_last");
      if (s) setO(JSON.parse(s));
    } catch {}
  }, []);

  if (!o) {
    return (
      <main className="wrap py-16 text-center">
        <h1 className="h-display text-4xl">No recent order</h1>
        <Link href="/" className="btn btn-gold mt-6">Back to the shop</Link>
      </main>
    );
  }

  const L = [`*${settings.store_name} ${settings.store_sub}: order ${o.number}*`, `Mode: ${o.mode === "wholesale" ? "Wholesale" : "Retail"}`, ""];
  o.lines.forEach((l, i) => L.push(`${i + 1}. ${l.name}${l.size ? ` (Size ${l.size})` : ""}`, `   ${l.qty} x ${money(l.unit_price, o.currency)} = ${money(l.line_total, o.currency)}`));
  if (o.discount > 0) L.push("", `Discount: -${money(o.discount, o.currency)}`);
  L.push("", `*Total: ${money(o.total, o.currency)}*`, `Payment: ${PAY_LABEL[o.pay] ?? o.pay}${o.ref ? ` (transaction ID ${o.ref})` : ""}`, "", `Name: ${o.name}`, `Phone: ${o.phone}`, `City: ${o.city}`, `Address: ${o.address}`);
  const wa = waNumber(settings.whatsapp);

  return (
    <main className="wrap max-w-2xl py-12">
      <div className="card p-6">
        <p className="text-sm text-ok">Order placed</p>
        <h1 className="h-display text-4xl">Thank you, {o.name.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">Your order number is <b className="text-cream">{o.number}</b>. We will confirm it shortly.</p>

        <ul className="mt-5 divide-y divide-line border-y border-line text-sm tabular-nums">
          {o.lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-3 py-2"><span className="[overflow-wrap:anywhere]">{l.qty} × {l.name}{l.size ? ` (Size ${l.size})` : ""}</span><span>{money(l.line_total, o.currency)}</span></li>
          ))}
          <li className="flex justify-between py-2 text-lg font-semibold"><span>Total</span><span>{money(o.total, o.currency)}</span></li>
        </ul>

        {(o.pay === "jazzcash" || o.pay === "easypaisa") && (
          <p className="mt-4 rounded-lg border border-line bg-ink p-3 text-sm text-muted">
            Payment by {PAY_LABEL[o.pay]}, transaction ID <b className="text-cream">{o.ref}</b>. We will confirm your order once we see the payment.
          </p>
        )}
        {o.pay === "bank_transfer" && (
          <p className="mt-4 rounded-lg border border-line bg-ink p-3 text-sm text-muted">
            Bank transfer: send {money(o.total, o.currency)} to the account shown at checkout{settings.bank_details ? ":" : ". We will send the details on WhatsApp."}
            {settings.bank_details && <span className="mt-1 block whitespace-pre-wrap text-cream">{settings.bank_details}</span>}
          </p>
        )}

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {wa && (
            <a className="btn btn-gold" href={`https://wa.me/${wa}?text=${encodeURIComponent(L.join("\n"))}`} target="_blank" rel="noopener noreferrer">
              Send order on WhatsApp
            </a>
          )}
          {email && <Link className="btn" href={`/orders/${o.id}`}>View invoice</Link>}
          <Link className="btn" href="/">Continue shopping</Link>
        </div>
        <p className="note mt-3">Sending the order on WhatsApp helps us confirm faster. Your order is already saved.</p>
      </div>
    </main>
  );
}
