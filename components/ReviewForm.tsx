"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";

export default function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const { profile, email } = useStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!email || !profile) {
    return (
      <p className="note">
        <Link className="text-gold-soft underline" href={`/login?next=${encodeURIComponent(`/product/${slug}`)}`}>Sign in</Link> to write a review.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setState(null);
    const sb = createClient();
    const name = (profile!.full_name || "Customer").trim().slice(0, 60) || "Customer";
    const { error } = await sb.from("reviews").insert({ product_id: productId, user_id: profile!.id, rating, comment: comment.trim(), reviewer_name: name });
    setBusy(false);
    if (error) {
      setState({ type: "err", text: error.code === "23505" ? "You have already reviewed this piece." : "Could not send your review. Try again." });
      return;
    }
    setComment("");
    setState({ type: "ok", text: "Thank you. Your review will appear after we approve it." });
  }

  return (
    <form onSubmit={submit} className="card grid gap-3 p-4">
      <h3 className="font-display text-xl font-semibold">Write a review</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} stars`} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-gold" : "text-line"}`}>★</button>
        ))}
      </div>
      <textarea className="input min-h-24" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="What did you like? Quality, finish, packing." aria-label="Your review" />
      {state && <p className={state.type === "ok" ? "text-sm text-ok" : "err"} role="status">{state.text}</p>}
      <button className="btn btn-gold justify-self-start" disabled={busy}>{busy ? "Sending" : "Send review"}</button>
    </form>
  );
}
