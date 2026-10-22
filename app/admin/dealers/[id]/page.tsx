import Link from "next/link";
import { notFound } from "next/navigation";
import Flash from "@/components/admin/Flash";
import { requireAdmin } from "@/lib/session";
import { money } from "@/lib/format";
import { addDealerPrice, removeDealerPrice } from "../../actions";

export default async function DealerPrices({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { sb } = await requireAdmin();
  const [{ data: d }, { data: rows }, { data: products }] = await Promise.all([
    sb.from("profiles").select("shop_name,full_name").eq("id", id).maybeSingle(),
    sb.from("dealer_prices").select("id,unit_price,product_id").eq("dealer_id", id),
    sb.from("products").select("id,name").order("name"),
  ]);
  if (!d) notFound();
  const name = new Map<string, string>((products ?? []).map((p: any) => [p.id, p.name]));

  return (
    <div className="max-w-2xl">
      <Link href="/admin/dealers" className="text-sm text-muted hover:text-cream">← Dealers</Link>
      <h1 className="h-display mb-1 mt-2 text-3xl">Special prices</h1>
      <p className="mb-4 text-sm text-muted">{d.shop_name || d.full_name}. A special price replaces the normal wholesale price and any quantity discount for this dealer.</p>
      <Flash error={error} />
      <div className="card divide-y divide-line">
        {(rows ?? []).length === 0 && <p className="p-4 text-muted">No special prices yet.</p>}
        {(rows ?? []).map((r: any) => (
          <div key={r.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="[overflow-wrap:anywhere]">{name.get(r.product_id) ?? "Product"}</span>
            <span className="flex shrink-0 items-center gap-3 tabular-nums">{money(r.unit_price)}
              <form action={removeDealerPrice.bind(null, id, r.id)}><button className="btn btn-sm btn-danger">Remove</button></form>
            </span>
          </div>
        ))}
      </div>
      <form action={addDealerPrice.bind(null, id)} className="mt-5 flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label className="label" htmlFor="product_id">Product</label>
          <select id="product_id" name="product_id" className="input" required defaultValue="">
            <option value="" disabled>Choose a product</option>
            {(products ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="unit_price">Price each</label>
          <input id="unit_price" name="unit_price" type="number" min={0} step="any" className="input w-32" required />
        </div>
        <button className="btn btn-gold">Add price</button>
      </form>
    </div>
  );
}
