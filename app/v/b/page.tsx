"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Archivo_Black } from "next/font/google";
import { Check, Flame, MapPin, Play } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const display = Archivo_Black({ weight: "400", subsets: ["latin"] });
const BRAND = "Gainzo";
const ACCENT = "#D4F75C";
const WHATSAPP = "919999999999";
const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

const STEPS = [
  ["Members open it daily.", "Today's workout, streak and form videos, built around their goal."],
  ["They check in with a scan.", "QR at the door plus a location check. No fake check-ins from home."],
  ["You see everything.", "Who came in, who's expiring, who's slipping away. One glance."],
];

const FACTS = [
  [8, "workout splits"],
  [61, "built-in exercises"],
  [1, "tap to check in"],
  [0, "app store downloads needed"],
];

function Screen({ i }: { i: number }) {
  if (i === 0) {
    return (
      <div className="p-4">
        <p className="text-[11px] text-gray-400">Hello, Zayd</p>
        <p className={`${display.className} text-2xl leading-none mt-1`}>Ready to crush<br /><span style={{ color: ACCENT }}>your goals?</span></p>
        <div className="mt-4 p-3 rounded-2xl flex justify-between items-center text-black" style={{ background: ACCENT }}>
          <div><p className="text-[10px]">Current streak</p><p className={`${display.className} text-2xl`}>12 days</p></div>
          <Flame size={28} fill="#000" />
        </div>
        <div className="mt-3 relative h-40 rounded-2xl overflow-hidden">
          <img src={px(5327530)} alt="" className="absolute inset-0 w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] to-transparent" />
          <div className="relative p-3">
            <p className="text-[10px]" style={{ color: ACCENT }}>Thu · Smart plan</p>
            <p className={`${display.className} text-xl leading-none mt-1`}>Legs day</p>
            <span className="mt-8 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold text-black" style={{ background: ACCENT }}>
              Start <Play size={9} fill="#000" />
            </span>
          </div>
        </div>
        {["Barbell Squat · 4 × 8", "Leg Press · 3 × 12", "Calf Raises · 3 × 15"].map((e, k) => (
          <div key={e} className="mt-2 px-3 py-2.5 rounded-xl bg-[#1B1B1B] flex justify-between text-[11px]">
            {e}{k === 0 && <Check size={13} color={ACCENT} strokeWidth={3} />}
          </div>
        ))}
      </div>
    );
  }
  if (i === 1) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-black" style={{ background: ACCENT, boxShadow: `0 0 0 12px ${ACCENT}33` }}>
          <MapPin size={40} />
        </div>
        <p className="mt-6 text-xs" style={{ color: ACCENT }}>Checked in at Iron Tribe</p>
        <p className={`${display.className} text-3xl leading-none mt-2`}>Welcome back,<br /><span style={{ color: ACCENT }}>Zayd!</span></p>
        <p className="mt-4 text-xs text-gray-400 italic">&ldquo;The hardest rep is walking through the door.&rdquo;</p>
        <div className="mt-6 grid grid-cols-2 gap-2 w-full">
          {[["14", "This month"], ["86", "Total visits"]].map(([v, l]) => (
            <div key={l} className="p-3 rounded-2xl bg-[#1B1B1B]"><p className={`${display.className} text-2xl`}>{v}</p><p className="text-[10px] text-gray-400">{l}</p></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="p-4">
      <p className={`${display.className} text-xl`}>Your <span style={{ color: ACCENT }}>crew</span></p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[["In today", "38"], ["Expiring", "6"]].map(([l, v], k) => (
          <div key={l} className="p-3 rounded-2xl" style={k === 0 ? { background: ACCENT, color: "#000" } : { background: "#1B1B1B" }}>
            <p className="text-[10px] opacity-70">{l}</p><p className={`${display.className} text-2xl`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-end gap-1 h-24 p-3 rounded-2xl bg-[#1B1B1B]">
        {[30, 45, 38, 60, 52, 70, 64, 80, 58, 72, 90, 95].map((h, k) => (
          <div key={k} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: k === 11 ? ACCENT : "#3f3f46" }} />
        ))}
      </div>
      {[["Aarav", "In · 7:12 AM", true], ["Priya", "Ends in 3 days", false], ["Kabir", "Missing 9 days", false]].map(([n, s, ok]) => (
        <div key={n as string} className="mt-2 px-3 py-2.5 rounded-xl bg-[#1B1B1B] flex justify-between text-[11px]">
          <span className="font-bold">{n as string}</span><span style={{ color: ok ? ACCENT : "#fb923c" }}>{s as string}</span>
        </div>
      ))}
      <p className="mt-3 text-[9px] text-gray-600 text-center">Sample data</p>
    </div>
  );
}

export default function VariantB() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const title = SplitText.create(".b-title", { type: "lines", mask: "lines" });
      gsap.from(title.lines, { yPercent: 100, duration: 1.1, ease: "expo.out", stagger: 0.1, delay: 0.1 });
      gsap.from(".b-fade", { opacity: 0, y: 16, duration: 0.9, delay: 0.6, stagger: 0.08, ease: "power3.out" });
      gsap.from(".b-phone-peek", { y: 160, opacity: 0, duration: 1.4, delay: 0.4, ease: "expo.out" });

      const steps = gsap.utils.toArray<HTMLElement>(".b-step");
      const screens = gsap.utils.toArray<HTMLElement>(".b-screen");
      gsap.set(steps.slice(1), { opacity: 0, y: 40 });
      gsap.set(screens.slice(1), { opacity: 0, scale: 0.94 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".b-story", start: "top top", end: "+=300%", scrub: 1, pin: true },
      });
      [1, 2].forEach((k) => {
        tl.to(steps[k - 1], { opacity: 0, y: -40, duration: 0.5 })
          .to(screens[k - 1], { opacity: 0, scale: 1.04, duration: 0.5 }, "<")
          .to(steps[k], { opacity: 1, y: 0, duration: 0.5 })
          .to(screens[k], { opacity: 1, scale: 1, duration: 0.5 }, "<")
          .to({}, { duration: 0.4 });
      });
      tl.fromTo(".b-progress", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: tl.duration() }, 0);

      gsap.utils.toArray<HTMLElement>(".b-count").forEach((el) => {
        const end = Number(el.dataset.to);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
        });
      });
    },
    { scope: root }
  );

  const grid = {
    backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "64px 64px",
  };

  return (
    <main ref={root} className="bg-[#060606] text-white">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center text-sm">
          <span className={`${display.className} text-lg`}>{BRAND}</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:inline text-gray-400 hover:text-white">Owner login</Link>
            <a href={`https://wa.me/${WHATSAPP}`} className="px-4 py-2 rounded-full font-bold text-black" style={{ background: ACCENT }}>Book a demo</a>
          </div>
        </div>
      </header>

      <section className="relative min-h-[100svh] pt-36 overflow-hidden" style={grid}>
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#060606] to-transparent z-10" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <p className="b-fade inline-block text-xs px-3 py-1.5 rounded-full border border-white/15 text-gray-400">For gym owners</p>
          <h1 className={`b-title ${display.className} mt-6 text-5xl md:text-8xl leading-[0.95]`}>
            The app your members<br /><span style={{ color: ACCENT }}>actually open.</span>
          </h1>
          <p className="b-fade mt-6 text-gray-400 md:text-lg max-w-xl mx-auto">Smart workout plans, QR check-in and streaks for every member, in your gym&apos;s brand.</p>
          <div className="b-fade mt-8 flex justify-center gap-3">
            <a href={`https://wa.me/${WHATSAPP}`} className="px-6 py-3.5 rounded-full font-bold text-black" style={{ background: ACCENT }}>Book a free demo</a>
            <a href="#story" className="px-6 py-3.5 rounded-full border border-white/15">See how it works</a>
          </div>
        </div>
        <div className="b-phone-peek relative mx-auto mt-16 w-[290px] h-[420px] rounded-t-[44px] border-[7px] border-b-0 border-zinc-800 bg-[#0B0B0B] overflow-hidden">
          <Screen i={0} />
        </div>
      </section>

      <section id="story" className="b-story relative h-screen overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-white/10">
          <div className="b-progress h-full origin-left" style={{ background: ACCENT }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 h-full grid md:grid-cols-2 items-center gap-10">
          <div className="relative h-56 order-2 md:order-1">
            {STEPS.map(([t, d], k) => (
              <div key={t} className="b-step absolute inset-0">
                <p className="text-sm" style={{ color: ACCENT }}>0{k + 1} / 03</p>
                <p className={`${display.className} mt-3 text-4xl md:text-6xl leading-[0.95]`}>{t}</p>
                <p className="mt-4 text-gray-400 md:text-lg max-w-md">{d}</p>
              </div>
            ))}
          </div>
          <div className="relative mx-auto w-[280px] h-[560px] rounded-[46px] border-[7px] border-zinc-800 bg-[#0B0B0B] overflow-hidden order-1 md:order-2 shadow-[0_40px_120px_-20px_rgba(212,247,92,0.25)]">
            {[0, 1, 2].map((k) => (
              <div key={k} className="b-screen absolute inset-0"><Screen i={k} /></div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-32 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10">
        {FACTS.map(([n, l]) => (
          <div key={l as string}>
            <p className={`b-count ${display.className} text-6xl md:text-7xl`} style={{ color: ACCENT }} data-to={n}>0</p>
            <p className="mt-2 text-gray-400">{l as string}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="rounded-[2rem] p-10 md:p-16 text-black flex flex-col md:flex-row justify-between items-start md:items-end gap-8" style={{ background: ACCENT }}>
          <p className={`${display.className} text-5xl md:text-7xl leading-[0.95]`}>Your members<br />deserve this.</p>
          <a href={`https://wa.me/${WHATSAPP}`} className="px-7 py-4 rounded-full bg-black text-white font-bold shrink-0">Book a free demo →</a>
        </div>
      </section>
    </main>
  );
}