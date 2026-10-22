import Flash from "@/components/admin/Flash";
import { requireAdmin } from "@/lib/session";
import { addCategory, deleteCategory, renameCategory } from "../actions";

export default async function AdminCategories({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { sb } = await requireAdmin();
  const [{ data: cats }, { data: prods }] = await Promise.all([
    sb.from("categories").select("id,name,sort_order").order("sort_order").order("name"),
    sb.from("products").select("category_id"),
  ]);
  const count = new Map<string, number>();
  (prods ?? []).forEach((p: any) => count.set(p.category_id, (count.get(p.category_id) ?? 0) + 1));

  return (
    <div className="max-w-2xl">
      <h1 className="h-display mb-4 text-3xl">Categories</h1>
      <Flash error={error} />
      <div className="grid gap-2.5">
        {(cats ?? []).map((c: any) => {
          const n = count.get(c.id) ?? 0;
          return (
            <div key={c.id} className="card flex flex-wrap items-center gap-2 p-3">
              <form action={renameCategory.bind(null, c.id)} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <input name="name" defaultValue={c.name} className="input min-w-[140px] flex-1" aria-label="Category name" maxLength={40} />
                <input name="sort_order" type="number" defaultValue={c.sort_order} className="input w-20" aria-label="Order" title="Order in the menu" />
                <button className="btn btn-sm">Save</button>
              </form>
              <span className="text-xs text-muted">{n} products</span>
              <form action={deleteCategory.bind(null, c.id)}>
                <button className="btn btn-sm btn-danger" disabled={n > 0} title={n ? "Move its products first" : undefined}>Delete</button>
              </form>
            </div>
          );
        })}
      </div>
      <form action={addCategory} className="mt-5 flex flex-wrap gap-2">
        <input name="name" className="input max-w-xs" placeholder="New category, e.g. Earrings" aria-label="New category" maxLength={40} required />
        <button className="btn btn-gold">Add category</button>
      </form>
    </div>
  );
}
