import Link from "next/link";
import { notFound } from "next/navigation";
import ProductView from "@/components/ProductView";
import ReviewForm from "@/components/ReviewForm";
import { getSession } from "@/lib/session";
import { dateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { sb, user, profile } = await getSession();
  const isDealer = profile?.dealer_status === "approved";

  const { data: p } = await sb
    .from("products")
    .select("id,name,description,retail_price,tag,tone,images,stock,category:categories(name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!p) notFound();

  const [rev, rating, ws, slabs, special] = await Promise.all([
    sb.from("reviews").select("id,rating,comment,reviewer_name,created_at").eq("product_id", p.id).eq("is_approved", true).order("created_at", { ascending: false }),
    sb.from("product_ratings").select("avg_rating,review_count").eq("product_id", p.id).maybeSingle(),
    isDealer ? sb.from("product_wholesale").select("wholesale_price,moq").eq("product_id", p.id).maybeSingle() : Promise.resolve({ data: null }),
    isDealer ? sb.from("price_slabs").select("min_qty,unit_price").eq("product_id", p.id).order("min_qty") : Promise.resolve({ data: [] }),
    isDealer ? sb.from("dealer_prices").select("unit_price").eq("product_id", p.id).eq("dealer_id", user!.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

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
        tag={p.tag}
        tone={p.tone}
        images={p.images ?? []}
        stock={p.stock}
        rating={rating.data ? Number((rating.data as any).avg_rating) : null}
        reviews={rating.data ? (rating.data as any).review_count : 0}
        wholesale={wsRow ? { price: Number(wsRow.wholesale_price), moq: wsRow.moq, special: special.data ? Number((special.data as any).unit_price) : null } : null}
        slabs={((slabs.data ?? []) as any[]).map((s) => ({ min_qty: s.min_qty, unit_price: Number(s.unit_price) }))}
      />

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
