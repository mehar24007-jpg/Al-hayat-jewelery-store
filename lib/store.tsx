"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profile, Settings } from "./types";

export type CartItem = { id: string; qty: number };
type Mode = "retail" | "wholesale";

type Ctx = {
  settings: Settings;
  profile: Profile;
  email: string | null;
  isDealer: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  cart: CartItem[];
  count: number;
  add: (id: string, qty: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
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
  children,
}: {
  settings: Settings;
  profile: Profile;
  email: string | null;
  children: ReactNode;
}) {
  const isDealer = profile?.dealer_status === "approved";
  const [mode, setModeState] = useState<Mode>("retail");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  const add = useCallback((id: string, qty: number) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.id === id);
      if (i < 0) return [...c, { id, qty }];
      const n = [...c];
      n[i] = { id, qty: n[i].qty + qty };
      return n;
    });
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { id, qty } : x))));
  }, []);
  const remove = useCallback((id: string) => setCart((c) => c.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setCart([]), []);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      profile,
      email,
      isDealer,
      mode: isDealer ? mode : "retail",
      setMode,
      cart,
      count: cart.reduce((n, x) => n + x.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [settings, profile, email, isDealer, mode, setMode, cart, add, setQty, remove, clear]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
