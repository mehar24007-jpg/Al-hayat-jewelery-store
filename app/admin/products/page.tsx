import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { money } from "@/lib/format";
import { setStock } from "../actions";

export default async function AdminProducts() {
  const { sb } = await requireAdmin();
  const [{ data: products }, { data: ws }] = await Promise.all([
    sb.from("products").select("id,name,retail_price,stock,is_active,category:categories(name)").order("created_at", { ascending: false }),
    sb.from("product_wholesale").select("product_id,wholesale_price,moq"),
  ]);
  const w = new Map<string, any>((ws ?? []).map((r: any) => [r.product_id, r]));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-3xl">Products <span className="text-lg text-muted">({products?.length ?? 0})</span></h1>
        <Link href="/admin/products/new" className="btn btn-gold">Add product</Link>
      </div>
      <div className="grid gap-2.5">
        {(products ?? []).map((p: any) => {
          const cat = Array.isArray(p.category) ? p.category[0] : p.category;
          const wr = w.get(p.id);
          return (
            <div key={p.id} className="card grid items-center gap-3 p-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="min-w-0">
                <Link href={`/admin/products/${p.id}`} className="font-medium [overflow-wrap:anywhere] hover:text-gold-soft">{p.name}</Link>
                {!p.is_active && <span className="pill ml-2">Hidden</span>}
                <div className="text-xs tabular-nums text-muted">
                  {cat?.name} · Retail {money(p.retail_price)} · {wr ? `Wholesale ${money(wr.wholesale_price)}` : "No wholesale price"}
                </div>
              </div>
              <form action={setStock.bind(null, p.id)} className="flex items-center gap-2">
                <label className="text-xs text-muted" htmlFor={`s-${p.id}`}>Stock</label>
                <input id={`s-${p.id}`} name="stock" type="number" min={0} defaultValue={p.stock} className="input w-20 py-1.5" />
                <button className="btn btn-sm">Update</button>
              </form>
              <Link href={`/admin/products/${p.id}`} className="btn btn-sm">Edit</Link>
            </div>
          );
        })}
        {!products?.length && <p className="text-muted">No products yet.</p>}
      </div>
    </div>
  );
}
