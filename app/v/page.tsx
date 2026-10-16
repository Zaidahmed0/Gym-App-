import Link from "next/link";

const OPTIONS = [
  { href: "/v/a", tag: "A", name: "Cinematic Club", text: "Calm, premium, film-like. Big type and images that open up as you scroll." },
  { href: "/v/b", tag: "B", name: "Product Tech", text: "Sharp and precise. The phone pins and its screens change as you scroll." },
  { href: "/v/c", tag: "C", name: "Raw Street", text: "Loud Gen Z energy. Cursor photo trail, speed marquee, stacking cards." },
];

export default function Variants() {
  return (
    <main className="min-h-screen bg-[#070707] text-white p-6 md:p-16">
      <p className="text-sm text-gray-500">Landing page options</p>
      <h1 className="mt-2 text-5xl md:text-7xl font-black leading-none">Pick your vibe.</h1>
      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {OPTIONS.map((o) => (
          <Link key={o.href} href={o.href} className="group p-8 rounded-3xl bg-zinc-900 border border-white/5 hover:border-[#D4F75C] transition">
            <span className="text-7xl font-black text-[#D4F75C]">{o.tag}</span>
            <p className="mt-6 text-2xl font-bold">{o.name}</p>
            <p className="mt-2 text-gray-400">{o.text}</p>
            <p className="mt-8 text-sm text-gray-500 group-hover:text-white transition">Open →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}