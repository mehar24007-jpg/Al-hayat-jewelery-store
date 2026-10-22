import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** One lookup of the signed-in user and profile per request. */
export const getSession = cache(async () => {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  let profile: Profile = null;
  if (user) {
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = data ? { ...data, dealer_discount_pct: Number(data.dealer_discount_pct) } : null;
  }
  return { sb, user, profile };
});

export async function requireUser(next: string) {
  const s = await getSession();
  if (!s.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return s as typeof s & { user: NonNullable<typeof s.user> };
}

export async function requireAdmin() {
  const s = await requireUser("/admin");
  if (s.profile?.role !== "admin") redirect("/");
  return s;
}
