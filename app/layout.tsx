import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { StoreProvider } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, type Profile, type Settings } from "@/lib/types";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Al Hayat Jewellery",
  description: "Retail and wholesale jewellery. Rings, chokers, bangles and bridal sets.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient();
  const { data: s } = await sb.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const settings: Settings = s
    ? {
        ...DEFAULT_SETTINGS,
        ...s,
        min_wholesale_order: Number(s.min_wholesale_order),
        delivery_fee: Number(s.delivery_fee),
        free_delivery_over: s.free_delivery_over == null ? null : Number(s.free_delivery_over),
      }
    : DEFAULT_SETTINGS;

  const {
    data: { user },
  } = await sb.auth.getUser();
  let profile: Profile = null;
  if (user) {
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = data ? { ...data, dealer_discount_pct: Number(data.dealer_discount_pct) } : null;
  }

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-ink font-body text-[15px] leading-relaxed text-cream">
        <StoreProvider settings={settings} profile={profile} email={user?.email ?? null}>
          <Header />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
