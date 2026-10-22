const TONES: Record<string, { a: string; b: string; m: string; m2: string }> = {
  gold: { a: "#3a2d1c", b: "#241b12", m: "#d9b36a", m2: "#a9803a" },
  rose: { a: "#3b2823", b: "#261a17", m: "#e2a58f", m2: "#b5705b" },
  silver: { a: "#2b2f33", b: "#1b1e21", m: "#d6dbe0", m2: "#8e979f" },
};

export function toneBg(tone: string): string {
  const t = TONES[tone] ?? TONES.gold;
  return `radial-gradient(circle at 50% 35%, ${t.a}, ${t.b})`;
}

/** Drawn placeholder shown when a product has no photo yet. */
export default function ProductArt({ tone, category, id }: { tone: string; category: string; id: string }) {
  const t = TONES[tone] ?? TONES.gold;
  const gid = `g-${id}`;
  const f = `url(#${gid})`;
  const c = category.toLowerCase();
  const gem = <polygon points="60,24 70,34 60,48 50,34" fill="#f6f1e8" opacity=".92" />;
  let body: React.ReactNode;
  if (c.includes("ring")) {
    body = (
      <>
        <circle cx="60" cy="72" r="26" fill="none" stroke={f} strokeWidth="7" />
        {gem}
        <path d="M50 34h20" stroke={f} strokeWidth="3" />
      </>
    );
  } else if (c.includes("choker") || c.includes("necklace")) {
    body = (
      <>
        <path d="M16 30c10 40 78 40 88 0" fill="none" stroke={f} strokeWidth="4" strokeLinecap="round" />
        {[28, 40, 52, 60, 68, 80, 92].map((x, i) => (
          <circle key={x} cx={x} cy={[42, 52, 58, 60, 58, 52, 42][i]} r={i === 3 ? 6 : 4} fill={f} />
        ))}
        <path d="M60 70l8 10-8 14-8-14z" fill="#f6f1e8" opacity=".92" />
      </>
    );
  } else if (c.includes("bangle") || c.includes("kara")) {
    body = (
      <>
        <ellipse cx="60" cy="64" rx="38" ry="30" fill="none" stroke={f} strokeWidth="9" />
        <ellipse cx="60" cy="64" rx="26" ry="19" fill="none" stroke={f} strokeWidth="3" opacity=".7" />
        <circle cx="38" cy="86" r="3" fill="#f6f1e8" />
        <circle cx="60" cy="94" r="3" fill="#f6f1e8" />
        <circle cx="82" cy="86" r="3" fill="#f6f1e8" />
      </>
    );
  } else {
    body = (
      <>
        <path d="M24 18c4 44 68 44 72 0" fill="none" stroke={f} strokeWidth="4" strokeLinecap="round" />
        <path d="M60 62l9 12-9 16-9-16z" fill="#f6f1e8" opacity=".92" />
        <circle cx="24" cy="88" r="6" fill={f} />
        <path d="M24 94v10" stroke={f} strokeWidth="3" />
        <circle cx="96" cy="88" r="6" fill={f} />
        <path d="M96 94v10" stroke={f} strokeWidth="3" />
      </>
    );
  }
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="h-[68%] w-[68%]">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.m} />
          <stop offset="1" stopColor={t.m2} />
        </linearGradient>
      </defs>
      {body}
    </svg>
  );
}
