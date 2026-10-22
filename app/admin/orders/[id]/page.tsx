import Link from "next/link";
import { notFound } from "next/navigation";
import Flash from "@/components/admin/Flash";
import { requireAdmin } from "@/lib/session";
import { dateTime, money, waNumber } from "@/lib/format";
import { updateOrder } from "../../actions";

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { sb } = await requireAdmin();
  const [{ data: o }, { data: items }] = await Promise.all([
    sb.from("orders").select("*").eq("id", id).maybeSingle(),
    sb.from("order_items").select("*").eq("order_id", id).order("product_name"),
  ]);
  if (!o) notFound();
  const wa = waNumber(o.phone);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-muted hover:text-cream">← All orders</Link>
      <h1 className="h-display mb-1 mt-2 text-3xl">{o.order_number}</h1>
      <p className="mb-4 text-sm text-muted">{dateTime(o.created_at)} · <span className="capitalize">{o.mode}</span> order</p>
      <Flash error={error} />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card p-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">Customer</h2>
          <div className="font-medium">{o.customer_name}</div>
          <div>{o.phone}</div>
          <div className="text-muted [overflow-wrap:anywhere]">{[o.address, o.city].filter(Boolean).join(", ")}</div>
          {o.notes && <div className="mt-2 text-muted">Note: {o.notes}</div>}
          {o.payment_reference && (
            <div className="mt-2 rounded-lg border border-gold px-3 py-2">
              <span className="text-muted">{o.payment_method === "jazzcash" ? "JazzCash" : o.payment_method === "easypaisa" ? "Easypaisa" : "Payment"} transaction ID: </span>
              <b className="select-all tabular-nums text-gold-soft">{o.payment_reference}</b>
              <div className="text-xs text-muted">Check this in your app, then mark the order as paid.</div>
            </div>
          )}
          {wa && <a className="btn btn-sm mt-3" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>}
        </section>

        <form action={updateOrder.bind(null, id)} className="card grid gap-3 p-4 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Update order</h2>
          <div>
            <label className="label" htmlFor="status">Order status</label>
            <select id="status" name="status" className="input" defaultValue={o.status}>
              {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="payment_status">Payment ({o.payment_method.replace("_", " ")})</label>
            <select id="payment_status" name="payment_status" className="input" defaultValue={o.payment_status}>
              {["unpaid", "paid", "failed", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-gold">Save</button>
          <p className="note">Cancelling an order puts its pieces back in stock.</p>
        </form>
      </div>

      <section className="card mt-4 overflow-x-auto p-4">
        <table className="w-full min-w-[420px] text-sm tabular-nums">
          <thead><tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted"><th className="py-2 font-medium">Item</th><th className="py-2 text-right font-medium">Price</th><th className="py-2 text-right font-medium">Qty</th><th className="py-2 text-right font-medium">Amount</th></tr></thead>
          <tbody>
            {(items ?? []).map((i: any) => (
              <tr key={i.id} className="border-b border-line"><td className="py-2 [overflow-wrap:anywhere]">{i.product_name}</td><td className="py-2 text-right">{money(i.unit_price)}</td><td className="py-2 text-right">{i.quantity}</td><td className="py-2 text-right">{money(i.line_total)}</td></tr>
            ))}
          </tbody>
        </table>
        <dl className="ml-auto mt-4 grid max-w-xs gap-1 text-sm tabular-nums">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
          {Number(o.discount) > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {o.coupon_code ? `(${o.coupon_code})` : ""}</dt><dd>−{money(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{money(o.delivery_fee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold"><dt>Total</dt><dd>{money(o.total)}</dd></div>
        </dl>
      </section>
      <Link href={`/orders/${id}`} className="btn mt-4">Open invoice</Link>
    </div>
  );
}
