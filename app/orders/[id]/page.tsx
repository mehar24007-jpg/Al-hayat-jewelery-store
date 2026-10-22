import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { requireUser } from "@/lib/session";
import { dateTime, money } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAY: Record<string, string> = { cod: "Cash on delivery", bank_transfer: "Bank transfer", jazzcash: "JazzCash", easypaisa: "Easypaisa" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireUser(`/orders/${id}`);
  const [{ data: o }, { data: items }, { data: s }] = await Promise.all([
    sb.from("orders").select("*").eq("id", id).maybeSingle(),
    sb.from("order_items").select("*").eq("order_id", id).order("product_name"),
    sb.from("store_settings").select("store_name,store_sub,whatsapp,currency").eq("id", 1).maybeSingle(),
  ]);
  if (!o) notFound();
  const cur = s?.currency ?? "Rs";

  return (
    <main className="wrap max-w-3xl py-10">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/account" className="text-sm text-muted hover:text-cream">← Your orders</Link>
        <PrintButton />
      </div>
      <article className="invoice card p-6 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <div className="font-display text-3xl font-semibold">{s?.store_name} {s?.store_sub}</div>
            {s?.whatsapp && <div className="text-sm text-muted">WhatsApp {s.whatsapp}</div>}
          </div>
          <div className="text-right text-sm">
            <div className="text-xs uppercase tracking-wide text-muted">Invoice</div>
            <div className="text-xl font-semibold">{o.order_number}</div>
            <div className="text-muted">{dateTime(o.created_at)}</div>
          </div>
        </header>

        <section className="grid gap-4 py-5 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">Billed to</div>
            <div className="font-medium">{o.customer_name}</div>
            <div>{o.phone}</div>
            <div className="text-muted">{[o.address, o.city].filter(Boolean).join(", ")}</div>
          </div>
          <div className="sm:text-right">
            <div><span className="text-muted">Price mode: </span><span className="capitalize">{o.mode}</span></div>
            <div><span className="text-muted">Payment: </span>{PAY[o.payment_method] ?? o.payment_method} ({o.payment_status}){o.payment_reference ? `, ref ${o.payment_reference}` : ""}</div>
            <div><span className="text-muted">Status: </span><span className="capitalize">{o.status}</span></div>
          </div>
        </section>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 font-medium">Item</th><th className="py-2 text-right font-medium">Price</th><th className="py-2 text-right font-medium">Qty</th><th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((i: any) => (
                <tr key={i.id} className="border-b border-line">
                  <td className="py-2.5 [overflow-wrap:anywhere]">{i.product_name}</td>
                  <td className="py-2.5 text-right">{money(i.unit_price, cur)}</td>
                  <td className="py-2.5 text-right">{i.quantity}</td>
                  <td className="py-2.5 text-right">{money(i.line_total, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto mt-5 grid max-w-xs gap-1.5 text-sm tabular-nums">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(o.subtotal, cur)}</dd></div>
          {Number(o.discount) > 0 && <div className="flex justify-between"><dt className="text-muted">Discount {o.coupon_code ? `(${o.coupon_code})` : ""}</dt><dd>−{money(o.discount, cur)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{Number(o.delivery_fee) > 0 ? money(o.delivery_fee, cur) : "Free"}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold"><dt>Total</dt><dd>{money(o.total, cur)}</dd></div>
        </dl>
        <p className="mt-8 text-center text-xs text-muted">Thank you for shopping with {s?.store_name}.</p>
      </article>
    </main>
  );
}
