import Catalog from "@/components/Catalog";
import { getSession } from "@/lib/session";
import type { CatalogProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { sb, user, profile } = await getSession();
  const isDealer = profile?.dealer_status === "approved";

  const [cats, prods, ratings] = await Promise.all([
    sb.from("categories").select("name").order("sort_order").order("name"),
    sb.from("products").select("id,slug,name,retail_price,tag,tone,images,stock,category:categories(name)").eq("is_active", true).order("created_at"),
    sb.from("product_ratings").select("product_id,avg_rating,review_count"),
  ]);

  const rating = new Map<string, { avg: number; n: number }>();
  (ratings.data ?? []).forEach((r: any) => rating.set(r.product_id, { avg: Number(r.avg_rating), n: r.review_count }));

  const wholesale = new Map<string, { price: number; moq: number | null }>();
  const special = new Map<string, number>();
  if (isDealer) {
    const [w, d] = await Promise.all([
      sb.from("product_wholesale").select("product_id,wholesale_price,moq"),
      sb.from("dealer_prices").select("product_id,unit_price").eq("dealer_id", user!.id),
    ]);
    (w.data ?? []).forEach((r: any) => wholesale.set(r.product_id, { price: Number(r.wholesale_price), moq: r.moq }));
    (d.data ?? []).forEach((r: any) => special.set(r.product_id, Number(r.unit_price)));
  }
  const pct = profile?.dealer_discount_pct ?? 0;

  const products: CatalogProduct[] = (prods.data ?? []).map((p: any) => {
    const w = wholesale.get(p.id);
    const r = rating.get(p.id);
    const cat = Array.isArray(p.category) ? p.category[0] : p.category;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: cat?.name ?? "",
      retail: Number(p.retail_price),
      wholesale: w ? special.get(p.id) ?? Math.round(w.price * (1 - pct / 100)) : null,
      moq: w?.moq ?? null,
      tag: p.tag,
      tone: p.tone,
      image: p.images?.[0] ?? null,
      stock: p.stock,
      rating: r?.avg ?? null,
      reviews: r?.n ?? 0,
    };
  });

  return <Catalog products={products} categories={(cats.data ?? []).map((c: any) => c.name)} />;
}
