import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import BottomNav from "@/components/BottomNav";
import AnnouncementBar from "@/components/AnnouncementBar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
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
        theme: ["gold", "emerald", "rose"].includes(s.theme) ? s.theme : "gold",
      }
    : DEFAULT_SETTINGS;

  const { count: saleCount } = await sb.from("products").select("id", { count: "exact", head: true }).eq("is_active", true).not("compare_at_price", "is", null);

  const {
    data: { user },
  } = await sb.auth.getUser();
  let profile: Profile = null;
  if (user) {
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = data ? { ...data, dealer_discount_pct: Number(data.dealer_discount_pct) } : null;
  }

  return (
    <html lang="en" data-theme={settings.theme} className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-ink pb-16 font-body text-[15px] leading-relaxed text-cream md:pb-0">
        <StoreProvider settings={settings} profile={profile} email={user?.email ?? null} hasSale={(saleCount ?? 0) > 0}>
          <AnnouncementBar />
          <Header />
          <div id="main">{children}</div>
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
          <BottomNav />
        </StoreProvider>
      </body>
    </html>
  );
}
