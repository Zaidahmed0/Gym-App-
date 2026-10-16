"use client";

import { motion } from "framer-motion";
import { Flame, Star, Droplet, Plus, Minus, Check, Play, ChevronRight, Clock, Dumbbell, Megaphone } from "lucide-react";
import Photo from "./Photo";
import FitIcon, { FIT } from "./FitIcon";
import { parse, weekOf, estimateMinutes, exerciseImage, DAY_NAMES, type Item, type Log, type Theme, type FeedItem } from "./types";

type Props = {
  theme: Theme;
  firstName: string;
  welcome: string | null;
  todayStr: string;
  items: Item[];
  logs: Log[];
  doneToday: string[];
  planTitle: string | null;
  streak: number;
  level: number;
  levelPct: number;
  water: number;
  waterGoal: number;
  banner: FeedItem | null;
  onBanner: () => void;
  onStart: () => void;
  onToggle: (id: string) => void;
  onWater: (delta: number) => void;
  onVideo: (url: string) => void;
  onGo: (tab: "workouts" | "progress" | "profile") => void;
  onMusic: () => void;
};

export default function HomeTab(p: Props) {
  const t = p.theme;
  const card = { background: t.card, borderRadius: t.radius };
  const soft = `${t.accent}22`;

  const dow = parse(p.todayStr).getDay();
  const week = weekOf(p.todayStr);
  const logDates = new Set(p.logs.map((l) => l.log_date));
  const plannedDays = new Set(p.items.map((i) => i.day_of_week));
  const weekGoal = plannedDays.size || 5;
  const doneThisWeek = week.filter((d) => logDates.has(d)).length;
  const pct = Math.min(1, doneThisWeek / weekGoal);

  const todayItems = p.items.filter((i) => i.day_of_week === dow);
  const doneCount = todayItems.filter((i) => p.doneToday.includes(i.exercise_id)).length;
  const allDone = todayItems.length > 0 && doneCount === todayItems.length;
  const mainCategory = todayItems[0]?.exercises?.category;

  const R = 34;
  const C = 2 * Math.PI * R;

  const actions = [
    { label: "Workouts", icon: FIT.workouts, onClick: () => p.onGo("workouts") },
    { label: "Progress", icon: FIT.weight, onClick: () => p.onGo("progress") },
    { label: "Goals", icon: FIT.goals, onClick: () => p.onGo("progress") },
    { label: "Music", icon: FIT.music, onClick: p.onMusic },
  ];

  return (
    <div>
      <p className="mt-8 text-sm text-gray-400">Hello, {p.firstName}</p>
      <h1 className="text-4xl leading-none mt-1">
        {todayItems.length ? "Ready to crush" : "Rest and"}<br />
        <span style={{ color: t.accent }}>{todayItems.length ? "your goals?" : "recover"}</span>
      </h1>
      {p.welcome && <p className="mt-3 text-sm text-gray-400">{p.welcome}</p>}

      {p.banner && (
        <motion.button whileTap={{ scale: 0.98 }} onClick={p.onBanner} className="mt-5 w-full relative overflow-hidden text-left" style={{ ...card, minHeight: 120 }}>
          {p.banner.image_url && <Photo src={p.banner.image_url} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0" style={{ background: p.banner.image_url ? `linear-gradient(90deg, ${t.card} 35%, ${t.card}aa 60%, transparent)` : "none" }} />
          <div className="relative p-4 max-w-[70%]">
            <span className="text-[11px] px-2.5 py-1 inline-flex items-center gap-1" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
              <Megaphone size={12} /> Gym update
            </span>
            <p className="mt-2 text-lg leading-tight">{p.banner.title}</p>
            {p.banner.body && <p className="mt-1 text-xs text-gray-300 line-clamp-2">{p.banner.body}</p>}
          </div>
        </motion.button>
      )}

      <div className="mt-5 p-4 flex items-center gap-4" style={card}>
        <svg width="90" height="90" viewBox="0 0 90 90" className="shrink-0">
          <circle cx="45" cy="45" r={R} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <motion.circle cx="45" cy="45" r={R} stroke={t.accent} strokeWidth="8" fill="none" strokeLinecap="round"
            strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }}
            transition={{ duration: 1.2, ease: "easeOut" }} transform="rotate(-90 45 45)" />
          <text x="45" y="51" textAnchor="middle" fill="white" fontSize="18">{Math.round(pct * 100)}%</text>
        </svg>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Weekly progress</p>
          <p className="text-lg">{doneThisWeek}/{weekGoal} workout days</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", borderRadius: t.small }}>
              <Flame size={18} color={t.accent} fill={p.streak > 0 ? t.accent : "none"} />
              <div>
                <p className="text-gray-400 text-[10px]">Streak</p>
                <p className="text-sm">{p.streak} days</p>
              </div>
            </div>
            <div className="p-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", borderRadius: t.small }}>
              <Star size={18} color={t.accent} fill={t.accent} />
              <div className="flex-1">
                <p className="text-gray-400 text-[10px]">Level {p.level}</p>
                <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: t.accent }} initial={{ width: 0 }} animate={{ width: `${p.levelPct * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {week.map((d) => {
          const isToday = d === p.todayStr;
          const done = logDates.has(d);
          const day = parse(d);
          return (
            <div key={d} className="py-2 text-center"
              style={{
                background: isToday ? "transparent" : t.card,
                border: isToday ? `1.5px solid ${t.accent}` : "1.5px solid transparent",
                borderRadius: t.small,
              }}>
              <span className="block h-1.5 mb-1">
                {done && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: t.accent }} />}
              </span>
              <p className="text-[10px] text-gray-400">{DAY_NAMES[day.getDay()]}</p>
              <p className="text-sm">{day.getDate()}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-7 flex justify-between items-end">
        <p className="text-xl">Today&apos;s workout</p>
        <button onClick={() => p.onGo("workouts")} className="text-xs flex items-center" style={{ color: t.accent }}>
          See all <ChevronRight size={14} />
        </button>
      </div>

      {!p.planTitle ? (
        <div className="mt-3 p-6 text-center text-sm text-gray-400" style={card}>
          Your trainer hasn&apos;t assigned a plan yet. Check back soon!
        </div>
      ) : todayItems.length === 0 ? (
        <div className="mt-3 relative overflow-hidden" style={{ ...card, minHeight: 170 }}>
          <Photo src="/images/rest.jpg?v=today" className="absolute inset-0 w-full h-full object-cover grayscale opacity-70" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${t.card} 35%, transparent)` }} />
          <div className="relative p-5">
            <span className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: soft, color: t.accent }}>
              <FitIcon icon={FIT.rest} size={24} />
            </span>
            <p className="mt-3 text-2xl">Rest day</p>
            <p className="mt-1 text-sm text-gray-300 max-w-[60%]">Stretch, hydrate and sleep well. Muscles grow when you rest.</p>
          </div>
        </div>
      ) : (
        <div className="mt-3 relative overflow-hidden" style={{ ...card, minHeight: 220 }}>
          <Photo src={exerciseImage(todayItems[0]?.exercises || null)} fallback="/images/fullbody.jpg"
            className="absolute inset-0 w-full h-full object-cover grayscale" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${t.card} 30%, ${t.card}cc 55%, transparent)` }} />
          <div className="relative p-5">
            <p className="text-xs flex items-center gap-1.5" style={{ color: t.accent }}>
              <FitIcon category={mainCategory} size={16} /> {DAY_NAMES[dow]} · {p.planTitle}
            </p>
            <p className="text-3xl mt-1 max-w-[65%] leading-none">{mainCategory ? `${mainCategory} day` : "Today's session"}</p>
            <div className="mt-3 flex gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1"><Dumbbell size={14} /> {todayItems.length} exercises</span>
              <span className="flex items-center gap-1"><Clock size={14} /> ~{estimateMinutes(todayItems)} min</span>
            </div>
            <div className="mt-3 h-1.5 w-1/2 rounded-full bg-white/15 overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: t.accent }} animate={{ width: `${(doneCount / todayItems.length) * 100}%` }} />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={p.onStart} className="mt-4 pl-5 pr-2 py-2 text-sm flex items-center gap-3"
              style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
              {allDone ? "Done. Go again" : doneCount ? "Continue workout" : "Start workout"}
              <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.onAccent, color: t.accent }}>
                <Play size={14} fill={t.accent} />
              </span>
            </motion.button>
          </div>
        </div>
      )}

      <p className="mt-7 text-xl">Quick actions</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {actions.map(({ label, icon, onClick }) => (
          <motion.button key={label} whileTap={{ scale: 0.92 }} onClick={onClick} className="py-4 flex flex-col items-center gap-2" style={card}>
            <span className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: soft, color: t.accent }}>
              <FitIcon icon={icon} size={24} />
            </span>
            <span className="text-[11px] text-gray-300">{label}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-3 p-4 flex items-center justify-between" style={card}>
        <div>
          <p className="text-xs text-gray-400">Water today</p>
          <p className="text-2xl">{p.water}<span className="text-sm text-gray-400"> / {p.waterGoal} glasses</span></p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {Array.from({ length: p.waterGoal }).map((_, i) => (
              <Droplet key={i} size={16} color={i < p.water ? "#4DD8FF" : "#555"} fill={i < p.water ? "#4DD8FF" : "none"} />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => p.onWater(-1)} className="w-10 h-10 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", borderRadius: t.pill }} aria-label="Remove glass">
            <Minus size={18} />
          </button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => p.onWater(1)} className="w-10 h-10 flex items-center justify-center"
            style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }} aria-label="Add glass">
            <Plus size={18} />
          </motion.button>
        </div>
      </div>

      {todayItems.length > 0 && (
        <>
          <p className="mt-7 text-xl">Exercises</p>
          <div className="mt-3 grid gap-2">
            {todayItems.map((i) => {
              const done = p.doneToday.includes(i.exercise_id);
              const vid = i.exercises?.youtube_url;
              return (
                <div key={i.id} className="p-2.5 flex items-center gap-3" style={card}>
                  <button onClick={() => vid && p.onVideo(vid)} className="relative w-16 h-16 shrink-0 overflow-hidden" style={{ borderRadius: t.small }}
                    aria-label={vid ? "Play video" : "Exercise"}>
                    <Photo src={exerciseImage(i.exercises)} fallback="/images/fullbody.jpg" className="w-full h-full object-cover grayscale" />
                    {vid && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: t.accent, color: t.onAccent }}>
                          <Play size={12} fill={t.onAccent} />
                        </span>
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={done ? "line-through text-gray-500" : ""}>{i.exercises?.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FitIcon category={i.exercises?.category} size={13} /> {i.sets} sets × {i.reps} reps
                    </p>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => p.onToggle(i.exercise_id)}
                    className="w-9 h-9 flex items-center justify-center shrink-0 mr-1"
                    style={{ borderRadius: 999, background: done ? t.accent : "transparent", color: t.onAccent, border: done ? "none" : "2px solid #555" }}
                    aria-label={done ? "Mark not done" : "Mark done"}>
                    {done && <Check size={18} strokeWidth={3} />}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}