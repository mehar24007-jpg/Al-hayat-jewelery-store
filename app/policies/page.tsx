import Link from "next/link";
import type { Metadata } from "next";
import Faq from "@/components/Faq";
import { createClient } from "@/lib/supabase/server";
import { waNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Shipping, returns and questions | Al Hayat Jewellery" };
export const dynamic = "force-dynamic";

export default async function Policies() {
  const sb = await createClient();
  const { data: s } = await sb.from("store_settings").select("shipping_policy,exchange_policy,care_text,faq,whatsapp,store_name").eq("id", 1).maybeSingle();
  const wa = waNumber(s?.whatsapp);
  const blocks: [string, string, string | undefined][] = [
    ["shipping", "Shipping", s?.shipping_policy],
    ["exchange", "Exchange and returns", s?.exchange_policy],
    ["care", "Jewellery care", s?.care_text],
  ];

  return (
    <main className="wrap max-w-3xl py-10">
      <h1 className="h-display text-4xl">Shipping, returns and questions</h1>

      {blocks.map(([id, title, text]) => (
        <section key={id} id={id} className="mt-8 scroll-mt-24">
          <h2 className="section-title mb-2">{title}</h2>
          {text?.trim() ? (
            <p className="whitespace-pre-line text-muted">{text}</p>
          ) : (
            <p className="text-muted">
              Details are on the way. For now, please ask us on{" "}
              {wa ? <a className="text-gold-soft underline" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> : "WhatsApp"}.
            </p>
          )}
        </section>
      ))}

      <div id="faq" className="scroll-mt-24">
        <Faq text={s?.faq ?? ""} title="Questions we hear often" />
      </div>

      <Link href="/#shop" className="btn btn-gold mt-10">Back to the shop</Link>
    </main>
  );
}
