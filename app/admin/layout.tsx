import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const NAV = [
  ["/admin", "Dashboard"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/dealers", "Dealers"],
  ["/admin/coupons", "Coupons"],
  ["/admin/reviews", "Reviews"],
  ["/admin/settings", "Settings"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="wrap py-6">
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]" aria-label="Admin">
        {NAV.map(([href, label]) => (
          <Link key={href} href={href} className="shrink-0 px-3.5 py-2.5 text-sm text-muted hover:text-gold-soft">{label}</Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
