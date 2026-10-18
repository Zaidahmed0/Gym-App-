"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Archivo_Black } from "next/font/google";
import {
  Flame, Play, MapPin, Check, Plus, Minus, ArrowUpRight, Download, Users, Wallet, Briefcase, QrCode,
  TrendingUp, Megaphone, Bell, Palette, Dumbbell, Sparkles, Timer, PartyPopper, Music, Droplet,
  Smartphone, HeartPulse, CalendarClock, Mail, MessageCircle, Target, IndianRupee, Repeat,
} from "lucide-react";
import SmoothScroll from "./v/SmoothScroll";
import LeadForm from "./_landing/LeadForm";
import { GetAppLink, FloatingGetApp } from "./_landing/GetApp";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const BRAND = "Gainzo";
const WHATSAPP = "917043015761";
const EMAIL = "Zaidbro555@gmail.com";
const SITE = "https://getgainzo.vercel.app";
const ACCENT = "#D4F75C";
const FOOTER_VIDEO = "/videos/gym.mp4";

const display = Archivo_Black({ weight: "400", subsets: ["latin"] });
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
  { title: "SMART PLANS", text: "Goal, level and muscle focus in. A full weekly routine out. Every member, automatically.", quote: "The bar doesn't care about your excuses.", bg: ACCENT, fg: "#000", img: 5327530 },
  { title: "SCAN TO CHECK IN", text: "QR at the door plus a location check. No cheating from the couch.", quote: "Showing up is the first rep.", bg: "#161616", fg: "#fff", img: 9152548 },
  { title: "NO MORE CHASING", text: "Reminders go out before every plan ends. Dues tracked. Renewals on autopilot.", quote: "Consistency beats motivation. Every single time.", bg: "#ffffff", fg: "#000", img: 13896072 },
  { title: "YOUR BRAND", text: "Your logo, colors and fonts. Members see your gym on their home screen.", quote: "Same gym. Whole new level.", bg: "#161616", fg: "#fff", img: 17210042 },
];

const OWNER_FEATURES = [
  { Icon: Users, title: "Members & plans", text: "Add members in seconds, 1/3/6/12 month plans, renewals, pause or deactivate." },
  { Icon: Wallet, title: "Payments & dues", text: "Full fee, part payments, Cash/UPI/Card. Every pending rupee tracked." },
  { Icon: Briefcase, title: "Services", text: "Sell personal training, diet plans, lockers. Track who has what till when." },
  { Icon: QrCode, title: "QR + geofence attendance", text: "Print a QR poster. Members scan at the door. Location stops fake check-ins." },
  { Icon: TrendingUp, title: "Insights dashboard", text: "Today's footfall, busy hours, collections, dues, birthdays. One screen." },
  { Icon: Megaphone, title: "Announcements", text: "Offers, timings, events with photos. Popup, pinned banner or push." },
  { Icon: CalendarClock, title: "Auto expiry reminders", text: "7, 3 and 1 day before plans end. Every morning, without you lifting a finger." },
  { Icon: Palette, title: "Your own branding", text: "Logo, colors, fonts, welcome message. It's your gym's app, not ours." },
  { Icon: Dumbbell, title: "Workout builder", text: "60+ exercises with form videos. Build plans by day and assign in one tap." },
  { Icon: HeartPulse, title: "Member profiles", text: "Emergency contacts, blood group, injuries, notes. Safety first." },
];

const MEMBER_FEATURES = [
  { Icon: Sparkles, title: "Smart plan in 60 seconds", text: "Goal, age, muscle map, level, days. A full weekly routine, built for them." },
  { Icon: Timer, title: "Workout mode", text: "Set counter, rest timer, form video on one tap, trophy at the end." },
  { Icon: Flame, title: "Streaks & levels", text: "Every visit counts. Nobody wants to break a 21-day streak." },
  { Icon: Target, title: "Goals & progress", text: "Weight trend, BMI, weekly charts. Progress they can actually see." },
  { Icon: PartyPopper, title: "Check-in moment", text: "Scan the QR, get a welcome screen with confetti and a fresh quote." },
  { Icon: Bell, title: "Push notifications", text: "Gym updates and reminders on the lock screen, like any big app." },
  { Icon: Music, title: "Workout music", text: "Their Spotify playlists, switchable inside the app." },
  { Icon: Droplet, title: "Water tracker", text: "Small daily wins that keep them opening the app." },
  { Icon: Smartphone, title: "Installs like an app", text: "Android download or iPhone home screen. No app store needed." },
];

const MONEY = [
  { Icon: Repeat, title: "Members stay longer", text: "Streaks, smart plans and nudges give people a reason to show up again tomorrow." },
  { Icon: CalendarClock, title: "Renewals before expiry", text: "Reminders go out on their own, so plans get renewed before they lapse." },
  { Icon: IndianRupee, title: "Dues don't slip away", text: "See every pending amount and send a polite WhatsApp reminder in one tap." },
  { Icon: Users, title: "Win back the quiet ones", text: "Spot members missing for 7+ days before they quietly cancel." },
  { Icon: Briefcase, title: "Sell more services", text: "PT, diet plans and lockers tracked properly means more add-on revenue." },
  { Icon: Palette, title: "Look premium", text: "A branded app makes a local gym feel like a big brand. Members notice." },
];

const FAQS = [
  { q: "Is it really free?", a: "Yes. It's free for our early partner gyms while we build it with you. If we ever add paid plans, we'll tell you well in advance and you decide." },
  { q: "Do members need the Play Store?", a: "No. Android members get a direct download link, iPhone members add it to their home screen in two taps." },
  { q: "Can I use my own logo and colors?", a: "Yes. Logo, accent color, background and font. Every member sees your branding." },
  { q: "What about members without smartphones?", a: "Check them in manually from your dashboard. Their plan, dues and expiry are still tracked." },
  { q: "Is member data safe?", a: "Each gym's data is kept separate, and passwords are encrypted so nobody, not even us, can read them." },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND,
  applicationCategory: "HealthApplication",
  operatingSystem: "Android, iOS, Web",
  description: "Gym management software and branded member app for Indian gyms: members, dues, QR attendance, smart workout plans, streaks and push notifications.",
  url: SITE,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

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
      <p className="text-[10px] text-gray-400">Hello, Zayd</p>
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
      <p className={`${display.className} text-2xl leading-none mt-1`}>Welcome back,<br /><span style={{ color: ACCENT }}>Zayd!</span></p>
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

function FeatureList({ items }: { items: { Icon: React.ComponentType<{ size?: number }>; title: string; text: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map(({ Icon, title, text }) => (
        <div key={title} className="group p-5 rounded-3xl bg-zinc-900 border border-white/5 hover:border-[#D4F75C]/60 transition-colors">
          <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-black group-hover:rotate-6 transition-transform" style={{ background: ACCENT }}>
            <Icon size={20} />
          </span>
          <p className="mt-4 font-black text-lg">{title}</p>
          <p className="mt-1 text-sm text-gray-400">{text}</p>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tab, setTab] = useState<"owner" | "member">("owner");
  const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  const waDemo = wa(`Hi! I want free access to ${BRAND} for my gym.`);

  useGSAP(
    () => {
      const counter = { v: 0 };
      const countEl = root.current?.querySelector(".pre-count");
      const title = SplitText.create(".hero-line", { type: "chars", mask: "chars" });

      gsap.timeline()
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

      gsap.timeline({ scrollTrigger: { trigger: ".expand-wrap", start: "top top", end: "+=150%", scrub: 1, pin: true } })
        .fromTo(".expand", { clipPath: "inset(25% 32% 25% 32% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" })
        .fromTo(".expand img", { scale: 1.4 }, { scale: 1, ease: "none" }, 0)
        .fromTo(".expand-text", { opacity: 0, y: 60 }, { opacity: 1, y: 0 }, 0.55);

      gsap.timeline({ scrollTrigger: { trigger: ".fan-wrap", start: "top top", end: "+=120%", scrub: 1, pin: true } })
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

      ScrollTrigger.batch(".money", {
        start: "top 88%",
        onEnter: (els) => gsap.from(els, { opacity: 0, y: 40, scale: 0.95, stagger: 0.08, duration: 0.8, ease: "expo.out" }),
        once: true,
      });

      gsap.from(".footer-brand", {
        yPercent: 30,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".footer-brand", start: "top 95%" },
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
        let current: string | null = null;
        const show = (src: string) => {
          if (current !== src) floaterImg.src = src;
          current = src;
          gsap.to(floater, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
        };
        const hide = () => {
          if (!current) return;
          current = null;
          gsap.to(floater, { opacity: 0, scale: 0.7, duration: 0.25, overwrite: "auto" });
        };
        const onMove = (e: PointerEvent) => {
          xTo(e.clientX - 130);
          yTo(e.clientY - 170);
          const row = (e.target as Element | null)?.closest?.(".row") as HTMLElement | null;
          if (row?.dataset.img) show(row.dataset.img);
          else hide();
        };
        const onScroll = () => hide();
        window.addEventListener("pointermove", onMove);
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("scroll", onScroll);
        });
      }

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root }
  );

  return (
    <SmoothScroll>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <main ref={root} className="bg-black text-white overflow-x-clip selection:bg-[#D4F75C] selection:text-black">
        <div className="pre fixed inset-0 z-[100] flex items-end justify-between p-6 md:p-10 text-black" style={{ background: ACCENT }}>
          <span className={`${display.className} text-2xl`}>{BRAND}</span>
          <span className={`pre-count ${display.className} text-[28vw] md:text-[18vw] leading-[0.8]`}>0</span>
        </div>

        <div className="floater fixed top-0 left-0 z-40 w-[260px] h-[340px] rounded-3xl overflow-hidden pointer-events-none opacity-0 scale-75 hidden md:block">
          <img alt="" className="w-full h-full object-cover grayscale" />
        </div>

        <header className="fixed top-0 inset-x-0 z-50">
          <div className="px-5 md:px-8 py-5 flex justify-between items-center">
            <a href="#top" className={`${display.className} text-xl px-3 py-1 -rotate-2 text-black`} style={{ background: ACCENT }}>{BRAND}</a>
            <nav className="flex items-center gap-3 text-sm">
              <a href="#features" className="hidden md:inline hover:text-[#D4F75C]">Features</a>
              <GetAppLink className="hover:text-[#D4F75C] font-bold">GET APP</GetAppLink>
              <Link href="/login" className="hidden md:inline hover:text-[#D4F75C]">Owner login</Link>
              <a href="#free" className="px-4 py-2 bg-white text-black font-bold hover:bg-[#D4F75C] transition-colors">GET IT FREE</a>
            </nav>
          </div>
        </header>

        <section id="top" ref={hero} className="relative h-[100svh] flex flex-col justify-center overflow-hidden cursor-crosshair touch-pan-y">
          <h1 className="sr-only">{BRAND}: gym management software and branded member app for Indian gyms</h1>
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
          <a href="#free" className="sticker absolute bottom-[16%] left-[6%] z-[2] -rotate-6 px-4 py-2 bg-white text-black font-black text-xs md:text-sm hover:bg-[#D4F75C] transition-colors">
            FREE EARLY ACCESS →
          </a>
          <div className="hero-fade absolute bottom-6 inset-x-5 md:inset-x-8 z-[2] flex justify-between items-end text-xs text-gray-400">
            <span className="max-w-[240px]">Gym management software + a branded member app that keeps people coming back.</span>
            <span className="hidden md:inline">move your mouse ↗</span>
          </div>
        </section>

        <div className="py-6 border-y-2 border-white overflow-hidden" style={{ background: ACCENT }}>
          <div className={`marquee-track ${display.className} flex whitespace-nowrap text-black text-4xl md:text-6xl`}>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex">
                {["NO DAYS OFF", "STREAKS", "SMART PLANS", "QR CHECK-IN", "YOUR BRAND", "FREE NOW"].map((t) => (
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

        <section id="features" className="scroll-mt-24 px-5 md:px-10 py-24">
          <p className={`reveal ${display.className} text-5xl md:text-8xl leading-[0.9]`}>EVERYTHING<br /><span style={{ color: ACCENT }}>INSIDE.</span></p>
          <p className="reveal mt-4 text-gray-400 max-w-xl">Not a demo. Not &ldquo;coming soon&rdquo;. All of this is live today.</p>
          <div className="reveal mt-10 inline-flex p-1 border-2 border-white">
            {(["owner", "member"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className="px-5 py-2.5 font-bold text-sm transition-colors"
                style={tab === t ? { background: ACCENT, color: "#000" } : {}}>
                {t === "owner" ? "FOR GYM OWNERS" : "FOR MEMBERS"}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <FeatureList items={tab === "owner" ? OWNER_FEATURES : MEMBER_FEATURES} />
          </div>
        </section>

        <section className="px-4 md:px-10 py-24">
          <p className={`${display.className} text-5xl md:text-8xl leading-[0.9] mb-16`}>WHAT YOU<br /><span style={{ color: ACCENT }}>GET.</span></p>
          {CARDS.map((c, i) => (
            <div key={c.title} className="stack-card sticky mb-6 h-[70vh] min-h-[440px] rounded-[2rem] overflow-hidden grid md:grid-cols-2"
              style={{ top: `calc(10vh + ${i * 18}px)`, background: c.bg, color: c.fg }}>
              <div className="p-8 md:p-12 flex flex-col justify-between gap-6">
                <span className="text-sm font-bold">0{i + 1}</span>
                <p className={`${display.className} text-3xl md:text-5xl leading-[1.05] max-w-md`}>
                  <span className="opacity-30">&ldquo;</span>{c.quote}<span className="opacity-30">&rdquo;</span>
                </p>
                <div>
                  <p className={`${display.className} text-3xl md:text-4xl leading-none`}>{c.title}</p>
                  <p className="mt-3 opacity-80 max-w-sm">{c.text}</p>
                </div>
              </div>
              <img src={px(c.img, 1000)} alt="" className="hidden md:block w-full h-full object-cover grayscale" />
            </div>
          ))}
        </section>

        <section className="px-5 md:px-10 py-24">
          <p className={`reveal ${display.className} text-5xl md:text-8xl leading-[0.9]`}>HOW IT<br /><span style={{ color: ACCENT }}>PAYS YOU.</span></p>
          <p className="reveal mt-4 text-gray-400 max-w-xl">Every feature is built around one thing: more members staying, paying and renewing.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {MONEY.map(({ Icon, title, text }, i) => (
              <div key={title} className="money p-7 rounded-[2rem] border-2"
                style={i === 0 ? { background: ACCENT, color: "#000", borderColor: ACCENT } : { borderColor: "rgba(255,255,255,0.15)" }}>
                <Icon size={28} />
                <p className={`${display.className} mt-6 text-2xl leading-tight`}>{title}</p>
                <p className={`mt-2 ${i === 0 ? "opacity-80" : "text-gray-400"}`}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="free" className="scroll-mt-24 px-4 md:px-10 py-24">
          <div className="reveal relative rounded-[2.5rem] overflow-hidden p-8 md:p-16 text-black" style={{ background: ACCENT }}>
            <p className="text-sm font-black">EARLY ACCESS</p>
            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
              <p className={`${display.className} text-[28vw] md:text-[14vw] leading-[0.8]`}>₹0</p>
              <p className={`${display.className} text-3xl md:text-5xl leading-none pb-3`}>FOR NOW.<br />EVERYTHING.</p>
            </div>
            <p className="mt-6 text-lg max-w-2xl">
              We&apos;re building {BRAND} with our first partner gyms. You get every feature free, we get your honest feedback. Fair deal?
            </p>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-3xl">
              {["Unlimited members", "Branded member app", "QR + geofence check-in", "Smart workout plans", "Payments & dues", "Push notifications"].map((x) => (
                <p key={x} className="flex items-center gap-2 font-bold"><Check size={18} strokeWidth={3} /> {x}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={waDemo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-7 py-4 bg-black text-white font-black hover:scale-[1.03] transition-transform">
                <MessageCircle size={18} /> CLAIM FREE ACCESS ON WHATSAPP
              </a>
              <a href="#demo" className="inline-flex items-center gap-2 px-7 py-4 border-2 border-black font-black hover:bg-black hover:text-white transition-colors">BOOK A DEMO</a>
            </div>
          </div>
        </section>

        <section className="px-5 md:px-10 py-24 max-w-4xl">
          <p className={`reveal ${display.className} text-5xl md:text-7xl`}>QUESTIONS<span style={{ color: ACCENT }}>?</span></p>
          <div className="mt-10">
            {FAQS.map((f, i) => (
              <div key={f.q} className="border-t border-white/15">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full py-6 flex justify-between items-center gap-4 text-left">
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

        <section id="demo" className="scroll-mt-24 px-4 md:px-10 py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className={`reveal ${display.className} text-[15vw] md:text-[8vw] leading-[0.85]`}>LET&apos;S<br /><span style={{ color: ACCENT }}>TALK.</span></p>
              <p className="reveal mt-6 text-gray-300 max-w-md">
                Want to know more? Message us on WhatsApp and we&apos;ll set up your gym live, or leave your number and we&apos;ll call you.
              </p>
              <div className="reveal mt-6 flex flex-wrap gap-3">
                <a href={wa(`Hi! I'd like to know more about ${BRAND}.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-500 text-black font-bold hover:bg-green-400 transition-colors">
                  WhatsApp us <ArrowUpRight size={16} />
                </a>
                <GetAppLink className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-white font-bold hover:bg-white hover:text-black transition-colors">
                  <Download size={16} /> Get the app
                </GetAppLink>
              </div>
            </div>
            <div className="reveal"><LeadForm accent={ACCENT} /></div>
          </div>
        </section>

        <section className="px-4 md:px-10 pb-24">
          <div className="reveal p-8 md:p-12 border-2 border-white grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className={`${display.className} text-3xl md:text-5xl leading-none`}>GOT AN <span style={{ color: ACCENT }}>IDEA?</span></p>
              <p className="mt-3 text-gray-400 max-w-xl">A feature you wish existed? Something that annoyed you? We build what gym owners and members ask for. Tell us.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={wa(`Hi ${BRAND} team! I have a suggestion: `)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black font-bold hover:bg-[#D4F75C] transition-colors">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Suggestion for ${BRAND}`)}`} className="inline-flex items-center gap-2 px-5 py-3 border-2 border-white font-bold hover:bg-white hover:text-black transition-colors">
                <Mail size={16} /> Email
              </a>
            </div>
          </div>
        </section>

        <footer className="border-t-2 border-white">
          <div className="px-5 md:px-10 py-10 flex flex-wrap justify-between gap-4 text-sm text-gray-400">
            <span className={`${display.className} text-white text-lg`}>{BRAND}</span>
            <div className="flex flex-wrap gap-6">
              <a href="#features" className="hover:text-white">Features</a>
              <GetAppLink className="hover:text-white">Get the app</GetAppLink>
              <Link href="/login" className="hover:text-white">Owner login</Link>
              <a href={wa(`Hi ${BRAND} team!`)} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
              <a href={`mailto:${EMAIL}`} className="hover:text-white">{EMAIL}</a>
            </div>
          </div>

          <div className="footer-brand relative isolate overflow-hidden select-none" aria-label={BRAND}>
            <video
              className="absolute inset-0 w-full h-full object-cover grayscale contrast-125"
              src={FOOTER_VIDEO}
              poster={px(20873830, 1600)}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
            <div className="absolute inset-0 mix-blend-multiply" style={{ background: ACCENT }} />
            <p className={`${display.className} relative bg-black text-white mix-blend-multiply text-center text-[23vw] leading-[0.85] pt-[1vw] pb-[3vw]`}>
              {BRAND}
            </p>
          </div>

          <p className="px-5 md:px-10 pt-6 pb-28 text-xs text-gray-600 flex flex-wrap justify-between gap-2">
            <span>© 2026 {BRAND}. Made for Indian gyms.</span>
            <a href="#top" className="hover:text-white">Back to top ↑</a>
          </p>
        </footer>

        <FloatingGetApp />
      </main>
    </SmoothScroll>
  );
}