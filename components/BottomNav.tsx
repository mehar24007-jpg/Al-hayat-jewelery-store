"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const icon = {
  home: "M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10",
  shop: "M4 7h16l-1.2 12.5H5.2L4 7Zm4 0V6a4 4 0 0 1 8 0v1",
  cart: "M3 4h2.5l2.2 10.5h10.3L20 8H7M9.5 19.5h.01M16.5 19.5h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5a7.5 7.5 0 0 1 15 0",
  heart: "M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z",
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Phone only: Home, Shop, Cart, Account along the bottom of the screen. */
export default function BottomNav() {
  const path = usePathname();
  const { count, email, setCartOpen, wish } = useStore();
  if (path.startsWith("/admin")) return null;

  const item = "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted";
  const on = "text-gold-soft";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
      <Link href="/" className={`${item} ${path === "/" ? on : ""}`}>
        <Icon d={icon.home} />
        Home
      </Link>
      <a href="/#shop" className={item}>
        <Icon d={icon.shop} />
        Shop
      </a>
      <a href="/#saved" className={item}>
        <span className="relative">
          <Icon d={icon.heart} />
          {wish.length > 0 && (
            <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-on-gold">{wish.length}</span>
          )}
        </span>
        Saved
      </a>
      <button className={`${item} relative`} onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`}>
        <span className="relative">
          <Icon d={icon.cart} />
          {count > 0 && (
            <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-on-gold">{count}</span>
          )}
        </span>
        Cart
      </button>
      <Link href={email ? "/account" : "/login"} className={`${item} ${path === "/account" || path === "/login" ? on : ""}`}>
        <Icon d={icon.user} />
        {email ? "Account" : "Sign in"}
      </Link>
    </nav>
  );
}
