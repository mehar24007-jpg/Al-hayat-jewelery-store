import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { dateTime, money } from "@/lib/format";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { sb } = await requireAdmin();
  let q = sb.from("orders").select("id,order_number,customer_name,phone,city,mode,status,payment_method,payment_status,total,created_at").order("created_at", { ascending: false }).limit(200);
  if (status && STATUSES.includes(status)) q = q.eq("status", status);
  const { data: orders } = await q;

  return (
    <div>
      <h1 className="h-display mb-4 text-3xl">Orders</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={`pill ${!status ? "border-gold text-gold-soft" : ""}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`pill capitalize ${status === s ? "border-gold text-gold-soft" : ""}`}>{s}</Link>
        ))}
      </div>
      <div className="grid gap-2.5">
        {(orders ?? []).map((o: any) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="card grid items-center gap-2 p-3.5 hover:border-gold sm:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <b>{o.order_number}</b> <span className="pill ml-1 capitalize">{o.status}</span> <span className="pill capitalize">{o.mode}</span>
              <div className="text-sm text-muted [overflow-wrap:anywhere]">{o.customer_name} · {o.phone} · {o.city}</div>
              <div className="text-xs text-muted">{dateTime(o.created_at)} · {o.payment_method.replace("_", " ")} ({o.payment_status})</div>
            </div>
            <div className="text-lg font-semibold tabular-nums text-gold-soft">{money(o.total)}</div>
          </Link>
        ))}
        {!orders?.length && <p className="text-muted">No orders {status ? `with status ${status}` : "yet"}.</p>}
      </div>
    </div>
  );
}
