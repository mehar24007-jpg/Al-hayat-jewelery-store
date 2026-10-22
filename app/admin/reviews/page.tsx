import { requireAdmin } from "@/lib/session";
import { dateTime } from "@/lib/format";
import { approveReview, deleteReview } from "../actions";

export default async function AdminReviews() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from("reviews").select("id,rating,comment,reviewer_name,is_approved,created_at,product:products(name)").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as any[];
  const pending = rows.filter((r) => !r.is_approved);
  const approved = rows.filter((r) => r.is_approved);

  const Row = ({ r }: { r: any }) => {
    const prod = Array.isArray(r.product) ? r.product[0] : r.product;
    return (
      <div className="card grid gap-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span><b>{r.reviewer_name}</b> on <span className="text-gold-soft">{prod?.name ?? "a product"}</span></span>
          <span className="text-xs text-muted">{dateTime(r.created_at)}</span>
        </div>
        <div className="text-gold" aria-label={`${r.rating} stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></div>
        {r.comment && <p className="text-sm text-muted [overflow-wrap:anywhere]">{r.comment}</p>}
        <div className="flex gap-2">
          {!r.is_approved && <form action={approveReview.bind(null, r.id)}><button className="btn btn-sm btn-gold">Approve</button></form>}
          <form action={deleteReview.bind(null, r.id)}><button className="btn btn-sm btn-danger">Delete</button></form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl">
      <h1 className="h-display mb-4 text-3xl">Reviews</h1>
      <h2 className="mb-2 text-sm font-semibold text-gold">Waiting for approval ({pending.length})</h2>
      <div className="mb-8 grid gap-3">{pending.length ? pending.map((r) => <Row key={r.id} r={r} />) : <p className="text-muted">Nothing to approve.</p>}</div>
      <h2 className="mb-2 text-sm font-semibold text-gold">Published ({approved.length})</h2>
      <div className="grid gap-3">{approved.map((r) => <Row key={r.id} r={r} />)}</div>
    </div>
  );
}
