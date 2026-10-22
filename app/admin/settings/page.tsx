import Flash from "@/components/admin/Flash";
import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/session";

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const { sb } = await requireAdmin();
  const { data: s } = await sb.from("store_settings").select("*").eq("id", 1).single();
  return (
    <div>
      <h1 className="h-display mb-4 text-3xl">Store settings</h1>
      <Flash ok={saved ? "Settings saved." : undefined} />
      <SettingsForm
        s={{
          store_name: s.store_name, store_sub: s.store_sub, hero_title: s.hero_title, hero_text: s.hero_text, whatsapp: s.whatsapp, currency: s.currency,
          default_moq: s.default_moq, min_wholesale_order: Number(s.min_wholesale_order), delivery_fee: Number(s.delivery_fee),
          free_delivery_over: s.free_delivery_over == null ? null : Number(s.free_delivery_over),
          jazzcash_number: s.jazzcash_number, jazzcash_title: s.jazzcash_title, easypaisa_number: s.easypaisa_number, easypaisa_title: s.easypaisa_title, bank_details: s.bank_details,
          hero_image: s.hero_image ?? "", instagram: s.instagram ?? "", address: s.address ?? "",
          theme: ["gold", "emerald", "rose"].includes(s.theme) ? s.theme : "gold",
        }}
      />
    </div>
  );
}
