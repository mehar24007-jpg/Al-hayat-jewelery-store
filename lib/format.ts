export function money(n: number | string | null | undefined, currency = "Rs"): string {
  const v = Number(n ?? 0);
  return `${currency} ${Math.round(v).toLocaleString("en-US")}`;
}

/** Cloudinary delivery URL with automatic format and quality at the requested width. */
export function cld(url: string | null | undefined, width = 600): string | null {
  if (!url) return null;
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`) : url;
}

/** 0300 1234567 or +92 300... to digits with country code, as wa.me expects. */
export function waNumber(raw: string | null | undefined): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "92" + d.slice(1);
  return d;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function dateTime(s: string): string {
  return new Date(s).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });
}
