"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Dumbbell, CalendarDays, Target, Zap, Scale } from "lucide-react";
import { parse, weekOf, DAY_NAMES, type Log, type Progress, type Settings, type Theme } from "./types";

type Props = {
  theme: Theme;
  todayStr: string;
  logs: Log[];
  progress: Progress[];
  settings: Settings;
  streak: number;
  totalDays: number;
  onSaveWeight: (kg: number) => Promise<string | null>;
  onSaveSettings: (s: Partial<Settings>) => Promise<void>;
};

const GOALS = [
  { key: "lose", label: "Lose weight", Icon: Flame },
  { key: "gain", label: "Build muscle", Icon: Dumbbell },
  { key: "maintain", label: "Stay fit", Icon: Zap },
] as const;

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Above healthy range";
  return "Well above healthy range";
}

export default function ProgressTab(p: Props) {
  const t = p.theme;
  const card = { background: t.card, borderRadius: t.radius };

  const [weight, setWeight] = useState("");
  const [msg, setMsg] = useState("");
  const [editingGoal, setEditingGoal] = useState(!p.settings.goal);
  const [goal, setGoal] = useState<Settings["goal"]>(p.settings.goal || "lose");
  const [target, setTarget] = useState(p.settings.target_weight ? String(p.settings.target_weight) : "");
  const [height, setHeight] = useState(p.settings.height_cm ? String(p.settings.height_cm) : "");

  const week = weekOf(p.todayStr);
  const counts = week.map((d) => p.logs.filter((l) => l.log_date === d).length);
  const maxCount = Math.max(1, ...counts);
  const workoutsThisWeek = counts.filter((c) => c > 0).length;

  const chrono = [...p.progress].reverse();
  const current = p.progress[0]?.weight_kg;
  const start = chrono[0]?.weight_kg;
  const targetW = p.settings.target_weight;

  let goalPct: number | null = null;
  if (current != null && start != null && targetW != null && start !== targetW) {
    if (p.settings.goal === "lose") goalPct = (start - current) / (start - targetW);
    else if (p.settings.goal === "gain") goalPct = (current - start) / (targetW - start);
    if (goalPct != null) goalPct = Math.max(0, Math.min(1, goalPct));
  }

  const bmi = current && p.settings.height_cm ? current / Math.pow(p.settings.height_cm / 100, 2) : null;

  const W = 300;
  const H = 110;
  let line = "";
  let area = "";
  if (chrono.length >= 2) {
    const ws = chrono.map((x) => Number(x.weight_kg));
    const min = Math.min(...ws) - 1;
    const max = Math.max(...ws) + 1;
    const pts = ws.map((w, i) => [(i / (ws.length - 1)) * W, H - ((w - min) / (max - min)) * H]);
    line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    area = `${line} L${W},${H} L0,${H} Z`;
  }

  async function logWeight(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    const err = await p.onSaveWeight(Number(weight));
    setMsg(err ? "Error: " + err : "Weight saved");
    if (!err) setWeight("");
  }

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    await p.onSaveSettings({
      goal,
      target_weight: target ? Number(target) : null,
      height_cm: height ? Number(height) : null,
    });
    setEditingGoal(false);
  }

  const stats = [
    { label: "This week", value: String(workoutsThisWeek), Icon: Dumbbell },
    { label: "Streak", value: String(p.streak), Icon: Flame },
    { label: "Days (90d)", value: String(p.totalDays), Icon: CalendarDays },
  ];

  return (
    <div>
      <h1 className="mt-8 text-4xl leading-none">
        Your<br /><span style={{ color: t.accent }}>progress</span>
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="p-4" style={card}>
            <Icon size={18} color={t.accent} />
            <p className="text-2xl mt-2">{value}</p>
            <p className="text-[11px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 p-5" style={card}>
        <p className="text-sm">Workout frequency</p>
        <p className="text-xs text-gray-400">Exercises done this week</p>
        <div className="mt-4 flex items-end justify-between gap-2 h-28">
          {counts.map((c, i) => {
            const isToday = week[i] === p.todayStr;
            return (
              <div key={week[i]} className="flex-1 flex flex-col items-center gap-1">
                {c > 0 && (
                  <span className="text-[10px] px-1.5 rounded" style={{ background: t.accent, color: t.onAccent }}>{c}</span>
                )}
                <motion.div className="w-full" initial={{ height: 4 }} animate={{ height: Math.max(4, (c / maxCount) * 80) }}
                  transition={{ delay: i * 0.05 }}
                  style={{ background: c > 0 ? t.accent : "rgba(255,255,255,0.08)", borderRadius: 6 }} />
                <span className="text-[10px]" style={{ color: isToday ? t.accent : "#777" }}>{DAY_NAMES[parse(week[i]).getDay()]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 p-5" style={card}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Target size={18} color={t.accent} />
            <p className="text-sm">My goal</p>
          </div>
          {p.settings.goal && !editingGoal && (
            <button onClick={() => setEditingGoal(true)} className="text-xs" style={{ color: t.accent }}>Edit</button>
          )}
        </div>
        {p.settings.goal && !editingGoal && (
          <p className="text-2xl mt-2">{GOALS.find((g) => g.key === p.settings.goal)?.label}</p>
        )}

        {editingGoal ? (
          <form onSubmit={saveGoal} className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map(({ key, label, Icon }) => (
                <button type="button" key={key} onClick={() => setGoal(key)} className="py-3 text-xs flex flex-col items-center gap-2"
                  style={{
                    background: goal === key ? t.accent : "rgba(255,255,255,0.05)",
                    color: goal === key ? t.onAccent : "#ccc",
                    borderRadius: t.radius,
                  }}>
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input type="number" step="0.1" placeholder="Target weight (kg)" value={target} onChange={(e) => setTarget(e.target.value)}
                className="px-4 py-3 outline-none bg-black/30" style={{ borderRadius: t.small }} />
              <input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)}
                className="px-4 py-3 outline-none bg-black/30" style={{ borderRadius: t.small }} />
            </div>
            <button type="submit" className="mt-3 w-full py-3" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>Save goal</button>
          </form>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div><p className="text-[11px] text-gray-400">Start</p><p className="text-lg">{start ?? "-"}</p></div>
              <div><p className="text-[11px] text-gray-400">Now</p><p className="text-lg" style={{ color: t.accent }}>{current ?? "-"}</p></div>
              <div><p className="text-[11px] text-gray-400">Target</p><p className="text-lg">{targetW ?? "-"}</p></div>
            </div>
            {goalPct != null && (
              <>
                <div className="mt-4 h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: t.accent }} initial={{ width: 0 }} animate={{ width: `${goalPct * 100}%` }} transition={{ duration: 1 }} />
                </div>
                <p className="mt-2 text-xs text-gray-400">{Math.round(goalPct * 100)}% of the way there</p>
              </>
            )}
            {current == null && <p className="mt-3 text-xs text-gray-400">Log your weight below to start tracking.</p>}
            {bmi && <p className="mt-3 text-xs text-gray-400">BMI {bmi.toFixed(1)} · {bmiLabel(bmi)}</p>}
          </>
        )}
      </div>

      <div className="mt-3 p-5" style={card}>
        <div className="flex items-center gap-2">
          <Scale size={18} color={t.accent} />
          <p className="text-sm">Weight trend</p>
        </div>
        {chrono.length >= 2 ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full h-28" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wfill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={t.accent} stopOpacity="0.35" />
                <stop offset="100%" stopColor={t.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#wfill)" />
            <motion.path d={line} fill="none" stroke={t.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
          </svg>
        ) : (
          <p className="mt-3 text-xs text-gray-400">Log at least two weights to see your trend.</p>
        )}
        <form onSubmit={logWeight} className="mt-4 flex gap-2">
          <input type="number" step="0.1" placeholder="Today's weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="flex-1 px-4 py-3 outline-none bg-black/30" style={{ borderRadius: t.small }} />
          <button type="submit" className="px-5" style={{ background: t.accent, color: t.onAccent, borderRadius: t.small }}>Log</button>
        </form>
        {msg && <p className="mt-2 text-xs" style={{ color: t.accent }}>{msg}</p>}
      </div>

      {p.progress.length > 0 && (
        <div className="mt-3 grid gap-2">
          {p.progress.slice(0, 8).map((x) => (
            <div key={x.id} className="p-4 flex justify-between text-sm" style={card}>
              <span className="text-gray-400">{x.log_date}</span>
              <span>{x.weight_kg} kg</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}