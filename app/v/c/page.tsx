"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Archivo_Black } from "next/font/google";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const display = Archivo_Black({ weight: "400", subsets: ["latin"] });
const BRAND = "GymPulse";
const ACCENT = "#D4F75C";
const WHATSAPP = "919999999999";
const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;
const TRAIL = [5327530, 11433060, 20873830, 4164759, 17210042, 13896072, 3837439, 9152548].map(px);

const CARDS = [
  { title: "SMART PLANS", text: "Goal in. Weekly routine out. Every member, automatically.", bg: ACCENT, fg: "#000", img: px(5327530) },
  { title: "SCAN TO CHECK IN", text: "QR at the door. Location check. No cheating from the couch.", bg: "#161616", fg: "#fff", img: px(9152548) },
  { title: "YOUR BRAND", text: "Your logo. Your colors. Your app on their home screen.", bg: "#ffffff", fg: "#000", img: px(17210042) },
  { title: "NO MORE CHASING", text: "Renewal reminders go out before every plan ends.", bg: "#161616", fg: "#fff", img: px(13896072) },
];

export default function VariantC() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".c-line", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.1, delay: 0.1 });
      gsap.from(".c-sticker", { scale: 0, rotate: -40, duration: 0.8, ease: "back.out(2)", stagger: 0.12, delay: 0.7 });

      gsap.utils.toArray<HTMLElement>(".c-move").forEach((el, i) => {
        gsap.to(el, {
          xPercent: i % 2 ? 18 : -18,
          ease: "none",
          scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      const loop = gsap.to(".c-track", { xPercent: -50, repeat: -1, duration: 22, ease: "none" });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          const speed = 1 + Math.min(Math.abs(v) / 250, 6);
          gsap.to(loop, { timeScale: v < 0 ? -speed : speed, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 1.2, delay: 0.25, overwrite: false });
        },
      });

      const cards = gsap.utils.toArray<HTMLElement>(".c-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.9,
          filter: "brightness(0.5)",
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true },
        });
      });

      const imgs = gsap.utils.toArray<HTMLImageElement>(".c-trail");
      let idx = 0;
      let last = { x: 0, y: 0 };
      const el = hero.current;
      if (!el) return;
      const onMove = (e: MouseEvent) => {
        if (Math.hypot(e.clientX - last.x, e.clientY - last.y) < 90) return;
        last = { x: e.clientX, y: e.clientY };
        const img = imgs[idx % imgs.length];
        idx++;
        const r = el.getBoundingClientRect();
        gsap.killTweensOf(img);
        gsap.set(img, { x: e.clientX - r.left - 80, y: e.clientY - r.top - 100, scale: 0.5, opacity: 1, rotate: gsap.utils.random(-14, 14), zIndex: idx });
        gsap.to(img, { scale: 1, duration: 0.45, ease: "back.out(2)" });
        gsap.to(img, { opacity: 0, scale: 0.8, duration: 0.6, delay: 0.55, ease: "power2.in" });
      };
      el.addEventListener("mousemove", onMove);
      return () => el.removeEventListener("mousemove", onMove);
    },
    { scope: root }
  );

  return (
    <main ref={root} className="bg-black text-white overflow-x-clip">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="px-5 py-5 flex justify-between items-center">
          <span className={`${display.className} text-xl px-3 py-1 -rotate-2 text-black`} style={{ background: ACCENT }}>{BRAND}</span>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="hidden md:inline">Owner login</Link>
            <a href={`https://wa.me/${WHATSAPP}`} className="px-4 py-2 bg-white text-black font-bold">BOOK DEMO</a>
          </div>
        </div>
      </header>

      <section ref={hero} className="relative h-[100svh] flex flex-col justify-center overflow-hidden cursor-crosshair">
        {TRAIL.map((src) => (
          <img key={src} src={src} alt="" className="c-trail absolute top-0 left-0 w-40 h-52 object-cover grayscale opacity-0 pointer-events-none" />
        ))}
        {[["SHOW UP.", "#fff"], ["LIFT HEAVY.", ACCENT], ["REPEAT.", "transparent"]].map(([t, c]) => (
          <div key={t} className="overflow-hidden">
            <p className={`c-line c-move ${display.className} text-[17vw] leading-[0.86] whitespace-nowrap px-4`}
              style={c === "transparent" ? { color: "transparent", WebkitTextStroke: "2px #fff" } : { color: c }}>
              {t}
            </p>
          </div>
        ))}
        <span className="c-sticker absolute top-[22%] right-[8%] rotate-12 px-4 py-2 text-black font-black text-sm" style={{ background: ACCENT }}>
          MADE FOR INDIAN GYMS
        </span>
        <span className="c-sticker absolute bottom-[14%] left-[6%] -rotate-6 px-4 py-2 bg-white text-black font-black text-sm">
          NO APP STORE NEEDED
        </span>
        <p className="absolute bottom-6 right-5 text-xs text-gray-500 hidden md:block">move your mouse ↗</p>
      </section>

      <div className="py-6 border-y-2 border-white overflow-hidden" style={{ background: ACCENT }}>
        <div className={`c-track ${display.className} flex whitespace-nowrap text-black text-4xl md:text-6xl`}>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex">
              {["NO DAYS OFF", "STREAKS", "SMART PLANS", "QR CHECK-IN", "YOUR BRAND", "LET'S GO"].map((t) => (
                <span key={t} className="px-6">{t} ●</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="px-4 md:px-10 py-24">
        <p className={`${display.className} text-5xl md:text-8xl leading-[0.9] mb-16`}>WHAT YOU<br /><span style={{ color: ACCENT }}>GET.</span></p>
        {CARDS.map((c, i) => (
          <div key={c.title} className="c-card sticky mb-6 h-[70vh] min-h-[460px] rounded-[2rem] overflow-hidden grid md:grid-cols-2"
            style={{ top: `calc(10vh + ${i * 18}px)`, background: c.bg, color: c.fg }}>
            <div className="p-8 md:p-12 flex flex-col justify-between">
              <span className="text-sm font-bold">0{i + 1}</span>
              <div>
                <p className={`${display.className} text-5xl md:text-7xl leading-[0.9]`}>{c.title}</p>
                <p className="mt-4 text-lg opacity-80 max-w-sm">{c.text}</p>
              </div>
            </div>
            <img src={c.img} alt="" className="hidden md:block w-full h-full object-cover grayscale" />
          </div>
        ))}
      </section>

      <section className="px-4 md:px-10 pb-24">
        <a href={`https://wa.me/${WHATSAPP}`} className="group block border-2 border-white p-8 md:p-14 hover:bg-[#D4F75C] hover:text-black hover:border-[#D4F75C] transition-colors duration-300">
          <p className="text-sm font-bold">READY?</p>
          <p className={`${display.className} text-[15vw] md:text-[10vw] leading-[0.85]`}>BOOK A DEMO →</p>
        </a>
      </section>
    </main>
  );
}