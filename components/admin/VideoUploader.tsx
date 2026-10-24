"use client";

import { useState } from "react";

const MAX_MB = 60;

/** One short product video, uploaded straight to Cloudinary. */
export default function VideoUploader({ initial, name = "video_url" }: { initial: string; name?: string }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file?: File) {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`This video is ${(file.size / 1048576).toFixed(0)} MB. Please keep it under ${MAX_MB} MB (a 10 to 20 second clip is enough).`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const s = await fetch("/api/cloudinary/sign", { method: "POST" });
      const sig = await s.json();
      if (!s.ok) throw new Error(sig.error || "Could not start the upload.");
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.key);
      body.append("timestamp", String(sig.timestamp));
      body.append("folder", sig.folder);
      body.append("signature", sig.signature);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud}/video/upload`, { method: "POST", body });
      const out = await r.json();
      if (!r.ok) throw new Error(out?.error?.message || "Cloudinary refused the video.");
      setUrl(out.secure_url as string);
    } catch (e: any) {
      setError(e?.message || "Upload failed.");
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={url} />
      {url && (
        <div className="w-40">
          <video src={url} className="aspect-square w-40 rounded-lg border border-line object-cover" controls muted playsInline preload="metadata" />
          <button type="button" className="mt-1 w-full text-xs text-warn underline" onClick={() => setUrl("")}>Remove video</button>
        </div>
      )}
      <label className="btn w-fit cursor-pointer">
        {busy ? "Uploading, please wait" : url ? "Replace video" : "Upload video"}
        <input type="file" accept="video/mp4,video/quicktime,video/webm,video/*" className="hidden" disabled={busy} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {error && <p className="err" role="alert">{error}</p>}
      <p className="note">Optional. A short clip (10 to 20 seconds, under {MAX_MB} MB) of the piece being worn. It plays on the product page after the photos. Press Save after uploading.</p>
    </div>
  );
}
