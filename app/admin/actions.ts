"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/format";

export type AdminState = { error?: string } | null;

const num = (v: FormDataEntryValue | null) => {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : NaN;
};
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();

function back(path: string, error?: string): never {
  redirect(error ? `${path}?error=${encodeURIComponent(error)}` : path);
}

/* ---------- products ---------- */
export async function saveProduct(id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const name = text(fd.get("name"));
  const category_id = text(fd.get("category_id"));
  const retail = num(fd.get("retail_price"));
  const wholesaleRaw = text(fd.get("wholesale_price"));
  const wholesale = wholesaleRaw === "" ? null : num(fd.get("wholesale_price"));
  const moqRaw = text(fd.get("moq"));
  const moq = moqRaw === "" ? null : Math.floor(num(fd.get("moq")));
  const stock = Math.floor(num(fd.get("stock")));

  if (!name) return { error: "Enter a product name." };
  if (!category_id) return { error: "Choose a category. Add one under Categories first if the list is empty." };
  if (!(retail >= 0)) return { error: "Enter a retail price." };
  if (wholesale !== null && !(wholesale >= 0)) return { error: "Wholesale price is not a valid number." };
  if (wholesale !== null && wholesale > retail) return { error: "Wholesale price is higher than the retail price. Check both." };
  if (moq !== null && !(moq >= 1)) return { error: "Minimum quantity must be 1 or more." };
  if (!(stock >= 0)) return { error: "Enter the stock quantity (0 or more)." };
  const cmpRaw = text(fd.get("compare_at_price"));
  const compare = cmpRaw === "" ? null : Number(cmpRaw);
  if (compare !== null && !(compare > retail)) return { error: "The old price must be higher than the retail price, or leave it empty." };
  const vRaw = text(fd.get("video_url"));
  const videoUrl = vRaw.startsWith("https://res.cloudinary.com/") ? vRaw : null;
  const sizes = Array.from(new Set(text(fd.get("sizes")).split(/[,\n]/).map((x) => x.trim()).filter(Boolean))).slice(0, 20);

  let images: string[] = [];
  let slabs: { min_qty: number; unit_price: number }[] = [];
  try {
    images = JSON.parse(text(fd.get("images")) || "[]").filter((u: unknown) => typeof u === "string" && u.startsWith("https://"));
    slabs = JSON.parse(text(fd.get("slabs")) || "[]")
      .map((s: any) => ({ min_qty: Math.floor(Number(s.min_qty)), unit_price: Number(s.unit_price) }))
      .filter((s: any) => s.min_qty >= 2 && s.unit_price >= 0);
  } catch {
    return { error: "Photos or price slabs could not be read. Reload the page and try again." };
  }
  if (slabs.length && wholesale === null) return { error: "Add a wholesale price before adding quantity slabs." };
  if (slabs.some((s) => wholesale !== null && s.unit_price > wholesale)) return { error: "A slab price is higher than the wholesale price." };
  if (new Set(slabs.map((s) => s.min_qty)).size !== slabs.length) return { error: "Two slabs have the same quantity." };

  const row = {
    name,
    category_id,
    description: text(fd.get("description")),
    retail_price: retail,
    tag: text(fd.get("tag")) || null,
    tone: text(fd.get("tone")) || "gold",
    stock,
    is_active: fd.get("is_active") === "on",
    images,
    compare_at_price: compare,
    sizes,
    video_url: videoUrl,
  };

  let pid = id;
  if (!pid) {
    let slug = slugify(name) || "product";
    const { data: clash } = await sb.from("products").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await sb.from("products").insert({ ...row, slug }).select("id").single();
    if (error) return { error: error.message };
    pid = data.id as string;
  } else {
    const { error } = await sb.from("products").update(row).eq("id", pid);
    if (error) return { error: error.message };
  }

  if (wholesale === null) {
    await sb.from("product_wholesale").delete().eq("product_id", pid);
  } else {
    const { error } = await sb.from("product_wholesale").upsert({ product_id: pid, wholesale_price: wholesale, moq });
    if (error) return { error: error.message };
  }
  await sb.from("price_slabs").delete().eq("product_id", pid);
  if (slabs.length) {
    const { error } = await sb.from("price_slabs").insert(slabs.map((s) => ({ ...s, product_id: pid })));
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const { sb } = await requireAdmin();
  // Products that already appear on orders are hidden instead of deleted, so old invoices keep working.
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) await sb.from("products").update({ is_active: false }).eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function setStock(id: string, fd: FormData) {
  const { sb } = await requireAdmin();
  const n = Math.floor(num(fd.get("stock")));
  if (n >= 0) await sb.from("products").update({ stock: n }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

/* ---------- categories ---------- */
export async function addCategory(fd: FormData) {
  const { sb } = await requireAdmin();
  const name = text(fd.get("name"));
  if (!name) back("/admin/categories", "Enter a category name.");
  const { count } = await sb.from("categories").select("id", { count: "exact", head: true });
  const { error } = await sb.from("categories").insert({ name, slug: slugify(name) || `cat-${Date.now()}`, sort_order: (count ?? 0) + 1 });
  revalidatePath("/", "layout");
  back("/admin/categories", error ? "That category already exists." : undefined);
}
export async function renameCategory(id: string, fd: FormData) {
  const { sb } = await requireAdmin();
  const name = text(fd.get("name"));
  const sort = Math.floor(num(fd.get("sort_order")));
  if (!name) back("/admin/categories", "Name cannot be empty.");
  const { error } = await sb.from("categories").update({ name, slug: slugify(name) || `cat-${Date.now()}`, sort_order: Number.isFinite(sort) ? sort : 0 }).eq("id", id);
  revalidatePath("/", "layout");
  back("/admin/categories", error ? "That name is already used." : undefined);
}
export async function deleteCategory(id: string) {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("categories").delete().eq("id", id);
  revalidatePath("/", "layout");
  back("/admin/categories", error ? "Move or delete this category's products first." : undefined);
}

/* ---------- orders ---------- */
export async function updateOrder(id: string, fd: FormData) {
  const { sb } = await requireAdmin();
  const { error } = await sb.rpc("set_order_status", { p_order: id, p_status: text(fd.get("status")), p_payment: text(fd.get("payment_status")) });
  revalidatePath("/admin", "layout");
  back(`/admin/orders/${id}`, error?.message);
}

/* ---------- dealers ---------- */
export async function setDealer(id: string, fd: FormData) {
  const { sb } = await requireAdmin();
  const status = text(fd.get("dealer_status"));
  const pct = num(fd.get("dealer_discount_pct"));
  if (!["none", "pending", "approved", "rejected"].includes(status)) back("/admin/dealers", "Invalid status.");
  const { error } = await sb.from("profiles").update({ dealer_status: status, dealer_discount_pct: Number.isFinite(pct) ? Math.min(90, Math.max(0, pct)) : 0 }).eq("id", id);
  revalidatePath("/", "layout");
  back("/admin/dealers", error?.message);
}
export async function addDealerPrice(dealerId: string, fd: FormData) {
  const { sb } = await requireAdmin();
  const product_id = text(fd.get("product_id"));
  const price = num(fd.get("unit_price"));
  if (!product_id || !(price >= 0)) back(`/admin/dealers/${dealerId}`, "Choose a product and enter a price.");
  const { error } = await sb.from("dealer_prices").upsert({ dealer_id: dealerId, product_id, unit_price: price }, { onConflict: "dealer_id,product_id" });
  back(`/admin/dealers/${dealerId}`, error?.message);
}
export async function removeDealerPrice(dealerId: string, rowId: string) {
  const { sb } = await requireAdmin();
  await sb.from("dealer_prices").delete().eq("id", rowId);
  back(`/admin/dealers/${dealerId}`);
}

/* ---------- coupons ---------- */
export async function addCoupon(fd: FormData) {
  const { sb } = await requireAdmin();
  const code = text(fd.get("code")).toUpperCase().replace(/\s+/g, "");
  const kind = text(fd.get("kind"));
  const value = num(fd.get("value"));
  const min = num(fd.get("min_order"));
  const maxRaw = text(fd.get("max_uses"));
  const exp = text(fd.get("expires_at"));
  if (!code) back("/admin/coupons", "Enter a coupon code.");
  if (!(value > 0)) back("/admin/coupons", "Enter a discount value above 0.");
  if (kind === "percent" && value > 100) back("/admin/coupons", "A percentage cannot be above 100.");
  const { error } = await sb.from("coupons").insert({
    code,
    kind: kind === "fixed" ? "fixed" : "percent",
    value,
    min_order: Number.isFinite(min) ? min : 0,
    applies_to: ["retail", "wholesale"].includes(text(fd.get("applies_to"))) ? text(fd.get("applies_to")) : "all",
    max_uses: maxRaw ? Math.floor(Number(maxRaw)) : null,
    expires_at: exp ? new Date(`${exp}T23:59:59+05:00`).toISOString() : null,
  });
  back("/admin/coupons", error ? (error.code === "23505" ? "That code already exists." : error.message) : undefined);
}
export async function toggleCoupon(id: string, active: boolean) {
  const { sb } = await requireAdmin();
  await sb.from("coupons").update({ is_active: active }).eq("id", id);
  back("/admin/coupons");
}
export async function deleteCoupon(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("coupons").delete().eq("id", id);
  back("/admin/coupons");
}

/* ---------- reviews ---------- */
export async function approveReview(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("reviews").update({ is_approved: true }).eq("id", id);
  revalidatePath("/", "layout");
  back("/admin/reviews");
}
export async function deleteReview(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("reviews").delete().eq("id", id);
  revalidatePath("/", "layout");
  back("/admin/reviews");
}

/* ---------- settings ---------- */
/** The uploader sends a JSON list of image links; the homepage banner uses the first one. */
function heroImage(v: FormDataEntryValue | null): string {
  try {
    const a = JSON.parse(String(v ?? "[]"));
    return Array.isArray(a) && typeof a[0] === "string" && a[0].startsWith("https://") ? a[0] : "";
  } catch {
    return "";
  }
}

export async function saveSettings(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const moq = Math.floor(num(fd.get("default_moq")));
  const min = num(fd.get("min_wholesale_order"));
  const fee = num(fd.get("delivery_fee"));
  const freeRaw = text(fd.get("free_delivery_over"));
  if (!text(fd.get("store_name"))) return { error: "Enter a store name." };
  if (!(moq >= 1)) return { error: "Default minimum quantity must be 1 or more." };
  if (!(min >= 0)) return { error: "Minimum wholesale order must be 0 or more." };
  if (!(fee >= 0)) return { error: "Delivery fee must be 0 or more." };
  const { error } = await sb.from("store_settings").update({
    store_name: text(fd.get("store_name")),
    store_sub: text(fd.get("store_sub")),
    hero_title: text(fd.get("hero_title")),
    hero_text: text(fd.get("hero_text")),
    whatsapp: text(fd.get("whatsapp")),
    currency: text(fd.get("currency")) || "Rs",
    default_moq: moq,
    min_wholesale_order: min,
    delivery_fee: fee,
    free_delivery_over: freeRaw ? Number(freeRaw) : null,
    jazzcash_number: text(fd.get("jazzcash_number")),
    jazzcash_title: text(fd.get("jazzcash_title")),
    easypaisa_number: text(fd.get("easypaisa_number")),
    easypaisa_title: text(fd.get("easypaisa_title")),
    bank_details: text(fd.get("bank_details")),
    hero_image: heroImage(fd.get("hero_image")),
    instagram: text(fd.get("instagram")),
    address: text(fd.get("address")),
    facebook: text(fd.get("facebook")),
    tiktok: text(fd.get("tiktok")),
    youtube: text(fd.get("youtube")),
    announcement: text(fd.get("announcement")),
    shipping_policy: text(fd.get("shipping_policy")),
    exchange_policy: text(fd.get("exchange_policy")),
    care_text: text(fd.get("care_text")),
    faq: text(fd.get("faq")),
    theme: ["gold", "emerald", "rose"].includes(text(fd.get("theme"))) ? text(fd.get("theme")) : "gold",
  }).eq("id", 1);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
