import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Size guide | Al Hayat Jewellery" };

const BANGLES: [string, string, string][] = [
  ["2.2", "2 1/8 in", "54 mm"],
  ["2.4", "2 1/4 in", "57 mm"],
  ["2.6", "2 3/8 in", "60 mm"],
  ["2.8", "2 1/2 in", "63.5 mm"],
  ["2.10", "2 5/8 in", "67 mm"],
];

const RINGS: [string, string][] = [
  ["5", "15.7 mm"],
  ["6", "16.5 mm"],
  ["7", "17.3 mm"],
  ["8", "18.1 mm"],
  ["9", "18.9 mm"],
  ["10", "19.8 mm"],
];

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[320px] text-sm tabular-nums">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            {head.map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-line last:border-0">
              {r.map((c, i) => <td key={i} className={`px-4 py-2.5 ${i === 0 ? "font-medium text-gold-soft" : ""}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuide() {
  return (
    <main className="wrap max-w-3xl py-10">
      <h1 className="h-display text-4xl">Size guide</h1>
      <p className="mt-2 text-muted">Sizes are approximate and can vary a little between designs. If you are between two sizes, choose the larger one, or message us on WhatsApp and we will help.</p>

      <section className="mt-10">
        <h2 className="section-title mb-2">Bangles</h2>
        <p className="mb-4 text-muted">
          Measure the inside width of a bangle that already fits you, or measure across the widest part of your hand with your thumb folded in. Match it to the inside diameter below.
        </p>
        <Table head={["Size", "Inside diameter", "In millimetres"]} rows={BANGLES} />
      </section>

      <section className="mt-10">
        <h2 className="section-title mb-2">Rings</h2>
        <p className="mb-4 text-muted">
          Measure the inside width of a ring that fits well (in millimetres), or wrap a thin strip of paper around the finger, mark where it meets, and measure the length. Divide that length by 3.14 to get the width.
        </p>
        <Table head={["Ring size (US)", "Inside diameter"]} rows={RINGS} />
      </section>

      <section className="mt-10">
        <h2 className="section-title mb-2">Tips</h2>
        <ul className="grid gap-2 text-muted">
          <li>Measure at the end of the day, when fingers and hands are a little larger.</li>
          <li>Fingers are larger when warm and smaller when cold.</li>
          <li>A wide ring band feels tighter than a thin one, so go up half a size for wide bands.</li>
        </ul>
      </section>

      <Link href="/#shop" className="btn btn-gold mt-10">Back to the shop</Link>
    </main>
  );
}
