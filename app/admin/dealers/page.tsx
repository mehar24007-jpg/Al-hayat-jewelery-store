import Link from "next/link";
import Flash from "@/components/admin/Flash";
import { requireAdmin } from "@/lib/session";
import { waNumber } from "@/lib/format";
import { setDealer } from "../actions";

const ORDER: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };

export default async function AdminDealers({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("profiles").select("id,full_name,phone,shop_name,city,dealer_status,dealer_discount_pct").neq("dealer_status", "none");
  const dealers = [...(data ?? [])].sort((a: any, b: any) => ORDER[a.dealer_status] - ORDER[b.dealer_status]);

  return (
    <div className="max-w-3xl">
      <h1 className="h-display mb-1 text-3xl">Dealers</h1>
      <p className="mb-4 text-sm text-muted">Approve shops to unlock wholesale prices. The discount below is taken off every wholesale price for that dealer. For a different price on one product, open Special prices.</p>
      <Flash error={error} />
      <div className="grid gap-3">
        {dealers.map((d: any) => {
          const wa = waNumber(d.phone);
          return (
            <div key={d.id} className="card grid gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <b className="[overflow-wrap:anywhere]">{d.shop_name || "(no shop name)"}</b> <span className={`pill capitalize ${d.dealer_status === "approved" ? "border-ok text-ok" : d.dealer_status === "pending" ? "border-gold text-gold-soft" : "border-warn text-warn"}`}>{d.dealer_status}</span>
                  <div className="text-sm text-muted">{d.full_name} · {d.phone} · {d.city}</div>
                </div>
                {wa && <a className="btn btn-sm" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
              </div>
              <form action={setDealer.bind(null, d.id)} className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="label" htmlFor={`st-${d.id}`}>Status</label>
                  <select id={`st-${d.id}`} name="dealer_status" defaultValue={d.dealer_status} className="input">
                    <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="none">Not a dealer</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor={`pc-${d.id}`}>Extra discount %</label>
                  <input id={`pc-${d.id}`} name="dealer_discount_pct" type="number" min={0} max={90} step="0.5" defaultValue={Number(d.dealer_discount_pct)} className="input w-28" />
                </div>
                <button className="btn btn-gold">Save</button>
                {d.dealer_status === "approved" && <Link href={`/admin/dealers/${d.id}`} className="btn">Special prices</Link>}
              </form>
            </div>
          );
        })}
        {!dealers.length && <p className="text-muted">No dealer applications yet.</p>}
      </div>
    </div>
  );
}
