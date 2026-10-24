"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FadeImg from "./FadeImg";
import ProductArt, { toneBg } from "./ProductArt";
import { cld } from "@/lib/format";

type Props = { images: string[]; name: string; tone: string; category: string; id: string; tag: string | null; video?: string | null };

/** Cloudinary video: let it pick the best format and quality, and make a still poster from the first frame. */
const vidSrc = (u: string) => (u.includes("/video/upload/") ? u.replace("/video/upload/", "/video/upload/f_auto:video,q_auto/") : u);
const vidPoster = (u: string) => (u.includes("/video/upload/") ? u.replace("/video/upload/", "/video/upload/so_0,w_300,f_jpg/").replace(/\.[a-z0-9]+$/i, ".jpg") : undefined);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Product photos: hover to magnify on a computer, tap for a full screen viewer with pinch, double tap and swipe. */
export default function Gallery({ images, name, tone, category, id, tag, video }: Props) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const total = images.length + (video ? 1 : 0);
  const isVideo = !!video && active === images.length;
  const has = images.length > 0 && !isVideo;
  const src = has ? cld(images[active], 1000) : null;
  const many = total > 1;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  const step = (d: number) => setActive((c) => (c + d + total) % total);

  return (
    <div className="min-w-0">
      <div
        role={has ? "button" : undefined}
        tabIndex={has ? 0 : undefined}
        aria-label={has ? "Open photo full screen" : undefined}
        onClick={() => has && setOpen(true)}
        onKeyDown={(e) => has && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(true))}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        className={`relative grid aspect-square place-items-center overflow-hidden rounded-[14px] border border-line ${has ? "cursor-zoom-in" : ""}`}
        style={{ background: toneBg(tone) }}
      >
        {isVideo && video ? (
          <video
            key={video}
            src={vidSrc(video)}
            poster={vidPoster(video)}
            className="img-swap h-full w-full object-cover"
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`${name} video`}
          />
        ) : src ? (
          <FadeImg
            key={src}
            src={src}
            alt={name}
            className="img-swap h-full w-full select-none object-cover transition-transform duration-200 ease-out"
            style={hover ? { transform: "scale(2.2)", transformOrigin: `${hover.x}% ${hover.y}%` } : undefined}
            draggable={false}
          />
        ) : (
          <ProductArt tone={tone} category={category} id={id} />
        )}
        {tag && !isVideo && <span className="absolute left-3 top-3 rounded-full border border-line bg-ink/80 px-2.5 py-0.5 text-xs uppercase tracking-wide text-gold-soft">{tag}</span>}
        {has && (
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-xs text-cream backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5" />
            </svg>
            Zoom
          </span>
        )}
        {many && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink/85 text-lg backdrop-blur transition hover:scale-110"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink/85 text-lg backdrop-blur transition hover:scale-110"
            >
              ›
            </button>
          </>
        )}
      </div>

      {many && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((u, i) => (
            <button
              key={u}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition duration-200 hover:-translate-y-0.5 ${i === active ? "border-gold ring-2 ring-gold/40" : "border-line opacity-80 hover:opacity-100"}`}
            >
              <FadeImg src={cld(u, 160) ?? u} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
          {video && (
            <button
              onClick={() => setActive(images.length)}
              aria-label="Product video"
              aria-current={isVideo}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-panel2 transition duration-200 hover:-translate-y-0.5 ${isVideo ? "border-gold ring-2 ring-gold/40" : "border-line opacity-80 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {vidPoster(video) && <img src={vidPoster(video)} alt="" className="h-full w-full object-cover" />}
              <span className="absolute inset-0 grid place-items-center bg-black/35 text-white" aria-hidden="true">▶</span>
            </button>
          )}
        </div>
      )}

      {open && <Lightbox images={images} start={active} name={name} onClose={(i) => { setActive(i); setOpen(false); }} />}
    </div>
  );
}

function Lightbox({ images, start, name, onClose }: { images: string[]; start: number; name: string; onClose: (index: number) => void }) {
  const [i, setI] = useState(start);
  const [s, setS] = useState(1);
  const [p, setP] = useState({ x: 0, y: 0 });
  const [smooth, setSmooth] = useState(false);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const swipe = useRef<{ x: number; t: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);
  const pinched = useRef(false);
  const many = images.length > 1;

  const setScale = useCallback((next: number) => {
    const v = clamp(next, 1, 5);
    setS(v);
    if (v <= 1.01) setP({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (d: number) => {
      setI((c) => (c + d + images.length) % images.length);
      setS(1);
      setP({ x: 0, y: 0 });
    },
    [images.length]
  );

  const animate = () => {
    setSmooth(true);
    setTimeout(() => setSmooth(false), 260);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(i);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [i, go, onClose]);

  function toggleZoom() {
    animate();
    if (s > 1.05) {
      setS(1);
      setP({ x: 0, y: 0 });
    } else setS(2.5);
  }

  function down(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.current.size === 2) {
      const [a, b] = Array.from(pts.current.values());
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s };
      pinched.current = true;
      drag.current = null;
      swipe.current = null;
    } else if (pts.current.size === 1) {
      pinched.current = false;
      if (s > 1.01) drag.current = { x: e.clientX, y: e.clientY, px: p.x, py: p.y };
      else swipe.current = { x: e.clientX, t: Date.now(), moved: false };
    }
  }

  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (!pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.current.size === 2 && pinch.current) {
      const [a, b] = Array.from(pts.current.values());
      setScale(pinch.current.s * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d));
    } else if (drag.current) {
      setP({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
    } else if (swipe.current && Math.abs(e.clientX - swipe.current.x) > 8) {
      swipe.current.moved = true;
    }
  }

  function up(e: React.PointerEvent<HTMLDivElement>) {
    const wasSingle = pts.current.size === 1;
    pts.current.delete(e.pointerId);
    if (pts.current.size < 2) pinch.current = null;
    if (!wasSingle) return;
    if (pinched.current) {
      pinched.current = false;
      swipe.current = null;
      drag.current = null;
      return;
    }
    const sw = swipe.current;
    swipe.current = null;
    const moved = drag.current ? Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 8 : sw?.moved;
    drag.current = null;
    if (sw && sw.moved) {
      const dx = e.clientX - sw.x;
      if (Math.abs(dx) > 60 && Date.now() - sw.t < 700 && many) go(dx < 0 ? 1 : -1);
      return;
    }
    if (!moved) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        lastTap.current = 0;
        toggleZoom();
      } else lastTap.current = now;
    }
  }

  const btn = "grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl text-white backdrop-blur transition hover:bg-white/25";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 reveal" role="dialog" aria-modal="true" aria-label={`${name} photos`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <span className="min-w-0 truncate text-sm text-white/80">
          {name}
          {many && <span className="ml-2 tabular-nums">{i + 1} / {images.length}</span>}
        </span>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={() => { animate(); setScale(s - 1); }} aria-label="Zoom out">−</button>
          <button className={btn} onClick={() => { animate(); setScale(s + 1); }} aria-label="Zoom in">+</button>
          <button className={btn} onClick={() => onClose(i)} aria-label="Close">×</button>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(e) => setScale(s * Math.exp(-e.deltaY * 0.002))}
        style={{ cursor: s > 1.01 ? "grab" : "zoom-in" }}
      >
        <div className="grid h-full w-full place-items-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={i}
            src={cld(images[i], 1800) ?? images[i]}
            alt={name}
            draggable={false}
            className="img-swap max-h-full max-w-full object-contain"
            style={{ transform: `translate(${p.x}px, ${p.y}px) scale(${s})`, transition: smooth ? "transform .25s ease" : "none" }}
          />
        </div>
        {many && (
          <>
            <button className={`${btn} absolute left-3 top-1/2 -translate-y-1/2`} onPointerDown={(e) => e.stopPropagation()} onClick={() => go(-1)} aria-label="Previous photo">‹</button>
            <button className={`${btn} absolute right-3 top-1/2 -translate-y-1/2`} onPointerDown={(e) => e.stopPropagation()} onClick={() => go(1)} aria-label="Next photo">›</button>
          </>
        )}
      </div>
      <p className="px-4 py-3 text-center text-xs text-white/60">Double tap or pinch to zoom{many ? ", swipe for the next photo" : ""}</p>
    </div>
  );
}
