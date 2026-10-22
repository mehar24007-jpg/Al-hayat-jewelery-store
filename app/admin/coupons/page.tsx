import Flash from "@/components/admin/Flash";
import { requireAdmin } from "@/lib/session";
import { dateTime, money } from "@/lib/format";
import { addCoupon, deleteCoupon, toggleCoupon } from "../actions";

export default async function AdminCoupons({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { sb } = await requireAdmin();
  const { data: coupons } = await sb.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <h1 className="h-display mb-4 text-3xl">Coupons</h1>
      <Flash error={error} />

      <form action={addCoupon} className="card mb-6 grid gap-3 p-4 sm:grid-cols-3">
        <div><label className="label" htmlFor="code">Code</label><input id="code" name="code" className="input uppercase" placeholder="EID10" required maxLength={30} /></div>
        <div><label className="label" htmlFor="kind">Type</label><select id="kind" name="kind" className="input"><option value="percent">Percent off</option><option value="fixed">Fixed amount off</option></select></div>
        <div><label className="label" htmlFor="value">Value</label><input id="value" name="value" type="number" min={1} step="any" className="input" required /></div>
        <div><label className="label" htmlFor="min_order">Minimum order</label><input id="min_order" name="min_order" type="number" min={0} step="any" defaultValue={0} className="input" /></div>
        <div><label className="label" htmlFor="applies_to">Works on</label><select id="applies_to" name="applies_to" className="input"><option value="all">Retail and wholesale</option><option value="retail">Retail only</option><option value="wholesale">Wholesale only</option></select></div>
        <div><label className="label" htmlFor="max_uses">Total uses (optional)</label><input id="max_uses" name="max_uses" type="number" min={1} className="input" placeholder="Unlimited" /></div>
        <div><label className="label" htmlFor="expires_at">Last day (optional)</label><input id="expires_at" name="expires_at" type="date" className="input" /></div>
        <div className="flex items-end sm:col-span-2"><button className="btn btn-gold">Create coupon</button></div>
      </form>

      <div className="grid gap-2.5">
        {(coupons ?? []).map((c: any) => (
          <div key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-3.5">
            <div className="min-w-0 text-sm">
              <b className="text-base">{c.code}</b> <span className={`pill ${c.is_active ? "border-ok text-ok" : ""}`}>{c.is_active ? "Active" : "Paused"}</span>
              <div className="text-muted">
                {c.kind === "percent" ? `${Number(c.value)}% off` : `${money(c.value)} off`} · min order {money(c.min_order)} · {c.applies_to === "all" ? "retail and wholesale" : `${c.applies_to} only`}
              </div>
              <div className="text-xs text-muted">Used {c.used_count}{c.max_uses ? ` of ${c.max_uses}` : ""} times{c.expires_at ? ` · ends ${dateTime(c.expires_at)}` : ""}</div>
            </div>
            <div className="flex gap-2">
              <form action={toggleCoupon.bind(null, c.id, !c.is_active)}><button className="btn btn-sm">{c.is_active ? "Pause" : "Resume"}</button></form>
              <form action={deleteCoupon.bind(null, c.id)}><button className="btn btn-sm btn-danger">Delete</button></form>
            </div>
          </div>
        ))}
        {!coupons?.length && <p className="text-muted">No coupons yet.</p>}
      </div>
    </div>
  );
}
