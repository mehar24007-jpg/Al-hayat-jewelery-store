"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

/** Thin strip above the header. Several lines (one per line in Admin, Settings) take turns. */
export default function AnnouncementBar() {
  const path = usePathname();
  const { settings } = useStore();
  const [i, setI] = useState(0);

  const lines = settings.announcement.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length && settings.free_delivery_over) {
    lines.push(`Free delivery on orders above ${money(settings.free_delivery_over, settings.currency)}`);
  }

  useEffect(() => {
    if (lines.length < 2) return;
    const t = setInterval(() => setI((n) => n + 1), 4500);
    return () => clearInterval(t);
  }, [lines.length]);

  if (!lines.length || path.startsWith("/admin")) return null;
  const text = lines[i % lines.length];

  return (
    <div className="bg-gold px-4 py-2 text-center text-[13px] font-medium text-on-gold" role="status">
      <span key={text} className="img-swap inline-block">{text}</span>
    </div>
  );
}
