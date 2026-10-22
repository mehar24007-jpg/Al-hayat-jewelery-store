"use client";

import { useState } from "react";
import { cld } from "@/lib/format";

export default function ImageUploader({ initial }: { initial: string[] }) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const s = await fetch("/api/cloudinary/sign", { method: "POST" });
        const sig = await s.json();
        if (!s.ok) throw new Error(sig.error || "Could not start the upload.");
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", sig.key);
        body.append("timestamp", String(sig.timestamp));
        body.append("folder", sig.folder);
        body.append("signature", sig.signature);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud}/image/upload`, { method: "POST", body });
        const out = await r.json();
        if (!r.ok) throw new Error(out?.error?.message || "Cloudinary refused the upload.");
        setImages((cur) => [...cur, out.secure_url as string]);
      }
    } catch (e: any) {
      setError(e?.message || "Upload failed.");
    }
    setBusy(false);
  }

  const move = (i: number, d: number) =>
    setImages((cur) => {
      const n = [...cur];
      const j = i + d;
      if (j < 0 || j >= n.length) return cur;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div className="grid gap-3">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="flex flex-wrap gap-3">
        {images.map((u, i) => (
          <div key={u} className="w-24">
            <div className="h-24 w-24 overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cld(u, 200) ?? u} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <button type="button" className="px-1 text-muted" onClick={() => move(i, -1)} aria-label="Move left">←</button>
              {i === 0 && <span className="text-gold">Main</span>}
              <button type="button" className="px-1 text-muted" onClick={() => move(i, 1)} aria-label="Move right">→</button>
            </div>
            <button type="button" className="w-full text-xs text-warn underline" onClick={() => setImages((c) => c.filter((x) => x !== u))}>Remove</button>
          </div>
        ))}
      </div>
      <label className="btn w-fit cursor-pointer">
        {busy ? "Uploading" : "Upload photos"}
        <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
      </label>
      {error && <p className="err" role="alert">{error}</p>}
      <p className="note">The first photo is the main one. Photos are stored on Cloudinary.</p>
    </div>
  );
}
