"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { logout } from "@/app/auth/actions";

export default function Header() {
  const { settings, profile, email, count, isDealer, setCartOpen } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
      <div className="wrap flex items-center gap-x-5 py-3">
        <Link href="/" className="mr-auto font-display text-[26px] font-semibold leading-none">
          {settings.store_name}
          {settings.store_sub && (
            <small className="mt-1 block font-body text-[10.5px] font-medium uppercase tracking-[.22em] text-gold">{settings.store_sub}</small>
          )}
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <Link href="/#shop" className="hover:text-cream">Shop</Link>
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
        <button className="btn rounded-full" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`}>
          Cart
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs font-semibold text-on-gold">{count}</span>
        </button>
      </div>
    </header>
  );
}
