"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BACKGROUNDS, textOn, formatDate } from "@/utils/theme";
import { generateSmartPlan } from "./actions";

type Goal = "lose" | "gain" | "maintain";
type Level = "beginner" | "intermediate" | "advanced";

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

export default function SmartPlanSetup() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>("gain");
  const [level, setLevel] = useState<Level>("beginner");
  const [days, setDays] = useState(3);
  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("");
  const [height, setHeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasTrainerPlan, setHasTrainerPlan] = useState(false);
  const [accent, setAccent] = useState("#D4F75C");
  const [bg, setBg] = useState(BACKGROUNDS.midnight);
  const [sharp, setSharp] = useState(false);

  useEffect(() => {
    const handler = () => {
      setStep(0);
      setError("");
      setOpen(true);
    };
    window.addEventListener("open-smart-plan", handler);
    return () => window.removeEventListener("open-smart-plan", handler);
  }, []);

  useEffect(() => {
    async function check() {
      if (!pathname?.endsWith("/home")) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: b }, { data: st }, { data: mp }] = await Promise.all([
        supabase.rpc("get_gym_branding", { p_slug: slug }),
        supabase.from("member_settings").select("goal, level, days_per_week, target_weight, height_cm").eq("member_id", user.id).maybeSingle(),
        supabase.from("member_plans").select("plan_id, workout_plans(member_id)").eq("member_id", user.id).limit(1),
      ]);

      const brand = (b as { accent_color: string; theme_bg: string | null; card_style: string | null }[] | null)?.[0];
      if (brand) {
        setAccent(brand.accent_color);
        setBg(BACKGROUNDS[brand.theme_bg || "midnight"] || BACKGROUNDS.midnight);
        setSharp(brand.card_style === "sharp");
      }
      if (st?.goal) setGoal(st.goal as Goal);
      if (st?.level) setLevel(st.level as Level);
      if (st?.days_per_week) setDays(st.days_per_week);
      if (st?.target_weight) setTarget(String(st.target_weight));
      if (st?.height_cm) setHeight(String(st.height_cm));

      const assigned = mp?.[0] as unknown as { workout_plans: { member_id: string | null } | null } | undefined;
      setHasTrainerPlan(!!assigned && !assigned.workout_plans?.member_id);

      const needs = !st?.goal || !assigned;
      if (needs && localStorage.getItem("smartplan-later") !== formatDate(new Date())) {
        setOpen(true);
      }
    }
    check();
  }, [pathname, slug]);

  function later() {
    localStorage.setItem("smartplan-later", formatDate(new Date()));
    setOpen(false);
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
      targetWeight: target ? Number(target) : null,
      heightCm: height ? Number(height) : null,
    });

    if ("error" in res && res.error) {
      setBusy(false);
      return setError(res.error);
    }
    setStep(4);
    setTimeout(() => window.location.reload(), 1600);
  }

  const onAccent = textOn(accent);
  const radius = sharp ? "8px" : "22px";
  const pill = sharp ? "8px" : "999px";

  const option = (active: boolean) => ({
    background: active ? accent : bg.card,
    color: active ? onAccent : "#fff",
    borderRadius: radius,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] overflow-y-auto text-white" style={{ background: bg.bg }}>
          <div className="max-w-md mx-auto px-5 pt-6 pb-10 min-h-screen flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: step === i ? 28 : 10, background: step >= i ? accent : "rgba(255,255,255,0.15)" }} />
                ))}
              </div>
              {step < 4 && (
                <button onClick={later} className="text-xs text-gray-400 flex items-center gap-1">
                  Later <X size={14} />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="flex-1">
                {step === 0 && (
                  <>
                    <h1 className="mt-10 text-4xl leading-none">What&apos;s your<br /><span style={{ color: accent }}>goal?</span></h1>
                    <p className="mt-3 text-sm text-gray-400">We&apos;ll build your weekly routine around it.</p>
                    <div className="mt-8 grid gap-3">
                      {GOALS.map((g) => (
                        <button key={g.key} onClick={() => setGoal(g.key)} className="p-4 flex items-center gap-4 text-left" style={option(goal === g.key)}>
                          <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: goal === g.key ? onAccent : `${accent}22`, color: goal === g.key ? accent : accent }}>
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

                {step === 1 && (
                  <>
                    <h1 className="mt-10 text-4xl leading-none">Your<br /><span style={{ color: accent }}>level</span></h1>
                    <p className="mt-3 text-sm text-gray-400">Be honest. We&apos;ll adjust sets and weights for you.</p>
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

                {step === 2 && (
                  <>
                    <h1 className="mt-10 text-4xl leading-none">Days per<br /><span style={{ color: accent }}>week</span></h1>
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

                {step === 3 && (
                  <>
                    <h1 className="mt-10 text-4xl leading-none">About<br /><span style={{ color: accent }}>you</span></h1>
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

                {step === 4 && (
                  <div className="mt-24 text-center">
                    <motion.div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
                      style={{ background: accent, color: onAccent }}
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                      <Sparkles size={40} />
                    </motion.div>
                    <h1 className="mt-6 text-4xl leading-none">Your plan<br /><span style={{ color: accent }}>is ready!</span></h1>
                    <p className="mt-3 text-sm text-gray-400">Loading your new routine...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step < 4 && (
              <div className="mt-8 flex gap-3">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="w-14 h-14 flex items-center justify-center shrink-0"
                    style={{ background: bg.card, borderRadius: pill }} aria-label="Back">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <motion.button whileTap={{ scale: 0.96 }} disabled={busy}
                  onClick={() => (step < 3 ? setStep(step + 1) : build())}
                  className="flex-1 h-14 text-lg flex items-center justify-center gap-2"
                  style={{ background: accent, color: onAccent, borderRadius: pill }}>
                  {busy ? "Building your plan..." : step < 3 ? <>Next <ArrowRight size={20} /></> : <>Build my plan <Sparkles size={18} /></>}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}