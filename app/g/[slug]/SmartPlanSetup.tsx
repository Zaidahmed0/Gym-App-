"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Model from "react-body-highlighter";
import { X, ArrowRight, ArrowLeft, Sparkles, CalendarDays, QrCode, Flame, RotateCcw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BACKGROUNDS, textOn, formatDate } from "@/utils/theme";
import Photo from "./home/Photo";
import { generateSmartPlan } from "./actions";

const BodyModel = Model as unknown as React.ComponentType<Record<string, unknown>>;

type Goal = "lose" | "gain" | "maintain";
type Level = "beginner" | "intermediate" | "advanced";
type Side = "anterior" | "posterior";

const GOALS: { key: Goal; title: string; sub: string; icon: string }[] = [
  { key: "lose", title: "Lose fat", sub: "Burn calories, get lean, more cardio", icon: "material-symbols:local-fire-department" },
  { key: "gain", title: "Build muscle", sub: "Get bigger and stronger, heavier lifts", icon: "mdi:arm-flex" },
  { key: "maintain", title: "Stay fit", sub: "Balanced strength and fitness", icon: "material-symbols:bolt" },
];

const LEVELS: { key: Level; title: string; sub: string }[] = [
  { key: "beginner", title: "Beginner", sub: "New to the gym or coming back after a break" },
  { key: "intermediate", title: "Intermediate", sub: "Training regularly for 6+ months" },
  { key: "advanced", title: "Advanced", sub: "Training seriously for 2+ years" },
];

const DAYS = [
  { n: 3, label: "3 days", sub: "Full body" },
  { n: 4, label: "4 days", sub: "Upper / Lower" },
  { n: 5, label: "5 days", sub: "Push / Pull / Legs +" },
  { n: 6, label: "6 days", sub: "Push / Pull / Legs × 2" },
];

const GENDERS = [
  { key: "male", label: "Male", icon: "material-symbols:male" },
  { key: "female", label: "Female", icon: "material-symbols:female" },
  { key: "other", label: "Prefer not to say", icon: "material-symbols:help-outline" },
];

const MUSCLES: Record<Side, [string, string][]> = {
  anterior: [
    ["chest", "Chest"], ["front-deltoids", "Shoulders"], ["biceps", "Biceps"], ["abs", "Abs"],
    ["obliques", "Obliques"], ["quadriceps", "Quads"], ["forearm", "Forearms"], ["calves", "Calves"],
  ],
  posterior: [
    ["trapezius", "Traps"], ["upper-back", "Upper back"], ["lower-back", "Lower back"], ["back-deltoids", "Rear delts"],
    ["triceps", "Triceps"], ["gluteal", "Glutes"], ["hamstring", "Hamstrings"], ["calves", "Calves"],
  ],
};

const CARDS = [
  { label: "Strength", img: "/images/chest.jpg?v=card1" },
  { label: "Cardio", img: "/images/cardio.jpg?v=card2" },
  { label: "Mobility", img: "/images/core.jpg?v=card3" },
];

const YEARS = Array.from({ length: 2012 - 1950 + 1 }, (_, i) => 1950 + i);
const ITEM_H = 48;

function YearWheel({ value, onChange, accent, card }: { value: number; onChange: (y: number) => void; accent: string; card: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = YEARS.indexOf(value);
    if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H;
  }, []);

  function onScroll() {
    if (!ref.current) return;
    const idx = Math.max(0, Math.min(YEARS.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
    if (YEARS[idx] !== value) {
      onChange(YEARS[idx]);
      if (navigator.vibrate) navigator.vibrate(5);
    }
  }

  return (
    <div className="relative h-[240px] select-none">
      <div className="absolute left-0 right-0 rounded-2xl pointer-events-none" style={{ top: ITEM_H * 2, height: ITEM_H, background: card }} />
      <div ref={ref} onScroll={onScroll} className="relative h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: "none", paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}>
        {YEARS.map((y) => {
          const dist = Math.abs(y - value);
          return (
            <div key={y} className="snap-center flex items-center justify-center transition-all"
              style={{
                height: ITEM_H,
                fontSize: dist === 0 ? 30 : 20,
                opacity: dist === 0 ? 1 : dist === 1 ? 0.5 : 0.2,
                color: dist === 0 ? accent : "#fff",
              }}>
              {y}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SmartPlanSetup() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [gymName, setGymName] = useState("your gym");
  const [gender, setGender] = useState("male");
  const [birthYear, setBirthYear] = useState(2000);
  const [goal, setGoal] = useState<Goal>("gain");
  const [focus, setFocus] = useState<string[]>([]);
  const [side, setSide] = useState<Side>("anterior");
  const [level, setLevel] = useState<Level>("beginner");
  const [days, setDays] = useState(3);
  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("");
  const [height, setHeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasTrainerPlan, setHasTrainerPlan] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [accent, setAccent] = useState("#D4F75C");
  const [bg, setBg] = useState(BACKGROUNDS.midnight);
  const [sharp, setSharp] = useState(false);

  const LAST = 7;

  useEffect(() => {
    const handler = () => {
      setStep(1);
      setError("");
      setOpen(true);
    };
    window.addEventListener("open-smart-plan", handler);
    return () => window.removeEventListener("open-smart-plan", handler);
  }, []);

  useEffect(() => {
    if (!open || step !== 1) return;
    const timer = setInterval(() => setCardIndex((i) => (i + 1) % CARDS.length), 2200);
    return () => clearInterval(timer);
  }, [open, step]);

  useEffect(() => {
    async function check() {
      if (!pathname?.endsWith("/home")) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: b }, { data: st }, { data: mp }] = await Promise.all([
        supabase.rpc("get_gym_branding", { p_slug: slug }),
        supabase
          .from("member_settings")
          .select("goal, level, days_per_week, target_weight, height_cm, gender, birth_year, focus_muscles")
          .eq("member_id", user.id)
          .maybeSingle(),
        supabase.from("member_plans").select("plan_id, workout_plans(member_id)").eq("member_id", user.id).limit(1),
      ]);

      const brand = (b as { name: string; accent_color: string; theme_bg: string | null; card_style: string | null }[] | null)?.[0];
      if (brand) {
        setGymName(brand.name);
        setAccent(brand.accent_color);
        setBg(BACKGROUNDS[brand.theme_bg || "midnight"] || BACKGROUNDS.midnight);
        setSharp(brand.card_style === "sharp");
      }
      if (st?.goal) setGoal(st.goal as Goal);
      if (st?.level) setLevel(st.level as Level);
      if (st?.days_per_week) setDays(st.days_per_week);
      if (st?.target_weight) setTarget(String(st.target_weight));
      if (st?.height_cm) setHeight(String(st.height_cm));
      if (st?.gender) setGender(st.gender);
      if (st?.birth_year) setBirthYear(st.birth_year);
      if (st?.focus_muscles) setFocus(st.focus_muscles as string[]);

      const assigned = mp?.[0] as unknown as { workout_plans: { member_id: string | null } | null } | undefined;
      setHasTrainerPlan(!!assigned && !assigned.workout_plans?.member_id);

      const needs = !st?.goal || !assigned;
      if (needs && localStorage.getItem("smartplan-later") !== formatDate(new Date())) {
        setStep(0);
        setOpen(true);
      }
    }
    check();
  }, [pathname, slug]);

  function later() {
    localStorage.setItem("smartplan-later", formatDate(new Date()));
    setOpen(false);
  }

  function toggleMuscle(m: string) {
    if (navigator.vibrate) navigator.vibrate(10);
    setFocus((f) => (f.includes(m) ? f.filter((x) => x !== m) : [...f, m]));
  }

  async function build() {
    if (hasTrainerPlan && !confirm("Your trainer already gave you a plan. Replace it with your smart plan?")) return;
    setBusy(true);
    setError("");

    if (weight) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("body_progress").insert({ member_id: user.id, log_date: formatDate(new Date()), weight_kg: Number(weight) });
      }
    }

    const res = await generateSmartPlan({
      goal,
      level,
      days,
      focus,
      gender,
      birthYear,
      targetWeight: target ? Number(target) : null,
      heightCm: height ? Number(height) : null,
    });

    if ("error" in res && res.error) {
      setBusy(false);
      return setError(res.error);
    }
    setStep(LAST + 1);
    setTimeout(() => window.location.reload(), 1800);
  }

  const onAccent = textOn(accent);
  const radius = sharp ? "8px" : "22px";

  const option = (active: boolean) => ({
    background: active ? accent : bg.card,
    color: active ? onAccent : "#fff",
    borderRadius: radius,
  });

  const heading = (a: string, b: string) => (
    <h1 className="text-4xl leading-none">
      {a} <span className="italic" style={{ color: accent }}>{b}</span>
    </h1>
  );

  const next = () => (step < LAST ? setStep(step + 1) : build());

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] overflow-y-auto text-white" style={{ background: bg.bg }}>
          <div className="max-w-md mx-auto min-h-screen flex flex-col relative">

            {step === 0 && (
              <div className="relative flex-1 flex flex-col">
                <div className="absolute inset-0 overflow-hidden">
                  <Photo src="/images/hero.jpg" className="w-full h-full object-cover grayscale" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${bg.bg} 0%, transparent 30%, transparent 55%, ${bg.bg} 92%)` }} />
                </div>
                <div className="relative px-6 pt-14 text-center">
                  <h1 className="text-4xl leading-tight">
                    Start your journey<br />with <span className="italic" style={{ color: accent }}>{gymName}</span>
                  </h1>
                </div>
                {[
                  { text: "Smart weekly plan", Icon: CalendarDays, pos: "left-5 top-[36%]", delay: 0.2 },
                  { text: "QR check-in", Icon: QrCode, pos: "right-5 top-[50%]", delay: 0.5 },
                  { text: "Streaks & progress", Icon: Flame, pos: "left-8 top-[64%]", delay: 0.8 },
                ].map(({ text, Icon: TagIcon, pos, delay }) => (
                  <motion.div key={text} className={`absolute ${pos} flex items-center gap-2 px-3 py-2 rounded-full text-xs bg-black/70 backdrop-blur border border-white/10`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: [0, -6, 0] }}
                    transition={{ opacity: { delay }, y: { delay, repeat: Infinity, duration: 3 } }}>
                    <TagIcon size={14} color={accent} /> {text}
                  </motion.div>
                ))}
              </div>
            )}

            {step > 0 && step <= LAST && (
              <div className="px-5 pt-6 flex items-center justify-between">
                <button onClick={() => setStep(step - 1)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: bg.card }} aria-label="Back">
                  <ArrowLeft size={18} />
                </button>
                <button onClick={later} className="text-xs text-gray-400 flex items-center gap-1">Later <X size={14} /></button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }} className={step === 0 ? "" : "flex-1 px-5"}>

                {step === 1 && (
                  <>
                    <div className="relative h-56 mt-6 flex items-center justify-center">
                      {CARDS.map((c, i) => {
                        const pos = (i - cardIndex + CARDS.length) % CARDS.length;
                        const x = pos === 0 ? 0 : pos === 1 ? 120 : -120;
                        const rotate = pos === 0 ? 0 : pos === 1 ? 10 : -10;
                        return (
                          <motion.div key={c.label} className="absolute w-40 h-52 overflow-hidden"
                            style={{ borderRadius: radius, zIndex: pos === 0 ? 3 : 1 }}
                            animate={{ x, rotate, scale: pos === 0 ? 1 : 0.85, opacity: pos === 0 ? 1 : 0.6 }}
                            transition={{ type: "spring", damping: 18 }}>
                            <Photo src={c.img} className="w-full h-full object-cover grayscale" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <p className="absolute top-3 left-3 text-lg leading-none" style={{ color: accent }}>{c.label}</p>
                            <ArrowRight size={18} className="absolute top-3 right-3" />
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="mt-6 text-center">{heading("Choose your", "gender")}</div>
                    <div className="mt-6 grid gap-2.5">
                      {GENDERS.map((g) => {
                        const active = gender === g.key;
                        return (
                          <button key={g.key} onClick={() => setGender(g.key)} className="px-4 py-3.5 flex items-center gap-3 text-left" style={option(active)}>
                            <span className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: active ? onAccent : "rgba(255,255,255,0.08)", color: active ? accent : "#aaa" }}>
                              <Icon icon={g.icon} width={18} height={18} />
                            </span>
                            {g.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="mt-8">{heading("Choose your", "birth year")}</div>
                    <p className="mt-3 text-sm text-gray-400">Helps us set the right intensity and recovery for you.</p>
                    <div className="mt-8">
                      <YearWheel value={birthYear} onChange={setBirthYear} accent={accent} card={bg.card} />
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-400">You&apos;re about {new Date().getFullYear() - birthYear} years old</p>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="mt-8">{heading("What's your", "goal?")}</div>
                    <p className="mt-3 text-sm text-gray-400">We&apos;ll build your weekly routine around it.</p>
                    <div className="mt-8 grid gap-3">
                      {GOALS.map((g) => (
                        <button key={g.key} onClick={() => setGoal(g.key)} className="p-4 flex items-center gap-4 text-left" style={option(goal === g.key)}>
                          <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: goal === g.key ? onAccent : `${accent}22`, color: accent }}>
                            <Icon icon={g.icon} width={26} height={26} />
                          </span>
                          <span>
                            <span className="block text-lg">{g.title}</span>
                            <span className="block text-xs opacity-70">{g.sub}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="mt-6 flex items-end justify-between gap-3">
                      {heading(side === "anterior" ? "Front side" : "Back side", "target muscle")}
                      <button onClick={() => setSide(side === "anterior" ? "posterior" : "anterior")}
                        className="shrink-0 px-3 py-2 rounded-full text-xs flex items-center gap-1" style={{ background: bg.card }}>
                        <RotateCcw size={12} /> {side === "anterior" ? "Back" : "Front"}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">Tap muscles you want to focus on. Pick as many as you like, or skip.</p>
                    <div className="mt-4 mx-auto w-48">
                      <BodyModel
                        type={side}
                        data={focus.map((m) => ({ name: m, muscles: [m] }))}
                        bodyColor="#3f3f46"
                        highlightedColors={[accent]}
                        onClick={({ muscle }: { muscle: string }) => toggleMuscle(muscle)}
                        style={{ width: "100%", padding: 0 }}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {MUSCLES[side].map(([key, label]) => {
                        const active = focus.includes(key);
                        return (
                          <button key={key} onClick={() => toggleMuscle(key)} className="px-3.5 py-2 text-sm flex items-center gap-2"
                            style={{ background: active ? accent : bg.card, color: active ? onAccent : "#ddd", borderRadius: 999 }}>
                            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: active ? onAccent : "#666", background: active ? onAccent : "transparent" }} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <div className="mt-8">{heading("Your", "level")}</div>
                    <p className="mt-3 text-sm text-gray-400">Be honest. We&apos;ll adjust sets and rest for you.</p>
                    <div className="mt-8 grid gap-3">
                      {LEVELS.map((l) => (
                        <button key={l.key} onClick={() => setLevel(l.key)} className="p-4 text-left" style={option(level === l.key)}>
                          <span className="block text-lg">{l.title}</span>
                          <span className="block text-xs opacity-70">{l.sub}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <div className="mt-8">{heading("Days per", "week")}</div>
                    <p className="mt-3 text-sm text-gray-400">
                      {level === "beginner" ? "Tip: 3 days is perfect when you're starting out." : "Pick what you can actually stick to."}
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      {DAYS.map((d) => (
                        <button key={d.n} onClick={() => setDays(d.n)} className="p-5 text-left" style={option(days === d.n)}>
                          <span className="block text-2xl">{d.label}</span>
                          <span className="block text-xs opacity-70 mt-1">{d.sub}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 7 && (
                  <>
                    <div className="mt-8">{heading("About", "you")}</div>
                    <p className="mt-3 text-sm text-gray-400">Optional, but helps track your progress.</p>
                    <div className="mt-8 grid gap-3">
                      {[
                        { label: "Current weight (kg)", value: weight, set: setWeight },
                        { label: "Target weight (kg)", value: target, set: setTarget },
                        { label: "Height (cm)", value: height, set: setHeight },
                      ].map((f) => (
                        <label key={f.label} className="p-4 block" style={{ background: bg.card, borderRadius: radius }}>
                          <span className="block text-xs text-gray-400">{f.label}</span>
                          <input type="number" step="0.1" value={f.value} onChange={(e) => f.set(e.target.value)}
                            className="mt-1 w-full bg-transparent outline-none text-2xl" placeholder="-" />
                        </label>
                      ))}
                    </div>
                    {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                  </>
                )}

                {step === LAST + 1 && (
                  <div className="mt-32 text-center">
                    <motion.div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
                      style={{ background: accent, color: onAccent }}
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                      <Sparkles size={40} />
                    </motion.div>
                    <div className="mt-6">{heading("Your plan is", "ready!")}</div>
                    <p className="mt-3 text-sm text-gray-400">Loading your new routine...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step <= LAST && (
              <div className="relative px-5 pb-8 pt-6 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {Array.from({ length: LAST + 1 }).map((_, i) => (
                    <span key={i} className="h-1.5 rounded-full transition-all"
                      style={{ width: step === i ? 24 : 6, background: step === i ? "#fff" : "rgba(255,255,255,0.25)" }} />
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.95 }} disabled={busy} onClick={next}
                  className="pl-5 pr-4 py-3 rounded-full bg-white text-black text-sm font-bold flex items-center gap-2">
                  {busy ? "Building..." : step === 0 ? "Get started" : step === LAST ? "Build my plan" : step === 4 && focus.length === 0 ? "Skip" : "Continue"}
                  {step === LAST ? <Sparkles size={16} /> : <ArrowRight size={16} />}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}