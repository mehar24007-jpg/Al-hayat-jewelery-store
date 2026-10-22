"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { waNumber } from "@/lib/format";

function instagramUrl(v: string): string {
  const s = v.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://instagram.com/${s.replace(/^@/, "")}`;
}

export default function Footer() {
  const path = usePathname();
  const { settings, isDealer } = useStore();
  if (path.startsWith("/admin")) return null;
  const wa = waNumber(settings.whatsapp);
  const ig = instagramUrl(settings.instagram);

  return (
    <footer className="mt-16 border-t border-line bg-panel">
      <div className="wrap grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
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
            <li><Link href="/#shop" className="hover:text-cream">All jewellery</Link></li>
            {!isDealer && <li><Link href="/dealer" className="hover:text-cream">Become a dealer</Link></li>}
            <li><Link href="/account" className="hover:text-cream">Your account and orders</Link></li>
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
            {ig && (
              <li>
                <a href={ig} target="_blank" rel="noopener noreferrer" className="hover:text-cream">Instagram</a>
              </li>
            )}
            {settings.address && <li className="[overflow-wrap:anywhere]">{settings.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} {settings.store_name} {settings.store_sub}</div>
    </footer>
  );
}
