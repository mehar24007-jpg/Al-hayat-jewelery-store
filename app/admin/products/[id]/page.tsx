import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/session";
import { deleteProduct } from "../../actions";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const isNew = id === "new";

  const [{ data: cats }, { data: set }] = await Promise.all([
    sb.from("categories").select("id,name").order("sort_order").order("name"),
    sb.from("store_settings").select("default_moq").eq("id", 1).maybeSingle(),
  ]);

  let p: any = null;
  let ws: any = null;
  let slabs: any[] = [];
  if (!isNew) {
    const [a, b, c] = await Promise.all([
      sb.from("products").select("*").eq("id", id).maybeSingle(),
      sb.from("product_wholesale").select("*").eq("product_id", id).maybeSingle(),
      sb.from("price_slabs").select("min_qty,unit_price").eq("product_id", id).order("min_qty"),
    ]);
    p = a.data;
    if (!p) notFound();
    ws = b.data;
    slabs = c.data ?? [];
  }

  return (
    <div className="max-w-3xl">
      <h1 className="h-display mb-5 text-3xl">{isNew ? "Add product" : "Edit product"}</h1>
      <ProductForm
        categories={(cats ?? []) as { id: string; name: string }[]}
        defaultMoq={set?.default_moq ?? 6}
        product={{
          id: isNew ? null : id,
          name: p?.name ?? "",
          category_id: p?.category_id ?? "",
          description: p?.description ?? "",
          retail_price: p ? Number(p.retail_price) : "",
          wholesale_price: ws ? Number(ws.wholesale_price) : "",
          moq: ws?.moq ?? "",
          stock: p?.stock ?? 0,
          tag: p?.tag ?? "",
          tone: p?.tone ?? "gold",
          is_active: p?.is_active ?? true,
          images: p?.images ?? [],
          compare_at_price: p?.compare_at_price == null ? "" : Number(p.compare_at_price),
          video_url: p?.video_url ?? "",
          sizes: (p?.sizes ?? []).join(", "),
          slabs: slabs.map((s) => ({ min_qty: s.min_qty, unit_price: Number(s.unit_price) })),
        }}
      />
      {!isNew && (
        <form action={deleteProduct.bind(null, id)} className="mt-10 border-t border-line pt-5">
          <p className="note mb-2">Deleting removes the product from the shop. If it already appears on past orders, it is hidden instead so old invoices stay intact.</p>
          <button className="btn btn-danger">Delete this product</button>
        </form>
      )}
    </div>
  );
}
