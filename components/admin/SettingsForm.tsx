"use client";

import { useActionState } from "react";
import ImageUploader from "./ImageUploader";
import { saveSettings, type AdminState } from "@/app/admin/actions";

type S = {
  store_name: string; store_sub: string; hero_title: string; hero_text: string; whatsapp: string; currency: string;
  default_moq: number; min_wholesale_order: number; delivery_fee: number; free_delivery_over: number | null;
  jazzcash_number: string; jazzcash_title: string; easypaisa_number: string; easypaisa_title: string; bank_details: string;
  hero_image: string; instagram: string; address: string; theme: "gold" | "emerald" | "rose";
  facebook: string; tiktok: string; youtube: string; announcement: string;
  shipping_policy: string; exchange_policy: string; care_text: string; faq: string;
};

const THEMES: { id: "gold" | "emerald" | "rose"; name: string; note: string; swatch: [string, string, string] }[] = [
  { id: "gold", name: "Black and gold", note: "Premium, bridal feel", swatch: ["#15110f", "#c9a45c", "#f1e8d8"] },
  { id: "emerald", name: "Cream and green", note: "Light, clean, traditional", swatch: ["#f6f1e6", "#1b5e46", "#1f2a24"] },
  { id: "rose", name: "White and rose gold", note: "Soft, modern, for ladies", swatch: ["#fbf7f5", "#b76e79", "#2a2024"] },
];

function F({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div><label className="label" htmlFor={id}>{label}</label>{children}{hint && <p className="note mt-1">{hint}</p>}</div>
  );
}

export default function SettingsForm({ s }: { s: S }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveSettings, null);
  return (
    <form action={action} className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <F id="store_name" label="Store name"><input id="store_name" name="store_name" className="input" defaultValue={s.store_name} required maxLength={40} /></F>
      <F id="store_sub" label="Line under the name"><input id="store_sub" name="store_sub" className="input" defaultValue={s.store_sub} maxLength={40} /></F>
      <h2 className="mt-2 text-sm font-semibold text-gold sm:col-span-2">Look of the shop</h2>
      <fieldset className="sm:col-span-2">
        <legend className="label">Colour theme</legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {THEMES.map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-line bg-panel p-3 has-[:checked]:border-gold">
              <input type="radio" name="theme" value={t.id} defaultChecked={s.theme === t.id} className="accent-gold" />
              <span className="flex shrink-0 overflow-hidden rounded-full border border-line">
                {t.swatch.map((c) => <i key={c} className="block h-6 w-4" style={{ background: c }} />)}
              </span>
              <span className="min-w-0 text-sm leading-tight">{t.name}<span className="block text-xs text-muted">{t.note}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <span className="label">Homepage banner photo (optional)</span>
        <ImageUploader name="hero_image" single initial={s.hero_image ? [s.hero_image] : []} />
        <p className="note mt-1">A wide photo works best (landscape). Without one, a dark gold background is shown. Press Save settings after uploading.</p>
      </div>
      <div className="sm:col-span-2"><F id="hero_title" label="Homepage headline"><input id="hero_title" name="hero_title" className="input" defaultValue={s.hero_title} maxLength={120} /></F></div>
      <div className="sm:col-span-2"><F id="hero_text" label="Homepage text"><input id="hero_text" name="hero_text" className="input" defaultValue={s.hero_text} maxLength={220} /></F></div>
      <F id="whatsapp" label="WhatsApp number" hint="Orders and chat links go here. 03xx or 92xx format both work."><input id="whatsapp" name="whatsapp" type="tel" className="input" defaultValue={s.whatsapp} /></F>
      <F id="instagram" label="Instagram (optional)" hint="Your username or full link. Shown in the footer."><input id="instagram" name="instagram" className="input" defaultValue={s.instagram} maxLength={120} placeholder="@alhayatjewellery" /></F>
      <F id="facebook" label="Facebook (optional)"><input id="facebook" name="facebook" className="input" defaultValue={s.facebook} maxLength={120} placeholder="page name or link" /></F>
      <F id="tiktok" label="TikTok (optional)"><input id="tiktok" name="tiktok" className="input" defaultValue={s.tiktok} maxLength={120} placeholder="@username" /></F>
      <F id="youtube" label="YouTube (optional)"><input id="youtube" name="youtube" className="input" defaultValue={s.youtube} maxLength={120} placeholder="@channel" /></F>
      <F id="address" label="Shop address (optional)" hint="Shown in the footer."><input id="address" name="address" className="input" defaultValue={s.address} maxLength={200} /></F>
      <F id="currency" label="Currency label"><input id="currency" name="currency" className="input" defaultValue={s.currency} maxLength={6} /></F>
      <F id="default_moq" label="Default minimum quantity (wholesale)" hint="Used for every product without its own minimum."><input id="default_moq" name="default_moq" type="number" min={1} step={1} className="input" defaultValue={s.default_moq} required /></F>
      <F id="min_wholesale_order" label="Minimum wholesale order amount" hint="0 means no minimum."><input id="min_wholesale_order" name="min_wholesale_order" type="number" min={0} step="any" className="input" defaultValue={s.min_wholesale_order} required /></F>
      <F id="delivery_fee" label="Delivery fee"><input id="delivery_fee" name="delivery_fee" type="number" min={0} step="any" className="input" defaultValue={s.delivery_fee} required /></F>
      <F id="free_delivery_over" label="Free delivery above (optional)" hint="Leave empty to always charge the delivery fee."><input id="free_delivery_over" name="free_delivery_over" type="number" min={0} step="any" className="input" defaultValue={s.free_delivery_over ?? ""} /></F>
      <h2 className="mt-2 text-sm font-semibold text-gold sm:col-span-2">Top bar, policies and questions</h2>
      <div className="sm:col-span-2">
        <F id="announcement" label="Top bar messages (optional)" hint="One message per line. Several lines rotate. Empty shows the free delivery message.">
          <textarea id="announcement" name="announcement" className="input min-h-20" defaultValue={s.announcement} maxLength={400} placeholder={"Free delivery on orders above Rs 3000\nNew bridal sets are here"} />
        </F>
      </div>
      <div className="sm:col-span-2">
        <F id="shipping_policy" label="Shipping policy" hint="Shown on the product page and the Policies page.">
          <textarea id="shipping_policy" name="shipping_policy" className="input min-h-24" defaultValue={s.shipping_policy} maxLength={1500} />
        </F>
      </div>
      <div className="sm:col-span-2">
        <F id="exchange_policy" label="Exchange and returns" hint="For example: exchange within 7 days if unused, in original packing.">
          <textarea id="exchange_policy" name="exchange_policy" className="input min-h-24" defaultValue={s.exchange_policy} maxLength={1500} />
        </F>
      </div>
      <div className="sm:col-span-2">
        <F id="care_text" label="Jewellery care" hint="Keep away from water and perfume, store in a box, and so on.">
          <textarea id="care_text" name="care_text" className="input min-h-20" defaultValue={s.care_text} maxLength={1000} />
        </F>
      </div>
      <div className="sm:col-span-2">
        <F id="faq" label="Frequently asked questions" hint="Write Q: before the question and A: before the answer. Leave one blank line between questions.">
          <textarea id="faq" name="faq" className="input min-h-40" defaultValue={s.faq} maxLength={5000} placeholder={"Q: How long does delivery take?\nA: 3 to 5 working days.\n\nQ: Is cash on delivery available?\nA: Yes, all over Pakistan."} />
        </F>
      </div>
      <h2 className="mt-2 text-sm font-semibold text-gold sm:col-span-2">Payments customers send to you</h2>
      <p className="note -mt-2 sm:col-span-2">Customers pay to these accounts and type the transaction ID at checkout. You then mark the order as paid. Leave a number empty to hide that option.</p>
      <F id="jazzcash_number" label="JazzCash number"><input id="jazzcash_number" name="jazzcash_number" type="tel" className="input" defaultValue={s.jazzcash_number} placeholder="03xx xxxxxxx" /></F>
      <F id="jazzcash_title" label="JazzCash account name"><input id="jazzcash_title" name="jazzcash_title" className="input" defaultValue={s.jazzcash_title} maxLength={60} /></F>
      <F id="easypaisa_number" label="Easypaisa number"><input id="easypaisa_number" name="easypaisa_number" type="tel" className="input" defaultValue={s.easypaisa_number} placeholder="03xx xxxxxxx" /></F>
      <F id="easypaisa_title" label="Easypaisa account name"><input id="easypaisa_title" name="easypaisa_title" className="input" defaultValue={s.easypaisa_title} maxLength={60} /></F>
      <div className="sm:col-span-2">
        <F id="bank_details" label="Bank account details (optional)" hint="Shown to customers who choose bank transfer. Bank name, account title, account number or IBAN.">
          <textarea id="bank_details" name="bank_details" className="input min-h-24" defaultValue={s.bank_details} maxLength={400} />
        </F>
      </div>
      {state?.error && <p className="err sm:col-span-2" role="alert">{state.error}</p>}
      <div className="sm:col-span-2"><button className="btn btn-gold" disabled={pending}>{pending ? "Saving" : "Save settings"}</button></div>
    </form>
  );
}
