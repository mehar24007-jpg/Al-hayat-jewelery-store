export type Settings = {
  store_name: string;
  store_sub: string;
  hero_title: string;
  hero_text: string;
  whatsapp: string;
  currency: string;
  default_moq: number;
  min_wholesale_order: number;
  delivery_fee: number;
  free_delivery_over: number | null;
  jazzcash_number: string;
  jazzcash_title: string;
  easypaisa_number: string;
  easypaisa_title: string;
  bank_details: string;
  hero_image: string;
  instagram: string;
  address: string;
  theme: "gold" | "emerald" | "rose";
  announcement: string;
  shipping_policy: string;
  exchange_policy: string;
  care_text: string;
  faq: string;
  facebook: string;
  tiktok: string;
  youtube: string;
};

export const DEFAULT_SETTINGS: Settings = {
  store_name: "Al Hayat",
  store_sub: "Jewellery",
  hero_title: "Handcrafted jewellery, priced for your shop or your wedding.",
  hero_text: "Dealers get wholesale rates after approval.",
  whatsapp: "923068851800",
  currency: "Rs",
  default_moq: 6,
  min_wholesale_order: 25000,
  delivery_fee: 0,
  free_delivery_over: null,
  jazzcash_number: "",
  jazzcash_title: "",
  easypaisa_number: "",
  easypaisa_title: "",
  bank_details: "",
  hero_image: "",
  instagram: "",
  address: "",
  theme: "gold",
  announcement: "",
  shipping_policy: "",
  exchange_policy: "",
  care_text: "",
  faq: "",
  facebook: "",
  tiktok: "",
  youtube: "",
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  shop_name: string | null;
  city: string | null;
  role: "customer" | "admin";
  dealer_status: "none" | "pending" | "approved" | "rejected";
  dealer_discount_pct: number;
} | null;

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  retail: number;
  wholesale: number | null; // only filled for approved dealers
  moq: number | null;
  tag: string | null;
  tone: "gold" | "rose" | "silver";
  image: string | null;
  image2: string | null;
  compare: number | null; // the old price, shown crossed out in retail mode
  sizes: string[];
  stock: number;
  rating: number | null;
  reviews: number;
};

export type QuoteLine = {
  product_id: string;
  name: string;
  slug: string;
  image: string | null;
  tone: string;
  size: string | null;
  unit_price: number;
  qty: number;
  moq: number;
  stock: number;
  line_total: number;
};

export type Quote = {
  mode: "retail" | "wholesale";
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  issues: string[];
  coupon_error: string | null;
  currency: string;
};
