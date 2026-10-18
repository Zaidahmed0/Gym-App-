"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Archivo_Black } from "next/font/google";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const display = Archivo_Black({ weight: "400", subsets: ["latin"] });
const BRAND = "Gainzo";
const ACCENT = "#D4F75C";
const WHATSAPP = "919999999999";
const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800`;

const ROWS = [
  ["01", "Smart plans", "Every member gets a weekly routine built for their goal."],
  ["02", "QR check-in", "One scan at the door. Location stops fake check-ins."],
  ["03", "Your brand", "Your logo, your colors. Members see your gym, not ours."],
  ["04", "Renewals on autopilot", "Reminders go out before every plan ends."],
];

export default function VariantA() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const title = SplitText.create(".a-title", { type: "chars,lines", mask: "lines" });
      gsap.from(title.chars, { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.02, delay: 0.15 });
      gsap.from(".a-fade", { opacity: 0, y: 20, duration: 1, delay: 0.9, stagger: 0.1, ease: "power3.out" });
      gsap.fromTo(".a-hero-media", { scale: 1.3 }, { scale: 1.05, duration: 2.6, ease: "expo.out" });
      gsap.to(".a-hero-media", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: { trigger: ".a-hero", start: "top top", end: "bottom top", scrub: true },
      });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".a-expand-wrap", start: "top top", end: "+=150%", scrub: 1, pin: true },
      });
      tl.fromTo(".a-expand", { clipPath: "inset(25% 32% 25% 32% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" })
        .fromTo(".a-expand img", { scale: 1.4 }, { scale: 1, ease: "none" }, 0)
        .fromTo(".a-expand-text", { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: "power2.out" }, 0.55);

      const slideST = { trigger: ".a-slides", start: "top bottom", end: "bottom top", scrub: true };
      gsap.to(".a-slide-left", { xPercent: -30, ease: "none", scrollTrigger: slideST });
      gsap.fromTo(".a-slide-right", { xPercent: -30 }, { xPercent: 0, ease: "none", scrollTrigger: { ...slideST } });

      gsap.utils.toArray<HTMLElement>(".a-reveal").forEach((el) => {
        const s = SplitText.create(el, { type: "lines", mask: "lines" });
        gsap.from(s.lines, { yPercent: 100, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 85%" } });
      });

      gsap.utils.toArray<HTMLElement>(".a-row").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    },
    { scope: root }
  );

  return (
    <main ref={root} className="bg-[#0a0a0a] text-white">
      <header className="fixed top-0 inset-x-0 z-50 mix-blend-difference">
        <div className="px-6 md:px-10 py-6 flex justify-between items-center text-sm">
          <span className={`${display.className} text-lg`}>{BRAND}</span>
          <div className="flex gap-6">
            <Link href="/login" className="hidden md:inline">Owner login</Link>
            <a href={`https://wa.me/${WHATSAPP}`} className="underline underline-offset-4">Book a demo</a>
          </div>
        </div>
      </header>

      <section className="a-hero relative h-[100svh] overflow-hidden">
        <div className="a-hero-media absolute inset-0">
          <video className="w-full h-full object-cover grayscale" autoPlay muted loop playsInline poster={px(9152548)}>
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-black/40" />
        <div className="relative h-full flex flex-col justify-end px-6 md:px-10 pb-10">
          <h1 className={`a-title ${display.className} text-[17vw] md:text-[12vw] leading-[0.82] tracking-tight`}>
            Train.<br />Track.<br /><span style={{ color: ACCENT }}>Return.</span>
          </h1>
          <div className="mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <p className="a-fade max-w-sm text-gray-300">The branded member app and owner dashboard for gyms that want people to keep coming back.</p>
            <p className="a-fade text-xs text-gray-400 tracking-[0.3em] uppercase">Scroll</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-32 md:py-48">
        <p className={`a-reveal ${display.className} text-4xl md:text-7xl leading-[1.02] max-w-6xl`}>
          Most members quit in their first 90 days. Not because they don&apos;t care, but because nobody reminds them <span style={{ color: ACCENT }}>why they started.</span>
        </p>
      </section>

      <section className="a-expand-wrap relative h-screen overflow-hidden">
        <div className="a-expand absolute inset-0 overflow-hidden">
          <img src={px(20873830)} alt="" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="a-expand-text absolute inset-0 flex items-center justify-center text-center px-6">
          <p className={`${display.className} text-5xl md:text-8xl leading-[0.9]`}>
            Your gym,<br /><span style={{ color: ACCENT }}>in their pocket.</span>
          </p>
        </div>
      </section>

      <section className="a-slides py-24 overflow-hidden">
        <p className={`a-slide-left ${display.className} whitespace-nowrap text-[16vw] leading-none`}>STREAKS · PLANS · CHECK-IN ·</p>
        <p className={`a-slide-right ${display.className} whitespace-nowrap text-[16vw] leading-none`} style={{ color: "transparent", WebkitTextStroke: `2px ${ACCENT}` }}>
          REMINDERS · VIDEOS · PROGRESS ·
        </p>
      </section>

      <section className="px-6 md:px-10 py-24">
        {ROWS.map(([n, t, d]) => (
          <div key={n} className="a-row group border-t border-white/15 py-10 md:py-14 grid md:grid-cols-[120px_1fr_1fr] gap-4 items-baseline hover:pl-4 transition-all duration-500">
            <span className="text-sm text-gray-500">{n}</span>
            <span className={`${display.className} text-4xl md:text-6xl group-hover:text-[#D4F75C] transition-colors duration-500`}>{t}</span>
            <span className="text-gray-400 md:text-lg">{d}</span>
          </div>
        ))}
        <div className="border-t border-white/15" />
      </section>

      <section className="px-6 md:px-10 py-40 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">Ready when you are</p>
        <a href={`https://wa.me/${WHATSAPP}`} className={`group inline-block mt-6 ${display.className} text-[14vw] md:text-[10vw] leading-none`}>
          Let&apos;s <span className="italic transition-colors duration-500 group-hover:text-[#D4F75C]">talk.</span>
        </a>
      </section>
    </main>
  );
}