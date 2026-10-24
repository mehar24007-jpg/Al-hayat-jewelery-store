"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import SearchOverlay from "./SearchOverlay";
import { useStore } from "@/lib/store";
import { logout } from "@/app/auth/actions";

export default function Header() {
  const { settings, profile, email, count, isDealer, setCartOpen, hasSale, wish } = useStore();
  const [search, setSearch] = useState(false);
  const closeSearch = useCallback(() => setSearch(false), []);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-on-gold">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
        <div className="wrap flex items-center gap-x-4 py-3">
          <Link href="/" className="mr-auto font-display text-[26px] font-semibold leading-none">
            {settings.store_name}
            {settings.store_sub && (
              <small className="mt-1 block font-body text-[10.5px] font-medium uppercase tracking-[.22em] text-gold">{settings.store_sub}</small>
            )}
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted lg:flex" aria-label="Shop">
            <a href="/#new" className="hover:text-cream">Latest</a>
            <a href="/#best" className="hover:text-cream">Best sellers</a>
            {hasSale && <a href="/#sale" className="font-medium text-warn hover:text-cream">Sale</a>}
            <Link href="/size-guide" className="hover:text-cream">Size guide</Link>
            <a href="/#saved" className="hover:text-cream">Saved{wish.length > 0 ? ` (${wish.length})` : ""}</a>
          </nav>
          <nav className="hidden items-center gap-5 border-l border-line pl-5 text-sm text-muted md:flex" aria-label="Account">
            {!isDealer && <Link href="/dealer" className="hover:text-cream">Become a dealer</Link>}
            {profile?.role === "admin" && <Link href="/admin" className="text-gold-soft hover:text-cream">Admin</Link>}
            {email ? (
              <>
                <Link href="/account" className="hover:text-cream">Account</Link>
                <form action={logout}>
                  <button className="hover:text-cream">Sign out</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="hover:text-cream">Sign in</Link>
            )}
          </nav>
          {profile?.role === "admin" && (
            <Link href="/admin" className="text-sm text-gold-soft md:hidden">Admin</Link>
          )}
          <button className="btn h-10 w-10 rounded-full p-0" onClick={() => setSearch(true)} aria-label="Search">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
          <button className="btn rounded-full" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`}>
            Cart
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs font-semibold text-on-gold">{count}</span>
          </button>
        </div>
      </header>
      <SearchOverlay open={search} onClose={closeSearch} />
    </>
  );
}
