import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

async function apply(fd: FormData) {
  "use server";
  const { sb } = await requireUser("/dealer");
  const { error } = await sb.rpc("apply_for_dealer", {
    p_shop: String(fd.get("shop") ?? ""),
    p_phone: String(fd.get("phone") ?? ""),
    p_city: String(fd.get("city") ?? ""),
  });
  redirect(error ? `/dealer?error=${encodeURIComponent(error.message)}` : "/dealer");
}

export default async function DealerPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { profile } = await requireUser("/dealer");
  const status = profile?.dealer_status ?? "none";

  return (
    <main className="wrap max-w-xl py-12">
      <h1 className="h-display text-4xl">Dealer account</h1>
      <p className="mt-2 text-muted">Shop owners get wholesale prices, quantity discounts and bulk ordering. We review every application before approving it.</p>

      {status === "approved" && (
        <div className="card mt-6 p-5">
          <p className="text-ok">You are an approved dealer.</p>
          <p className="mt-1 text-muted">Switch to Wholesale on the shop page to see your prices.</p>
          <Link href="/" className="btn btn-gold mt-4">Go to the shop</Link>
        </div>
      )}
      {status === "pending" && (
        <div className="card mt-6 p-5">
          <p className="text-gold-soft">Application received</p>
          <p className="mt-1 text-muted">We are reviewing {profile?.shop_name ? <b className="text-cream">{profile.shop_name}</b> : "your shop"}. We will contact you on {profile?.phone || "your phone"} once it is approved.</p>
        </div>
      )}
      {(status === "none" || status === "rejected") && (
        <form action={apply} className="card mt-6 grid gap-4 p-5">
          {status === "rejected" && <p className="text-warn">Your last application was not approved. You can apply again with updated details.</p>}
          <div><label className="label" htmlFor="shop">Shop name</label><input id="shop" name="shop" className="input" required defaultValue={profile?.shop_name ?? ""} /></div>
          <div><label className="label" htmlFor="phone">Phone / WhatsApp</label><input id="phone" name="phone" type="tel" className="input" required defaultValue={profile?.phone ?? ""} /></div>
          <div><label className="label" htmlFor="city">City</label><input id="city" name="city" className="input" required defaultValue={profile?.city ?? ""} /></div>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn btn-gold">Send application</button>
        </form>
      )}
    </main>
  );
}
