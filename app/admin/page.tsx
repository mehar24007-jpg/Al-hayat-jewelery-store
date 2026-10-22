import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { money } from "@/lib/format";

export default async function Dashboard() {
  const { sb } = await requireAdmin();
  const { data: s } = await sb.from("store_settings").select("currency").eq("id", 1).maybeSingle();
  const cur = s?.currency ?? "Rs";

  const [orders, items, low, pendingOrders, pendingDealers, pendingReviews] = await Promise.all([
    sb.from("orders").select("total,created_at,status").neq("status", "cancelled").order("created_at", { ascending: false }).limit(5000),
    sb.from("order_items").select("product_name,quantity,line_total,orders!inner(status)").neq("orders.status", "cancelled").limit(10000),
    sb.from("products").select("id,name,stock").eq("is_active", true).lte("stock", 5).order("stock").limit(8),
    sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("dealer_status", "pending"),
    sb.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
  ]);

  // Karachi is UTC+5, no daylight saving
  const day = (iso: string) => new Date(Date.parse(iso) + 5 * 3600e3).toISOString().slice(0, 10);
  const today = day(new Date().toISOString());
  const since = (n: number) => day(new Date(Date.now() - n * 86400e3).toISOString());
  let sToday = 0, nToday = 0, s7 = 0, s30 = 0;
  (orders.data ?? []).forEach((o: any) => {
    const d = day(o.created_at);
    const t = Number(o.total);
    if (d === today) { sToday += t; nToday++; }
    if (d >= since(6)) s7 += t;
    if (d >= since(29)) s30 += t;
  });

  const top = new Map<string, { qty: number; amount: number }>();
  (items.data ?? []).forEach((i: any) => {
    const c = top.get(i.product_name) ?? { qty: 0, amount: 0 };
    c.qty += i.quantity;
    c.amount += Number(i.line_total);
    top.set(i.product_name, c);
  });
  const best = [...top.entries()].sort((a, b) => b[1].amount - a[1].amount).slice(0, 6);

  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-gold-soft">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );

  return (
    <div className="grid gap-8">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sales today" value={money(sToday, cur)} sub={`${nToday} orders`} />
        <Stat label="Last 7 days" value={money(s7, cur)} />
        <Stat label="Last 30 days" value={money(s30, cur)} />
        <Stat label="Pending orders" value={String(pendingOrders.count ?? 0)} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/orders?status=pending" className="card p-4 hover:border-gold">New orders waiting <b className="float-right">{pendingOrders.count ?? 0}</b></Link>
        <Link href="/admin/dealers" className="card p-4 hover:border-gold">Dealer applications <b className="float-right">{pendingDealers.count ?? 0}</b></Link>
        <Link href="/admin/reviews" className="card p-4 hover:border-gold">Reviews to approve <b className="float-right">{pendingReviews.count ?? 0}</b></Link>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="h-display mb-3 text-2xl">Best sellers</h2>
          <div className="card divide-y divide-line">
            {best.length === 0 && <p className="p-4 text-muted">No sales yet.</p>}
            {best.map(([name, v]) => (
              <div key={name} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="[overflow-wrap:anywhere]">{name}</span>
                <span className="shrink-0 tabular-nums text-muted">{v.qty} sold · <span className="text-cream">{money(v.amount, cur)}</span></span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="h-display mb-3 text-2xl">Low stock</h2>
          <div className="card divide-y divide-line">
            {(low.data ?? []).length === 0 && <p className="p-4 text-muted">Nothing is running low.</p>}
            {(low.data ?? []).map((p: any) => (
              <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-panel2">
                <span className="[overflow-wrap:anywhere]">{p.name}</span>
                <span className={p.stock === 0 ? "text-warn" : "text-gold-soft"}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
