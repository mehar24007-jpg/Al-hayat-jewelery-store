import Catalog from "@/components/Catalog";
import { getSession } from "@/lib/session";
import type { CatalogProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { sb, user, profile } = await getSession();
  const isDealer = profile?.dealer_status === "approved";

  const [cats, prods, ratings, bestRes] = await Promise.all([
    sb.from("categories").select("name").order("sort_order").order("name"),
    sb.from("products").select("id,slug,name,retail_price,tag,tone,images,stock,created_at,category:categories(name)").eq("is_active", true).order("created_at"),
    sb.from("product_ratings").select("product_id,avg_rating,review_count"),
    sb.rpc("best_sellers", { p_limit: 8 }),
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
      image2: p.images?.[1] ?? null,
      stock: p.stock,
      rating: r?.avg ?? null,
      reviews: r?.n ?? 0,
    };
  });

  // Newest 8 pieces (the list above is oldest first), and a photo for each category card.
  const newIds = products.slice(-8).reverse().map((p) => p.id);
  const bestIds = ((bestRes.data ?? []) as { product_id: string }[]).map((r) => r.product_id);
  const categoryImages: Record<string, string | null> = {};
  products.forEach((p) => {
    if (p.image && !categoryImages[p.category]) categoryImages[p.category] = p.image;
  });

  return (
    <Catalog
      products={products}
      categories={(cats.data ?? []).map((c: any) => c.name)}
      categoryImages={categoryImages}
      newIds={newIds}
      bestIds={bestIds}
    />
  );
}
