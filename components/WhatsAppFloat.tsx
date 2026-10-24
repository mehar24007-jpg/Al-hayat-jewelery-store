"use client";

import { usePathname } from "next/navigation";
import { waNumber } from "@/lib/format";
import { useStore } from "@/lib/store";

/** Round WhatsApp button in the corner of every shop page. */
export default function WhatsAppFloat() {
  const path = usePathname();
  const { settings } = useStore();
  const wa = waNumber(settings.whatsapp);
  if (!wa || path.startsWith("/admin") || path.startsWith("/cart")) return null;

  // Sits above the phone bottom menu, and higher on product pages where an add-to-cart bar can appear.
  const lift = path.startsWith("/product") ? "bottom-[10.5rem]" : "bottom-20";
  return (
    <a
      href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi ${settings.store_name}, I have a question.`)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed right-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110 md:bottom-6 ${lift}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.27-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.31A8.2 8.2 0 1 1 12.04 20.1Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.18-.53.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7.59.26 1.05.41 1.4.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    </a>
  );
}
