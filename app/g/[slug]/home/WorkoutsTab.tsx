"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, ChevronRight, Check } from "lucide-react";
import Photo from "./Photo";
import VideoBox from "./VideoBox";
import FitIcon, { FIT } from "./FitIcon";
import { parse, exerciseImage, DAY_NAMES, WEEK_ORDER, CATEGORIES, type Item, type Exercise, type ExerciseInfo, type Theme } from "./types";

type Props = {
  theme: Theme;
  items: Item[];
  library: Exercise[];
  todayStr: string;
  doneToday: string[];
  planTitle: string | null;
};

type Detail = ExerciseInfo & { meta?: string; key: string };

export default function WorkoutsTab({ theme: t, items, library, todayStr, doneToday, planTitle }: Props) {
  const [view, setView] = useState<"plan" | "library">("plan");
  const [day, setDay] = useState(parse(todayStr).getDay());
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);

  const card = { background: t.card, borderRadius: t.radius };
  const chip = (active: boolean) => ({
    background: active ? t.accent : "transparent",
    color: active ? t.onAccent : "#bbb",
    border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.15)",
    borderRadius: t.pill,
  });

  const todayDow = parse(todayStr).getDay();
  const dayItems = items.filter((i) => i.day_of_week === day);
  const shownLib = library.filter(
    (x) => (cat === "All" || x.category === cat) && (!q || x.name.toLowerCase().includes(q.toLowerCase()))
  );

  function row(key: string, ex: ExerciseInfo, sub: string, onClick: () => void, done = false) {
    return (
      <motion.button key={key} whileTap={{ scale: 0.98 }} onClick={onClick} className="w-full p-2.5 flex items-center gap-3 text-left" style={card}>
        <div className="relative w-16 h-16 shrink-0">
          <Photo src={exerciseImage(ex)} fallback="/images/fullbody.jpg" className="w-16 h-16 object-cover grayscale" style={{ borderRadius: t.small }} />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: t.accent, color: t.onAccent }}>
            <FitIcon category={ex.category} size={14} />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={done ? "line-through text-gray-500" : ""}>{ex.name}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
        {done ? (
          <span className="w-7 h-7 rounded-full flex items-center justify-center mr-1" style={{ background: t.accent, color: t.onAccent }}><Check size={14} strokeWidth={3} /></span>
        ) : ex.youtube_url ? (
          <span className="w-7 h-7 rounded-full flex items-center justify-center mr-1" style={{ background: `${t.accent}22`, color: t.accent }}><Play size={12} fill={t.accent} /></span>
        ) : (
          <ChevronRight size={18} className="text-gray-500 mr-1" />
        )}
      </motion.button>
    );
  }

  return (
    <div>
      <h1 className="mt-8 text-4xl leading-none">
        Your<br /><span style={{ color: t.accent }}>workouts</span>
      </h1>

      <div className="mt-6 grid grid-cols-2 p-1" style={{ background: t.card, borderRadius: t.pill }}>
        {(["plan", "library"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className="py-2 text-sm" style={chip(view === v)}>
            {v === "plan" ? "My plan" : "Exercise library"}
          </button>
        ))}
      </div>

      {view === "plan" && (
        <>
          <p className="mt-5 text-xs text-gray-400">{planTitle || "No plan assigned yet"}</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {WEEK_ORDER.map((d) => {
              const count = items.filter((i) => i.day_of_week === d).length;
              return (
                <button key={d} onClick={() => setDay(d)} className="px-4 py-2 text-sm shrink-0 relative" style={chip(day === d)}>
                  {DAY_NAMES[d]}
                  {count > 0 && day !== d && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: t.accent }} />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-2">
            {dayItems.length === 0 && (
              <div className="p-6 flex flex-col items-center gap-2 text-sm text-gray-400" style={card}>
                <FitIcon icon={FIT.rest} size={30} color={t.accent} />
                Rest day
              </div>
            )}
            {dayItems.map((i) =>
              i.exercises
                ? row(
                    i.id,
                    i.exercises,
                    `${i.sets} sets × ${i.reps} reps${i.rest_seconds ? ` · ${i.rest_seconds}s rest` : ""}`,
                    () => setDetail({ ...i.exercises!, key: i.id, meta: `${i.sets} sets × ${i.reps} reps` }),
                    day === todayDow && doneToday.includes(i.exercise_id)
                  )
                : null
            )}
          </div>
        </>
      )}

      {view === "library" && (
        <>
          <div className="mt-5 flex items-center gap-2 px-4" style={{ background: t.card, borderRadius: t.pill }}>
            <Search size={18} className="text-gray-500" />
            <input placeholder="Search exercises..." value={q} onChange={(e) => setQ(e.target.value)}
              className="flex-1 py-3 outline-none bg-transparent" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {["All", ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCat(c)} className="px-3.5 py-2 text-sm shrink-0 flex items-center gap-1.5" style={chip(cat === c)}>
                <FitIcon category={c === "All" ? null : c} icon={c === "All" ? FIT.run : undefined} size={16} />
                {c}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {shownLib.map((x) => row(x.id, x, x.category || "", () => setDetail({ ...x, key: x.id })))}
            {shownLib.length === 0 && <p className="text-center text-sm text-gray-500 py-6">No exercises found.</p>}
          </div>
        </>
      )}

      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={() => setDetail(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26 }}
              className="w-full max-w-md mx-auto p-4 pb-8" onClick={(e) => e.stopPropagation()}
              style={{ background: t.card, borderTopLeftRadius: t.radius, borderTopRightRadius: t.radius }}>
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
              <VideoBox key={detail.key} theme={t} url={detail.youtube_url} image={exerciseImage(detail)} name={detail.name} className="h-60" />
              <div className="px-1">
                <p className="mt-4 text-3xl leading-tight">{detail.name}</p>
                <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: t.accent }}>
                  <FitIcon category={detail.category} size={16} /> {detail.category}{detail.meta ? ` · ${detail.meta}` : ""}
                </p>
                <p className="mt-3 text-sm text-gray-300">{detail.instructions || "Ask your trainer for form tips on this one."}</p>
                <button onClick={() => setDetail(null)} className="mt-5 w-full py-3" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>Got it</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}