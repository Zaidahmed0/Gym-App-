"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Archivo_Black } from "next/font/google";
import { Flame, Play, MapPin, Check, Plus, Minus, ArrowUpRight, Download } from "lucide-react";
import SmoothScroll from "./v/SmoothScroll";
import LeadForm from "./_landing/LeadForm";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const display = Archivo_Black({ weight: "400", subsets: ["latin"] });
const BRAND = "GymPulse";
const ACCENT = "#D4F75C";
const WHATSAPP = "919999999999";
const PRICES = { starter: "₹999", pro: "₹1,999" };

const px = (id: number, w = 900) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const TRAIL = [5327530, 11433060, 20873830, 4164759, 17210042, 13896072, 3837439, 9152548, 3763115, 4164755];

const ROWS = [
  { name: "Smart plans", text: "A weekly routine for every goal", img: 5327530 },
  { name: "QR check-in", text: "Scan at the door, location verified", img: 9152548 },
  { name: "Streaks", text: "A reason to come back tomorrow", img: 17210042 },
  { name: "Your brand", text: "Your logo, your colors, their phone", img: 20873830 },
  { name: "Insights", text: "Who's in, who's due, who's slipping", img: 4164759 },
];

const CARDS = [
  { title: "SMART PLANS", text: "Goal, level and muscle focus in. A full weekly routine out. Every member, automatically.", bg: ACCENT, fg: "#000", img: 5327530 },
  { title: "SCAN TO CHECK IN", text: "QR at the door plus a location check. No cheating from the couch.", bg: "#161616", fg: "#fff", img: 9152548 },
  { title: "NO MORE CHASING", text: "Reminders go out before every plan ends. Dues tracked. Renewals on autopilot.", bg: "#ffffff", fg: "#000", img: 13896072 },
  { title: "YOUR BRAND", text: "Your logo, colors and fonts. Members see your gym on their home screen.", bg: "#161616", fg: "#fff", img: 17210042 },
];

const FAQS = [
  { q: "Do members need the Play Store?", a: "No. Android members get a direct download link, iPhone members add it to their home screen in two taps." },
  { q: "Can I use my own logo and colors?", a: "Yes. Logo, accent color, background and font. Every member sees your branding." },
  { q: "What about members without smartphones?", a: "Check them in manually from your dashboard. Their plan, dues and expiry are still tracked." },
  { q: "Is member data safe?", a: "Each gym's data is kept separate, and passwords are encrypted so nobody, not even us, can read them." },
];

function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-[230px] h-[470px] rounded-[40px] border-[6px] border-zinc-800 bg-[#0B0B0B] overflow-hidden shadow-2xl shadow-black ${className}`}>
      {children}
    </div>
  );
}

function ScreenHome() {
  return (
    <div className="p-3.5">
      <p className="text-[10px] text-gray-400">Hello, Rohan</p>
      <p className={`${display.className} text-xl leading-none mt-1`}>Ready to crush<br /><span style={{ color: ACCENT }}>your goals?</span></p>
      <div className="mt-3 p-3 rounded-2xl flex justify-between items-center text-black" style={{ background: ACCENT }}>
        <div><p className="text-[9px]">Current streak</p><p className={`${display.className} text-xl`}>12 days</p></div>
        <Flame size={24} fill="#000" />
      </div>
      <div className="mt-2.5 grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="py-1 rounded-md text-center text-[9px]"
            style={i < 3 ? { background: ACCENT, color: "#000" } : i === 3 ? { border: `1px solid ${ACCENT}`, color: ACCENT } : { background: "#1B1B1B", color: "#777" }}>{d}</div>
        ))}
      </div>
      <div className="mt-2.5 relative h-32 rounded-2xl overflow-hidden">
        <img src={px(5327530, 500)} alt="" className="absolute inset-0 w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] to-transparent" />
        <div className="relative p-3">
          <p className="text-[9px]" style={{ color: ACCENT }}>Thu · Smart plan</p>
          <p className={`${display.className} text-base mt-0.5`}>Legs day</p>
          <span className="mt-5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold text-black" style={{ background: ACCENT }}>
            Start <Play size={8} fill="#000" />
          </span>
        </div>
      </div>
    </div>
  );
}

function ScreenCheckin() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-black" style={{ background: ACCENT, boxShadow: `0 0 0 10px ${ACCENT}33` }}>
        <MapPin size={32} />
      </div>
      <p className="mt-5 text-[10px]" style={{ color: ACCENT }}>Checked in</p>
      <p className={`${display.className} text-2xl leading-none mt-1`}>Welcome back,<br /><span style={{ color: ACCENT }}>Rohan!</span></p>
      <p className="mt-3 text-[10px] text-gray-400 italic">&ldquo;The hardest rep is walking through the door.&rdquo;</p>
      <div className="mt-4 grid grid-cols-2 gap-2 w-full">
        {[["14", "This month"], ["86", "Total"]].map(([v, l]) => (
          <div key={l} className="p-2.5 rounded-xl bg-[#1B1B1B]"><p className={`${display.className} text-lg`}>{v}</p><p className="text-[9px] text-gray-400">{l}</p></div>
        ))}
      </div>
    </div>
  );
}

function ScreenOwner() {
  return (
    <div className="p-3.5">
      <p className={`${display.className} text-lg`}>Your <span style={{ color: ACCENT }}>crew</span></p>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {[["In today", "38"], ["Due", "₹12k"]].map(([l, v], k) => (
          <div key={l} className="p-2.5 rounded-xl" style={k === 0 ? { background: ACCENT, color: "#000" } : { background: "#1B1B1B" }}>
            <p className="text-[9px] opacity-70">{l}</p><p className={`${display.className} text-lg`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-end gap-0.5 h-20 p-2.5 rounded-xl bg-[#1B1B1B]">
        {[30, 45, 38, 60, 52, 70, 64, 80, 58, 72, 90, 95].map((h, k) => (
          <div key={k} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: k === 11 ? ACCENT : "#3f3f46" }} />
        ))}
      </div>
      {[["Aarav", "In 7:12 AM", true], ["Priya", "3 days left", false], ["Kabir", "Missing 9d", false]].map(([n, s, ok]) => (
        <div key={n as string} className="mt-1.5 px-2.5 py-2 rounded-lg bg-[#1B1B1B] flex justify-between text-[10px]">
          <span className="font-bold">{n as string}</span><span style={{ color: ok ? ACCENT : "#fb923c" }}>{s as string}</span>
        </div>
      ))}
      <p className="mt-2 text-[8px] text-gray-600 text-center">Sample data</p>
    </div>
  );
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi! I want a demo of ${BRAND} for my gym.`)}`;

  useGSAP(
    () => {
      const counter = { v: 0 };
      const countEl = root.current?.querySelector(".pre-count");
      const title = SplitText.create(".hero-line", { type: "chars", mask: "chars" });

      const intro = gsap.timeline();
      intro
        .to(counter, {
          v: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => { if (countEl) countEl.textContent = String(Math.round(counter.v)); },
        })
        .to(".pre", { yPercent: -100, duration: 1, ease: "expo.inOut" })
        .from(title.chars, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.025 }, "-=0.4")
        .from(".sticker", { scale: 0, rotate: -40, duration: 0.7, ease: "back.out(2)", stagger: 0.12 }, "-=0.5")
        .from(".hero-fade", { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, "-=0.5");

      gsap.utils.toArray<HTMLElement>(".hero-move").forEach((el, i) => {
        gsap.to(el, {
          xPercent: i % 2 ? 15 : -15,
          ease: "none",
          scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      const loop = gsap.to(".marquee-track", { xPercent: -50, repeat: -1, duration: 22, ease: "none" });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          const speed = 1 + Math.min(Math.abs(v) / 250, 6);
          gsap.to(loop, { timeScale: v < 0 ? -speed : speed, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 1.2, delay: 0.25, overwrite: false });
        },
      });

      const words = SplitText.create(".highlight", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.12 }, {
        opacity: 1, stagger: 0.05, ease: "none",
        scrollTrigger: { trigger: ".highlight", start: "top 80%", end: "bottom 45%", scrub: true },
      });

      const expand = gsap.timeline({ scrollTrigger: { trigger: ".expand-wrap", start: "top top", end: "+=150%", scrub: 1, pin: true } });
      expand
        .fromTo(".expand", { clipPath: "inset(25% 32% 25% 32% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" })
        .fromTo(".expand img", { scale: 1.4 }, { scale: 1, ease: "none" }, 0)
        .fromTo(".expand-text", { opacity: 0, y: 60 }, { opacity: 1, y: 0 }, 0.55);

      const fan = gsap.timeline({ scrollTrigger: { trigger: ".fan-wrap", start: "top top", end: "+=120%", scrub: 1, pin: true } });
      fan
        .fromTo(".fan-left", { xPercent: 0, rotate: 0 }, { xPercent: -95, rotate: -10, ease: "power2.out" })
        .fromTo(".fan-right", { xPercent: 0, rotate: 0 }, { xPercent: 95, rotate: 10, ease: "power2.out" }, "<")
        .fromTo(".fan-mid", { scale: 0.9 }, { scale: 1.05, ease: "power2.out" }, "<")
        .fromTo(".fan-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, "<0.2");

      gsap.utils.toArray<HTMLElement>(".row").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });

      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, { scale: 0.9, filter: "brightness(0.5)", ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true } });
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 50, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
      });

      const cleanups: (() => void)[] = [];

      const heroEl = hero.current;
      const imgs = gsap.utils.toArray<HTMLImageElement>(".trail");
      let idx = 0;
      let last = { x: -999, y: -999 };
      const onTrail = (e: PointerEvent) => {
        if (!heroEl || Math.hypot(e.clientX - last.x, e.clientY - last.y) < 80) return;
        last = { x: e.clientX, y: e.clientY };
        const img = imgs[idx % imgs.length];
        idx++;
        const r = heroEl.getBoundingClientRect();
        gsap.killTweensOf(img);
        gsap.set(img, { x: e.clientX - r.left - 70, y: e.clientY - r.top - 90, scale: 0.5, opacity: 1, rotate: gsap.utils.random(-14, 14), zIndex: idx });
        gsap.to(img, { scale: 1, duration: 0.45, ease: "back.out(2)" });
        gsap.to(img, { opacity: 0, scale: 0.8, duration: 0.6, delay: 0.55, ease: "power2.in" });
      };
      heroEl?.addEventListener("pointermove", onTrail);
      cleanups.push(() => heroEl?.removeEventListener("pointermove", onTrail));

      const floater = root.current?.querySelector<HTMLElement>(".floater");
      const floaterImg = floater?.querySelector("img");
      if (floater && floaterImg) {
        const xTo = gsap.quickTo(floater, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(floater, "y", { duration: 0.5, ease: "power3" });
        const onMove = (e: PointerEvent) => { xTo(e.clientX - 130); yTo(e.clientY - 170); };
        window.addEventListener("pointermove", onMove);
        cleanups.push(() => window.removeEventListener("pointermove", onMove));
        gsap.utils.toArray<HTMLElement>(".row").forEach((row) => {
          const enter = () => {
            floaterImg.src = row.dataset.img || "";
            gsap.to(floater, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" });
          };
          const leave = () => gsap.to(floater, { opacity: 0, scale: 0.7, duration: 0.3 });
          row.addEventListener("pointerenter", enter);
          row.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            row.removeEventListener("pointerenter", enter);
            row.removeEventListener("pointerleave", leave);
          });
        });
      }

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root }
  );

  return (
    <SmoothScroll>
      <main ref={root} className="bg-black text-white overflow-x-clip selection:bg-[#D4F75C] selection:text-black">
        <div className="pre fixed inset-0 z-[100] flex items-end justify-between p-6 md:p-10 text-black" style={{ background: ACCENT }}>
          <span className={`${display.className} text-2xl`}>{BRAND}</span>
          <span className={`pre-count ${display.className} text-[28vw] md:text-[18vw] leading-[0.8]`}>0</span>
        </div>

        <div className="floater fixed top-0 left-0 z-40 w-[260px] h-[340px] rounded-3xl overflow-hidden pointer-events-none opacity-0 scale-75 hidden md:block">
          <img src="" alt="" className="w-full h-full object-cover grayscale" />
        </div>

        <header className="fixed top-0 inset-x-0 z-50">
          <div className="px-5 md:px-8 py-5 flex justify-between items-center">
            <span className={`${display.className} text-xl px-3 py-1 -rotate-2 text-black`} style={{ background: ACCENT }}>{BRAND}</span>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/download" className="hidden md:inline hover:text-[#D4F75C]">Get the app</Link>
              <Link href="/login" className="hidden md:inline hover:text-[#D4F75C]">Owner login</Link>
              <a href="#demo" className="px-4 py-2 bg-white text-black font-bold hover:bg-[#D4F75C] transition-colors">BOOK DEMO</a>
            </div>
          </div>
        </header>

        <section ref={hero} className="relative h-[100svh] flex flex-col justify-center overflow-hidden cursor-crosshair touch-pan-y">
          {TRAIL.map((id) => (
            <img key={id} src={px(id, 500)} alt="" className="trail absolute top-0 left-0 w-36 h-48 md:w-40 md:h-52 object-cover grayscale opacity-0 pointer-events-none rounded-lg" />
          ))}
          {[["SHOW UP.", "#fff"], ["LIFT HEAVY.", ACCENT], ["REPEAT.", "stroke"]].map(([t, c]) => (
            <p key={t} className={`hero-line hero-move ${display.className} relative z-[1] text-[17vw] leading-[0.86] whitespace-nowrap px-4 pointer-events-none`}
              style={c === "stroke" ? { color: "transparent", WebkitTextStroke: "2px #fff" } : { color: c }}>
              {t}
            </p>
          ))}
          <span className="sticker absolute top-[22%] right-[8%] z-[2] rotate-12 px-4 py-2 text-black font-black text-xs md:text-sm" style={{ background: ACCENT }}>
            MADE FOR INDIAN GYMS
          </span>
          <span className="sticker absolute bottom-[16%] left-[6%] z-[2] -rotate-6 px-4 py-2 bg-white text-black font-black text-xs md:text-sm">
            YOUR GYM. YOUR APP.
          </span>
          <div className="hero-fade absolute bottom-6 inset-x-5 md:inset-x-8 z-[2] flex justify-between items-end text-xs text-gray-400">
            <span className="max-w-[220px]">The member app and owner dashboard that keeps people coming back.</span>
            <span className="hidden md:inline">move your mouse ↗</span>
          </div>
        </section>

        <div className="py-6 border-y-2 border-white overflow-hidden" style={{ background: ACCENT }}>
          <div className={`marquee-track ${display.className} flex whitespace-nowrap text-black text-4xl md:text-6xl`}>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex">
                {["NO DAYS OFF", "STREAKS", "SMART PLANS", "QR CHECK-IN", "YOUR BRAND", "LET'S GO"].map((t) => (
                  <span key={t} className="px-6">{t} ●</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <section className="px-5 md:px-10 py-32 md:py-48">
          <p className={`highlight ${display.className} text-4xl md:text-7xl leading-[1.05] max-w-6xl`}>
            Half of new members quit in their first three months. Not because they don&apos;t care, but because nothing reminds them why they started. We fix that.
          </p>
        </section>

        <section className="expand-wrap relative h-screen overflow-hidden">
          <div className="expand absolute inset-0 overflow-hidden">
            <img src={px(20873830, 1800)} alt="" className="w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="expand-text absolute inset-0 flex items-center justify-center text-center px-6">
            <p className={`${display.className} text-5xl md:text-8xl leading-[0.9]`}>
              Your gym,<br /><span style={{ color: ACCENT }}>in their pocket.</span>
            </p>
          </div>
        </section>

        <section className="fan-wrap relative h-screen overflow-hidden flex flex-col items-center justify-center">
          <p className={`fan-title ${display.className} absolute top-[10%] text-center text-4xl md:text-6xl px-5`}>
            Members get an <span style={{ color: ACCENT }}>app.</span> You get <span style={{ color: ACCENT }}>control.</span>
          </p>
          <div className="relative mt-16 flex items-center justify-center">
            <Shell className="fan-left absolute"><ScreenCheckin /></Shell>
            <Shell className="fan-right absolute"><ScreenOwner /></Shell>
            <Shell className="fan-mid relative z-10"><ScreenHome /></Shell>
          </div>
        </section>

        <section className="px-5 md:px-10 py-24">
          <p className="text-sm text-gray-500 mb-6">What&apos;s inside</p>
          {ROWS.map((r, i) => (
            <div key={r.name} data-img={px(r.img, 600)}
              className="row group border-t border-white/15 py-8 md:py-12 grid md:grid-cols-[80px_1fr_1fr] gap-3 items-baseline cursor-default">
              <span className="text-sm text-gray-500">0{i + 1}</span>
              <span className={`${display.className} text-4xl md:text-7xl group-hover:text-[#D4F75C] group-hover:translate-x-3 transition-all duration-500`}>{r.name}</span>
              <span className="text-gray-400 md:text-lg md:text-right">{r.text}</span>
            </div>
          ))}
          <div className="border-t border-white/15" />
        </section>

        <section className="px-4 md:px-10 py-24">
          <p className={`${display.className} text-5xl md:text-8xl leading-[0.9] mb-16`}>WHAT YOU<br /><span style={{ color: ACCENT }}>GET.</span></p>
          {CARDS.map((c, i) => (
            <div key={c.title} className="stack-card sticky mb-6 h-[70vh] min-h-[440px] rounded-[2rem] overflow-hidden grid md:grid-cols-2"
              style={{ top: `calc(10vh + ${i * 18}px)`, background: c.bg, color: c.fg }}>
              <div className="p-8 md:p-12 flex flex-col justify-between">
                <span className="text-sm font-bold">0{i + 1}</span>
                <div>
                  <p className={`${display.className} text-5xl md:text-7xl leading-[0.9]`}>{c.title}</p>
                  <p className="mt-4 text-lg opacity-80 max-w-sm">{c.text}</p>
                </div>
              </div>
              <img src={px(c.img, 1000)} alt="" className="hidden md:block w-full h-full object-cover grayscale" />
            </div>
          ))}
        </section>

        <section className="px-5 md:px-10 py-24">
          <p className={`reveal ${display.className} text-5xl md:text-8xl leading-[0.9]`}>SIMPLE<br /><span style={{ color: ACCENT }}>PRICING.</span></p>
          <p className="reveal mt-4 text-gray-400">Per gym, per month. No setup fee.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[
              { name: "Starter", price: PRICES.starter, note: "Up to 150 members", items: ["Branded member app", "Members, plans and dues", "Expiry reminders", "Workout library"], hot: false },
              { name: "Pro", price: PRICES.pro, note: "Unlimited members", items: ["Everything in Starter", "QR + geofence check-in", "Smart workout plans", "Push notifications", "Insights dashboard"], hot: true },
              { name: "Chain", price: "Let's talk", note: "Multiple branches", items: ["Everything in Pro", "Multi-branch view", "Priority support", "Custom onboarding"], hot: false },
            ].map((p) => (
              <div key={p.name} className={`reveal p-8 rounded-[2rem] border-2 flex flex-col ${p.hot ? "text-black" : "border-white/20"}`}
                style={p.hot ? { background: ACCENT, borderColor: ACCENT } : {}}>
                <p className="font-bold">{p.name}{p.hot && <span className="ml-2 text-xs px-2 py-0.5 bg-black text-white">POPULAR</span>}</p>
                <p className={`${display.className} mt-4 text-5xl`}>{p.price}<span className="text-base opacity-60">{p.price.startsWith("₹") ? "/mo" : ""}</span></p>
                <p className={`mt-1 text-sm ${p.hot ? "opacity-70" : "text-gray-400"}`}>{p.note}</p>
                <div className="mt-6 grid gap-2.5 flex-1">
                  {p.items.map((it) => <p key={it} className="flex items-center gap-2 text-sm"><Check size={16} strokeWidth={3} /> {it}</p>)}
                </div>
                <a href="#demo" className={`mt-8 py-3.5 text-center font-bold ${p.hot ? "bg-black text-white" : "bg-white text-black"}`}>GET STARTED</a>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 md:px-10 py-24 max-w-4xl">
          <p className={`reveal ${display.className} text-5xl md:text-7xl`}>QUESTIONS<span style={{ color: ACCENT }}>?</span></p>
          <div className="mt-10">
            {FAQS.map((f, i) => (
              <div key={f.q} className="border-t border-white/15">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full py-6 flex justify-between items-center gap-4 text-left">
                  <span className="text-lg md:text-xl font-bold">{f.q}</span>
                  <span className="w-9 h-9 flex items-center justify-center shrink-0 text-black" style={{ background: ACCENT }}>
                    {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {openFaq === i && <p className="pb-6 text-gray-400 max-w-2xl">{f.a}</p>}
              </div>
            ))}
            <div className="border-t border-white/15" />
          </div>
        </section>

        <section id="demo" className="px-4 md:px-10 py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className={`reveal ${display.className} text-[15vw] md:text-[8vw] leading-[0.85]`}>BOOK A<br /><span style={{ color: ACCENT }}>DEMO.</span></p>
              <p className="reveal mt-6 text-gray-300 max-w-md">15 minutes. We set up your gym live and show you everything.</p>
              <div className="reveal mt-6 flex flex-wrap gap-3">
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-500 text-black font-bold">
                  WhatsApp us <ArrowUpRight size={16} />
                </a>
                <Link href="/download" className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-white font-bold hover:bg-white hover:text-black transition-colors">
                  <Download size={16} /> Get the app
                </Link>
              </div>
            </div>
            <div className="reveal"><LeadForm accent={ACCENT} /></div>
          </div>
        </section>

        <footer className="border-t-2 border-white">
          <div className="px-5 md:px-10 py-10 flex flex-wrap justify-between gap-4 text-sm text-gray-400">
            <span className={`${display.className} text-white text-lg`}>{BRAND}</span>
            <div className="flex gap-6">
              <Link href="/download" className="hover:text-white">Get the app</Link>
              <Link href="/login" className="hover:text-white">Owner login</Link>
              <a href={wa} className="hover:text-white">Contact</a>
            </div>
          </div>
          <p className={`${display.className} text-center text-[22vw] leading-[0.8] pb-2 select-none`} style={{ color: ACCENT }}>{BRAND}</p>
        </footer>
      </main>
    </SmoothScroll>
  );
}