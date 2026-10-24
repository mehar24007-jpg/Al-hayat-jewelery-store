"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { waNumber } from "@/lib/format";

function socialUrl(v: string, base: string): string {
  const s = v.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `${base}${s.replace(/^@/, "")}`;
}

export default function Footer() {
  const path = usePathname();
  const { settings, isDealer, hasSale } = useStore();
  if (path.startsWith("/admin")) return null;
  const wa = waNumber(settings.whatsapp);
  const social = [
    ["Instagram", socialUrl(settings.instagram, "https://instagram.com/")],
    ["Facebook", socialUrl(settings.facebook, "https://facebook.com/")],
    ["TikTok", socialUrl(settings.tiktok, "https://tiktok.com/@")],
    ["YouTube", socialUrl(settings.youtube, "https://youtube.com/@")],
  ].filter(([, u]) => u);
  const pay = [
    "Cash on delivery",
    "Bank transfer",
    ...(settings.jazzcash_number ? ["JazzCash"] : []),
    ...(settings.easypaisa_number ? ["Easypaisa"] : []),
  ];

  return (
    <footer className="mt-16 border-t border-line bg-panel">
      <div className="wrap grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-3xl font-semibold leading-none">
            {settings.store_name}
            {settings.store_sub && <small className="mt-1.5 block font-body text-[11px] font-medium uppercase tracking-[.22em] text-gold">{settings.store_sub}</small>}
          </div>
          <p className="mt-4 max-w-[38ch] text-sm text-muted">{settings.hero_text}</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-gold">Shop</h4>
          <ul className="grid gap-2 text-muted">
            <li><a href="/#shop" className="hover:text-cream">All jewellery</a></li>
            <li><a href="/#new" className="hover:text-cream">Latest</a></li>
            <li><a href="/#best" className="hover:text-cream">Best sellers</a></li>
            {hasSale && <li><a href="/#sale" className="hover:text-cream">Sale</a></li>}
            {!isDealer && <li><Link href="/dealer" className="hover:text-cream">Become a dealer</Link></li>}
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-gold">Customer care</h4>
          <ul className="grid gap-2 text-muted">
            <li><Link href="/size-guide" className="hover:text-cream">Size guide</Link></li>
            <li><Link href="/policies#shipping" className="hover:text-cream">Shipping</Link></li>
            <li><Link href="/policies#exchange" className="hover:text-cream">Exchange and returns</Link></li>
            <li><Link href="/policies#faq" className="hover:text-cream">Questions</Link></li>
            <li><Link href="/account" className="hover:text-cream">Your orders</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-gold">Contact</h4>
          <ul className="grid gap-2 text-muted">
            {wa && (
              <li>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:text-cream">WhatsApp: {settings.whatsapp}</a>
              </li>
            )}
            {settings.address && <li className="[overflow-wrap:anywhere]">{settings.address}</li>}
            {social.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-cream">{name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
          <ul className="flex flex-wrap gap-2" aria-label="Payment methods">
            {pay.map((p) => (
              <li key={p} className="rounded-md border border-line px-2.5 py-1 text-xs text-muted">{p}</li>
            ))}
          </ul>
          <p className="text-xs text-muted">© {new Date().getFullYear()} {settings.store_name} {settings.store_sub}</p>
        </div>
      </div>
    </footer>
  );
}
