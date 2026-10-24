import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductView from "@/components/ProductView";
import ReviewForm from "@/components/ReviewForm";
import { getSession } from "@/lib/session";
import { dateTime } from "@/lib/format";
import type { CatalogProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { sb, user, profile } = await getSession();
  const isDealer = profile?.dealer_status === "approved";

  const { data: p } = await sb
    .from("products")
    .select("id,category_id,name,description,retail_price,compare_at_price,sizes,video_url,tag,tone,images,stock,category:categories(name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!p) notFound();

  const [rev, rating, ws, slabs, special, rel] = await Promise.all([
    sb.from("reviews").select("id,rating,comment,reviewer_name,created_at").eq("product_id", p.id).eq("is_approved", true).order("created_at", { ascending: false }),
    sb.from("product_ratings").select("avg_rating,review_count").eq("product_id", p.id).maybeSingle(),
    isDealer ? sb.from("product_wholesale").select("wholesale_price,moq").eq("product_id", p.id).maybeSingle() : Promise.resolve({ data: null }),
    isDealer ? sb.from("price_slabs").select("min_qty,unit_price").eq("product_id", p.id).order("min_qty") : Promise.resolve({ data: [] }),
    isDealer ? sb.from("dealer_prices").select("unit_price").eq("product_id", p.id).eq("dealer_id", user!.id).maybeSingle() : Promise.resolve({ data: null }),
    sb.from("products").select("id,slug,name,retail_price,compare_at_price,sizes,tag,tone,images,stock").eq("is_active", true).eq("category_id", p.category_id).neq("id", p.id).order("created_at", { ascending: false }).limit(4),
  ]);

  // "You may also like": other pieces from the same category, priced for this visitor.
  const relRows = (rel.data ?? []) as any[];
  const relWs = new Map<string, { price: number; moq: number | null }>();
  const relSpecial = new Map<string, number>();
  if (isDealer && relRows.length) {
    const ids = relRows.map((r) => r.id);
    const [w, d] = await Promise.all([
      sb.from("product_wholesale").select("product_id,wholesale_price,moq").in("product_id", ids),
      sb.from("dealer_prices").select("product_id,unit_price").eq("dealer_id", user!.id).in("product_id", ids),
    ]);
    (w.data ?? []).forEach((r: any) => relWs.set(r.product_id, { price: Number(r.wholesale_price), moq: r.moq }));
    (d.data ?? []).forEach((r: any) => relSpecial.set(r.product_id, Number(r.unit_price)));
  }
  const related: CatalogProduct[] = relRows.map((r) => {
    const w = relWs.get(r.id);
    return {
      id: r.id, slug: r.slug, name: r.name, category: "", retail: Number(r.retail_price),
      wholesale: w ? relSpecial.get(r.id) ?? Math.round(w.price * (1 - (profile?.dealer_discount_pct ?? 0) / 100)) : null,
      moq: w?.moq ?? null, tag: r.tag, tone: r.tone, image: r.images?.[0] ?? null, image2: r.images?.[1] ?? null,
      compare: r.compare_at_price == null ? null : Number(r.compare_at_price), sizes: Array.isArray(r.sizes) ? r.sizes : [],
      stock: r.stock, rating: null, reviews: 0,
    };
  });

  const cat: any = Array.isArray(p.category) ? p.category[0] : p.category;
  const wsRow: any = ws.data;

  return (
    <main className="wrap py-8">
      <nav className="mb-5 text-sm text-muted"><Link href="/" className="hover:text-cream">Shop</Link> / {cat?.name}</nav>
      <ProductView
        id={p.id}
        name={p.name}
        category={cat?.name ?? ""}
        description={p.description}
        retail={Number(p.retail_price)}
        compare={p.compare_at_price == null ? null : Number(p.compare_at_price)}
        sizes={Array.isArray(p.sizes) ? p.sizes : []}
        tag={p.tag}
        tone={p.tone}
        images={p.images ?? []}
        video={p.video_url ?? null}
        stock={p.stock}
        rating={rating.data ? Number((rating.data as any).avg_rating) : null}
        reviews={rating.data ? (rating.data as any).review_count : 0}
        wholesale={wsRow ? { price: Number(wsRow.wholesale_price), moq: wsRow.moq, special: special.data ? Number((special.data as any).unit_price) : null } : null}
        slabs={((slabs.data ?? []) as any[]).map((s) => ({ min_qty: s.min_qty, unit_price: Number(s.unit_price) }))}
      />

      {related.length > 0 && (
        <section className="mt-14" aria-label="You may also like">
          <h2 className="section-title mb-4">You may also like</h2>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}

      <section className="mt-14 grid gap-6 md:grid-cols-[1fr_380px]">
        <div>
          <h2 className="font-display text-2xl font-semibold">Reviews</h2>
          <div className="mt-4 grid gap-3">
            {(rev.data ?? []).length === 0 && <p className="text-muted">No reviews yet. Be the first to review this piece.</p>}
            {(rev.data ?? []).map((r: any) => (
              <article key={r.id} className="card p-4">
                <div className="flex items-center justify-between gap-3">
                  <b className="font-medium">{r.reviewer_name}</b>
                  <span className="text-xs text-muted">{dateTime(r.created_at)}</span>
                </div>
                <div className="text-gold" aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></div>
                {r.comment && <p className="mt-1 text-muted [overflow-wrap:anywhere]">{r.comment}</p>}
              </article>
            ))}
          </div>
        </div>
        <ReviewForm productId={p.id} slug={slug} />
      </section>
    </main>
  );
}
