"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Archivo_Black } from "next/font/google";
import { Icon } from "@iconify/react";
import { ArrowRight, ArrowUpRight, Check, Plus, Minus, Menu, X, Flame, Play } from "lucide-react";
import Photo from "./g/[slug]/home/Photo";
import LeadForm from "./_landing/LeadForm";

const BRAND = "GymPulse";
const ACCENT = "#D4F75C";
const WHATSAPP = "919999999999";
const PRICES = { starter: "₹999", pro: "₹1,999" };

const Dumbbell3D = dynamic(() => import("./_landing/Dumbbell3D"), { ssr: false, loading: () => <div className="w-full h-full" /> });
const display = Archivo_Black({ weight: "400", subsets: ["latin"] });

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")";

const FEATURES = [
  { icon: "material-symbols:qr-code-scanner", title: "QR + geofence check-in", text: "Members scan at the door. Location check stops fake check-ins from home.", big: true },
  { icon: "material-symbols:auto-awesome", title: "Smart workout plans", text: "Goal, level and muscle focus in, a full weekly routine out. Automatically." },
  { icon: "material-symbols:notifications-active", title: "Push notifications", text: "Offers, timings and reminders straight to the lock screen." },
  { icon: "material-symbols:palette", title: "Your brand, your app", text: "Your logo, colors and fonts. Members see your gym, not ours.", big: true },
  { icon: "material-symbols:event-repeat", title: "Auto expiry reminders", text: "7, 3 and 1 day before a plan ends. Renewals without chasing." },
  { icon: "material-symbols:play-circle", title: "Form videos", text: "One tap on any exercise and the how-to video plays." },
  { icon: "material-symbols:monitoring", title: "Attendance insights", text: "See who's slipping away and nudge them on WhatsApp." },
  { icon: "material-symbols:install-mobile", title: "No app store needed", text: "Share a link. Members install it in one tap." },
];

const REEL = [
  { img: "/images/legs.jpg?v=reel1", label: "LEG DAY" },
  { img: "/images/chest.jpg?v=reel2", label: "PUSH" },
  { img: "/images/back.jpg?v=reel3", label: "PULL" },
  { img: "/images/cardio.jpg?v=reel4", label: "CARDIO" },
  { img: "/images/arms.jpg?v=reel5", label: "ARMS" },
  { img: "/images/rest.jpg?v=reel6", label: "RECOVER" },
];

const FAQS = [
  { q: "Do my members need to download anything from the Play Store?", a: "No. You share a link, they open it and tap Install. It sits on their home screen with your gym's logo, just like an app." },
  { q: "Can I use my own logo and colors?", a: "Yes. You pick your logo, accent color, background and font. Every member sees your branding." },
  { q: "What if some members don't use smartphones?", a: "You can check them in manually from your dashboard. Their plan and expiry are still tracked." },
  { q: "Is my members' data safe?", a: "Each gym's data is kept separate, and passwords are encrypted so nobody, not even us, can read them." },
  { q: "How long does setup take?", a: "We create your gym and owner account for you. Most gyms add their first members the same day." },
];

function MagneticButton({ children, href, primary }: { children: React.ReactNode; href: string; primary?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  return (
    <motion.a ref={ref} href={href} style={{ x, y, ...(primary ? { background: ACCENT } : {}) }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={`inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm md:text-base ${primary ? "text-black" : "border border-white/20 text-white"}`}>
      {children}
    </motion.a>
  );
}

function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 150, damping: 15 });
  const ry = useSpring(0, { stiffness: 150, damping: 15 });
  return (
    <motion.div ref={ref} className={className} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 18);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 18);
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}>
      {children}
    </motion.div>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function PhoneMock() {
  return (
    <div className="w-[260px] h-[540px] rounded-[44px] border-[7px] border-zinc-800 bg-[#0B0B0B] p-4 overflow-hidden shadow-2xl shadow-black">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-black" style={{ background: ACCENT }}>IT</div>
        <span className="text-xs">Iron Tribe</span>
      </div>
      <p className="mt-6 text-[11px] text-gray-400">Hello, Rohan</p>
      <p className={`${display.className} text-2xl leading-none mt-1`}>Ready to crush<br /><span style={{ color: ACCENT }}>your goals?</span></p>
      <div className="mt-4 p-3 rounded-2xl flex justify-between items-center text-black" style={{ background: ACCENT }}>
        <div><p className="text-[10px]">Current streak</p><p className={`${display.className} text-2xl`}>12 days</p></div>
        <Flame size={30} fill="#000" />
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="py-1.5 rounded-lg text-center text-[10px]"
            style={i < 3 ? { background: ACCENT, color: "#000" } : i === 3 ? { border: `1.5px solid ${ACCENT}`, color: ACCENT } : { background: "#1B1B1B", color: "#777" }}>{d}</div>
        ))}
      </div>
      <div className="mt-3 relative h-36 rounded-2xl overflow-hidden">
        <Photo src="/images/legs.jpg?v=mock" className="absolute inset-0 w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] via-[#1B1B1B]/70 to-transparent" />
        <div className="relative p-3">
          <p className="text-[10px]" style={{ color: ACCENT }}>Thu · Smart plan</p>
          <p className={`${display.className} text-lg leading-none mt-1`}>Legs day</p>
          <div className="mt-6 inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full text-[10px] font-bold text-black" style={{ background: ACCENT }}>
            Start workout <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center"><Play size={8} fill={ACCENT} color={ACCENT} /></span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {["material-symbols:fitness-center", "material-symbols:monitor-weight", "material-symbols:sports-score", "material-symbols:headphones"].map((ic) => (
          <div key={ic} className="py-2.5 rounded-xl bg-[#1B1B1B] flex justify-center"><Icon icon={ic} width={18} color={ACCENT} /></div>
        ))}
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="w-full max-w-[460px] rounded-3xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl shadow-black">
      <div className="flex justify-between items-center">
        <p className={`${display.className} text-xl`}>Your <span style={{ color: ACCENT }}>crew</span></p>
        <span className="text-[10px] px-2.5 py-1 rounded-full text-black font-bold" style={{ background: ACCENT }}>Live</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[["In today", "38"], ["Expiring", "6"], ["This month", "₹1.2L"]].map(([l, v], i) => (
          <div key={l} className="p-3 rounded-2xl" style={i === 0 ? { background: ACCENT, color: "#000" } : { background: "#18181b" }}>
            <p className="text-[10px] opacity-70">{l}</p>
            <p className={`${display.className} text-xl`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-end gap-1 h-20 p-3 rounded-2xl bg-zinc-900">
        {[30, 45, 38, 60, 52, 70, 64, 80, 58, 72, 90, 76, 84, 95].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 13 ? ACCENT : "#3f3f46" }} />
        ))}
      </div>
      <div className="mt-3 grid gap-1.5">
        {[["Aarav", "Checked in 7:12 AM", true], ["Priya", "Plan ends in 3 days", false], ["Kabir", "Missing 9 days", false]].map(([n, s, ok]) => (
          <div key={n as string} className="px-3 py-2 rounded-xl bg-zinc-900 flex justify-between items-center text-xs">
            <span className="font-bold">{n as string}</span>
            <span style={{ color: ok ? ACCENT : "#fb923c" }}>{s as string}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-gray-600 text-center">Sample data</p>
    </div>
  );
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "35%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  const reelRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: reelProgress } = useScroll({ target: reelRef, offset: ["start start", "end end"] });
  const reelX = useTransform(reelProgress, [0, 1], ["5%", "-62%"]);

  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const glowX = useSpring(mx, { stiffness: 120, damping: 20 });
  const glowY = useSpring(my, { stiffness: 120, damping: 20 });

  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi! I want a demo of ${BRAND} for my gym.`)}`;
  const navLinks = [["Features", "#features"], ["How it works", "#how"], ["Pricing", "#pricing"], ["FAQ", "#faq"]];

  return (
    <main className="bg-[#070707] text-white overflow-x-clip selection:bg-lime-300 selection:text-black"
      onMouseMove={(e) => { mx.set(e.clientX - 200); my.set(e.clientY - 200); }}>

      <motion.div className="pointer-events-none fixed top-0 left-0 z-0 w-[400px] h-[400px] rounded-full hidden md:block"
        style={{ x: glowX, y: glowY, background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 65%)` }} />
      <div className="pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />

      <header className="fixed top-0 inset-x-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-black" style={{ background: ACCENT }}>
              <Icon icon="mdi:weight-lifter" width={22} />
            </span>
            <span className={`${display.className} text-lg`}>{BRAND}</span>
          </a>
          <nav className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            {navLinks.map(([l, h]) => (
              <a key={l} href={h} className="px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/10 transition">{l}</a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white">Owner login</Link>
            <a href="#demo" className="px-5 py-2.5 rounded-full text-sm font-bold text-black" style={{ background: ACCENT }}>Book a demo</a>
          </div>
          <button onClick={() => setMenu(true)} className="md:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" aria-label="Menu">
            <Menu size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/95 p-6 flex flex-col">
            <button onClick={() => setMenu(false)} className="self-end w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" aria-label="Close"><X size={18} /></button>
            <div className="mt-10 grid gap-6">
              {[...navLinks, ["Owner login", "/login"]].map(([l, h], i) => (
                <motion.a key={l} href={h} onClick={() => setMenu(false)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className={`${display.className} text-4xl`}>{l}</motion.a>
              ))}
            </div>
            <a href="#demo" onClick={() => setMenu(false)} className="mt-auto py-4 rounded-full text-center font-bold text-black" style={{ background: ACCENT }}>Book a demo</a>
          </motion.div>
        )}
      </AnimatePresence>

      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0">
          <video className="w-full h-full object-cover grayscale opacity-30" autoPlay muted loop playsInline
            poster="https://images.pexels.com/photos/9152548/pexels-photo-9152548.jpeg?auto=compress&cs=tinysrgb&w=1600">
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#070707] via-[#070707]/60 to-[#070707]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-5 w-full grid lg:grid-cols-2 items-center gap-6">
          <div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ACCENT }} /> Built for gyms in India
            </motion.p>
            <h1 className={`${display.className} mt-6 text-[13vw] lg:text-[6.2rem] leading-[0.9] tracking-tight`}>
              {["Your gym.", "Your app."].map((line, i) => (
                <motion.span key={line} className="block" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>{line}</motion.span>
              ))}
              <motion.span className="block italic" style={{ color: ACCENT }} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>Zero code.</motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="mt-6 max-w-md text-gray-400 text-lg">
              Give every member a branded fitness app with smart workout plans, QR check-in and streaks. Run your gym from one dashboard.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="#demo" primary>Book a free demo <ArrowRight size={18} /></MagneticButton>
              <MagneticButton href="#features">See features</MagneticButton>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1 }}
            className="relative h-[46vh] lg:h-[70vh] cursor-grab active:cursor-grabbing">
            <div className="absolute inset-[15%] rounded-full blur-3xl opacity-30" style={{ background: ACCENT }} />
            <Dumbbell3D accent={ACCENT} />
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-gray-500 whitespace-nowrap">Drag to spin it ↻</p>
          </motion.div>
        </motion.div>
      </section>

      <div className="relative z-10 -rotate-2 py-5 overflow-hidden text-black" style={{ background: ACCENT }}>
        <motion.div className={`${display.className} flex whitespace-nowrap text-3xl md:text-5xl`}
          animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 18, ease: "linear" }}>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex">
              {["NO DAYS OFF", "STRONGER EVERY DAY", "SHOW UP", "LIFT", "REPEAT", "YOUR GYM IN THEIR POCKET"].map((t) => (
                <span key={t} className="px-6 flex items-center gap-6">{t} <span>✦</span></span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>

      <section className="relative z-10 max-w-7xl mx-auto px-5 py-28 md:py-36">
        <Reveal>
          <h2 className={`${display.className} text-5xl md:text-7xl leading-[0.95] max-w-4xl`}>
            Members get an <span className="italic" style={{ color: ACCENT }}>app.</span><br />You get a <span className="italic" style={{ color: ACCENT }}>control room.</span>
          </h2>
        </Reveal>
        <div className="mt-16 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal className="flex flex-col items-center">
            <Tilt><PhoneMock /></Tilt>
            <p className="mt-6 text-gray-400 text-center max-w-sm">Streaks, smart plans, form videos and one-tap check-in. In your colors.</p>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col items-center">
            <Tilt className="w-full flex justify-center"><DashboardMock /></Tilt>
            <p className="mt-6 text-gray-400 text-center max-w-sm">Who&apos;s in today, who&apos;s expiring, who&apos;s slipping away. One glance.</p>
          </Reveal>
        </div>
      </section>

      <section ref={reelRef} className="relative z-10 h-[300vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <p className="px-5 max-w-7xl mx-auto w-full text-sm text-gray-500 mb-6">Every day has a plan ↓</p>
          <motion.div style={{ x: reelX }} className="flex gap-5 pl-5">
            {REEL.map((r, i) => (
              <div key={r.label} className="group relative shrink-0 w-[72vw] md:w-[38vw] h-[60vh] rounded-[2rem] overflow-hidden">
                <Photo src={r.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-5 left-5 text-xs px-3 py-1 rounded-full bg-black/60 backdrop-blur">0{i + 1}</span>
                <p className={`${display.className} absolute bottom-5 left-6 text-5xl md:text-7xl`} style={{ color: i % 2 ? "#fff" : ACCENT }}>{r.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-7xl mx-auto px-5 py-28">
        <Reveal>
          <p className="text-sm" style={{ color: ACCENT }}>Features</p>
          <h2 className={`${display.className} mt-3 text-5xl md:text-7xl leading-[0.95]`}>Everything a<br />modern gym <span className="italic" style={{ color: ACCENT }}>needs.</span></h2>
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.08} className={f.big ? "lg:col-span-2" : ""}>
              <motion.div whileHover={{ y: -6 }} className="group h-full p-7 rounded-[2rem] bg-zinc-900/80 border border-white/5 hover:border-white/20 transition relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition" style={{ background: ACCENT }} />
                <span className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-black" style={{ background: ACCENT }}>
                  <Icon icon={f.icon} width={30} />
                </span>
                <p className={`${display.className} relative mt-8 text-2xl leading-tight`}>{f.title}</p>
                <p className="relative mt-3 text-gray-400">{f.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 max-w-7xl mx-auto px-5 py-28">
        <Reveal>
          <h2 className={`${display.className} text-5xl md:text-7xl leading-[0.95]`}>Live in <span className="italic" style={{ color: ACCENT }}>3 steps.</span></h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {[
            ["We set up your gym", "Your logo, colors and owner login, ready the same day."],
            ["Add your members", "Plans, expiry and login details shared on WhatsApp in one tap."],
            ["They show up more", "Smart plans, streaks and reminders keep them coming back."],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.12}>
              <div className="relative p-8 rounded-[2rem] bg-zinc-900/80 border border-white/5 h-full">
                <p className={`${display.className} text-8xl leading-none opacity-10`}>0{i + 1}</p>
                <p className={`${display.className} -mt-8 text-2xl`}>{t}</p>
                <p className="mt-3 text-gray-400">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-5 py-28">
        <Reveal>
          <h2 className={`${display.className} text-5xl md:text-7xl leading-[0.95]`}>Simple <span className="italic" style={{ color: ACCENT }}>pricing.</span></h2>
          <p className="mt-4 text-gray-400">Per gym, per month. No setup fee.</p>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-4 items-stretch">
          {[
            { name: "Starter", price: PRICES.starter, note: "Up to 150 members", items: ["Branded member app", "Members & plans", "Expiry reminders", "Workout library"], hot: false },
            { name: "Pro", price: PRICES.pro, note: "Unlimited members", items: ["Everything in Starter", "QR + geofence check-in", "Smart workout plans", "Push notifications", "Attendance insights"], hot: true },
            { name: "Chain", price: "Let's talk", note: "Multiple branches", items: ["Everything in Pro", "Multi-branch dashboard", "Priority support", "Custom onboarding"], hot: false },
          ].map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <motion.div whileHover={{ y: -8 }} className={`relative h-full p-8 rounded-[2rem] border flex flex-col ${p.hot ? "text-black" : "bg-zinc-900/80 border-white/5"}`}
                style={p.hot ? { background: ACCENT, borderColor: ACCENT } : {}}>
                {p.hot && <span className="absolute top-6 right-6 text-xs px-3 py-1 rounded-full bg-black text-white">Most popular</span>}
                <p className="text-lg">{p.name}</p>
                <p className={`${display.className} mt-4 text-5xl`}>{p.price}<span className="text-base opacity-60">{p.price.startsWith("₹") ? "/mo" : ""}</span></p>
                <p className={`mt-1 text-sm ${p.hot ? "opacity-70" : "text-gray-400"}`}>{p.note}</p>
                <div className="mt-6 grid gap-3 flex-1">
                  {p.items.map((it) => (
                    <p key={it} className="flex items-center gap-2 text-sm"><Check size={16} strokeWidth={3} /> {it}</p>
                  ))}
                </div>
                <a href="#demo" className={`mt-8 py-3.5 rounded-full text-center font-bold ${p.hot ? "bg-black text-white" : "text-black"}`}
                  style={p.hot ? {} : { background: ACCENT }}>Get started</a>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-5 py-28">
        <Reveal>
          <h2 className={`${display.className} text-5xl md:text-6xl leading-[0.95]`}>Questions<span style={{ color: ACCENT }}>?</span></h2>
        </Reveal>
        <div className="mt-10 grid gap-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <div className="rounded-3xl bg-zinc-900/80 border border-white/5 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 flex justify-between items-center gap-4 text-left">
                  <span className="font-bold">{f.q}</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-black" style={{ background: ACCENT }}>
                    {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-gray-400">{f.a}</motion.p>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="demo" className="relative z-10 max-w-7xl mx-auto px-5 py-28">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-16 border border-white/10">
          <Photo src="/images/hero.jpg" className="absolute inset-0 w-full h-full object-cover grayscale opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <h2 className={`${display.className} text-5xl md:text-7xl leading-[0.95]`}>Ready to<br /><span className="italic" style={{ color: ACCENT }}>level up</span><br />your gym?</h2>
              <p className="mt-5 text-gray-300 max-w-md">Book a free 15-minute demo. We&apos;ll set up your gym live and show you everything.</p>
              <a href={wa} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-green-500 text-black font-bold">
                <Icon icon="mdi:whatsapp" width={22} /> Chat on WhatsApp <ArrowUpRight size={16} />
              </a>
            </Reveal>
            <Reveal delay={0.15}><LeadForm accent={ACCENT} /></Reveal>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-12 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-black" style={{ background: ACCENT }}>
              <Icon icon="mdi:weight-lifter" width={22} />
            </span>
            <span className={`${display.className} text-lg`}>{BRAND}</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-400">
            {navLinks.map(([l, h]) => <a key={l} href={h} className="hover:text-white">{l}</a>)}
            <Link href="/login" className="hover:text-white">Owner login</Link>
          </div>
        </div>
        <p className={`${display.className} text-center text-[18vw] leading-none opacity-[0.04] select-none pb-4`}>{BRAND}</p>
      </footer>
    </main>
  );
}