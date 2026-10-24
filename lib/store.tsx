"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profile, Settings } from "./types";

export type CartItem = { id: string; qty: number; size?: string };
const same = (x: CartItem, id: string, size?: string | null) => x.id === id && (x.size ?? "") === (size ?? "");
type Mode = "retail" | "wholesale";

type Ctx = {
  settings: Settings;
  profile: Profile;
  email: string | null;
  isDealer: boolean;
  hasSale: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  cart: CartItem[];
  count: number;
  add: (id: string, qty: number, size?: string | null) => void;
  setQty: (id: string, qty: number, size?: string | null) => void;
  remove: (id: string, size?: string | null) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  wish: string[];
  toggleWish: (id: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function useStore(): Ctx {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export function StoreProvider({
  settings,
  profile,
  email,
  hasSale = false,
  children,
}: {
  settings: Settings;
  profile: Profile;
  email: string | null;
  hasSale?: boolean;
  children: ReactNode;
}) {
  const isDealer = profile?.dealer_status === "approved";
  const [mode, setModeState] = useState<Mode>("retail");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wish, setWish] = useState<string[]>([]);

  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem("ah_wish") || "[]");
      if (Array.isArray(w)) setWish(w.filter((x) => typeof x === "string"));
    } catch {}
  }, []);

  const toggleWish = useCallback((id: string) => {
    setWish((w) => {
      const n = w.includes(id) ? w.filter((x) => x !== id) : [...w, id];
      try {
        localStorage.setItem("ah_wish", JSON.stringify(n));
      } catch {}
      return n;
    });
  }, []);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("ah_cart") || "[]");
      if (Array.isArray(c)) setCart(c.filter((x) => x && typeof x.id === "string" && x.qty > 0));
      if (localStorage.getItem("ah_mode") === "wholesale" && isDealer) setModeState("wholesale");
    } catch {}
    setLoaded(true);
  }, [isDealer]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("ah_cart", JSON.stringify(cart));
    } catch {}
  }, [cart, loaded]);

  const setMode = useCallback(
    (m: Mode) => {
      const next = m === "wholesale" && !isDealer ? "retail" : m;
      setModeState(next);
      try {
        localStorage.setItem("ah_mode", next);
      } catch {}
    },
    [isDealer]
  );

  const add = useCallback((id: string, qty: number, size?: string | null) => {
    setCart((c) => {
      const i = c.findIndex((x) => same(x, id, size));
      if (i < 0) return [...c, size ? { id, qty, size } : { id, qty }];
      const n = [...c];
      n[i] = { ...n[i], qty: n[i].qty + qty };
      return n;
    });
  }, []);
  const setQty = useCallback((id: string, qty: number, size?: string | null) => {
    setCart((c) => (qty <= 0 ? c.filter((x) => !same(x, id, size)) : c.map((x) => (same(x, id, size) ? { ...x, qty } : x))));
  }, []);
  const remove = useCallback((id: string, size?: string | null) => setCart((c) => c.filter((x) => !same(x, id, size))), []);
  const clear = useCallback(() => setCart([]), []);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      profile,
      email,
      isDealer,
      hasSale,
      mode: isDealer ? mode : "retail",
      setMode,
      cart,
      count: cart.reduce((n, x) => n + x.qty, 0),
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      setCartOpen,
      wish,
      toggleWish,
    }),
    [settings, profile, email, isDealer, hasSale, mode, setMode, cart, add, setQty, remove, clear, cartOpen, wish, toggleWish]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
