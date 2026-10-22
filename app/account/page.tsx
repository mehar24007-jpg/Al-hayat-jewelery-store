import Link from "next/link";
import { requireUser } from "@/lib/session";
import { dateTime, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { sb, user, profile } = await requireUser("/account");
  const { data: orders } = await sb
    .from("orders")
    .select("id,order_number,status,total,mode,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="wrap max-w-3xl py-10">
      <h1 className="h-display text-4xl">Your account</h1>
      <div className="card mt-5 grid gap-1 p-5 text-sm">
        <div><span className="text-muted">Name: </span>{profile?.full_name || "—"}</div>
        <div><span className="text-muted">Email: </span>{user.email}</div>
        <div><span className="text-muted">Phone: </span>{profile?.phone || "—"}</div>
        <div>
          <span className="text-muted">Dealer status: </span>
          {profile?.dealer_status === "approved" ? <span className="text-ok">Approved</span> : profile?.dealer_status === "pending" ? <span className="text-gold-soft">Under review</span> : <Link href="/dealer" className="text-gold-soft underline">Apply as a dealer</Link>}
        </div>
      </div>

      <h2 className="h-display mb-3 mt-8 text-2xl">Orders</h2>
      {!orders?.length && <p className="text-muted">You have not placed an order yet.</p>}
      <div className="grid gap-2.5">
        {(orders ?? []).map((o: any) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="card flex flex-wrap items-center justify-between gap-2 p-4 hover:border-gold">
            <div>
              <b>{o.order_number}</b>
              <div className="text-xs text-muted">{dateTime(o.created_at)} · {o.mode}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="pill capitalize">{o.status}</span>
              <span className="tabular-nums">{money(o.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
