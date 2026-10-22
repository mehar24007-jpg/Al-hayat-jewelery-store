"use client";

import { useActionState } from "react";
import { saveSettings, type AdminState } from "@/app/admin/actions";

type S = {
  store_name: string; store_sub: string; hero_title: string; hero_text: string; whatsapp: string; currency: string;
  default_moq: number; min_wholesale_order: number; delivery_fee: number; free_delivery_over: number | null;
  jazzcash_number: string; jazzcash_title: string; easypaisa_number: string; easypaisa_title: string; bank_details: string;
};

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
      <div className="sm:col-span-2"><F id="hero_title" label="Homepage headline"><input id="hero_title" name="hero_title" className="input" defaultValue={s.hero_title} maxLength={120} /></F></div>
      <div className="sm:col-span-2"><F id="hero_text" label="Homepage text"><input id="hero_text" name="hero_text" className="input" defaultValue={s.hero_text} maxLength={220} /></F></div>
      <F id="whatsapp" label="WhatsApp number" hint="Orders and chat links go here. 03xx or 92xx format both work."><input id="whatsapp" name="whatsapp" type="tel" className="input" defaultValue={s.whatsapp} /></F>
      <F id="currency" label="Currency label"><input id="currency" name="currency" className="input" defaultValue={s.currency} maxLength={6} /></F>
      <F id="default_moq" label="Default minimum quantity (wholesale)" hint="Used for every product without its own minimum."><input id="default_moq" name="default_moq" type="number" min={1} step={1} className="input" defaultValue={s.default_moq} required /></F>
      <F id="min_wholesale_order" label="Minimum wholesale order amount" hint="0 means no minimum."><input id="min_wholesale_order" name="min_wholesale_order" type="number" min={0} step="any" className="input" defaultValue={s.min_wholesale_order} required /></F>
      <F id="delivery_fee" label="Delivery fee"><input id="delivery_fee" name="delivery_fee" type="number" min={0} step="any" className="input" defaultValue={s.delivery_fee} required /></F>
      <F id="free_delivery_over" label="Free delivery above (optional)" hint="Leave empty to always charge the delivery fee."><input id="free_delivery_over" name="free_delivery_over" type="number" min={0} step="any" className="input" defaultValue={s.free_delivery_over ?? ""} /></F>
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
