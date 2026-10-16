"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Trophy, Clock, Dumbbell, Flame, Lightbulb, Plus, SkipForward, Check } from "lucide-react";
import Photo from "./Photo";
import VideoBox from "./VideoBox";
import FitIcon from "./FitIcon";
import { mmss, exerciseImage, type Item, type Theme } from "./types";

type Props = {
  theme: Theme;
  items: Item[];
  doneToday: string[];
  streak: number;
  onComplete: (exerciseId: string) => void;
  onClose: () => void;
  onMusic: () => void;
};

export default function WorkoutMode({ theme: t, items, doneToday, streak, onComplete, onClose, onMusic }: Props) {
  const [baseDone] = useState(() => (items.every((i) => doneToday.includes(i.exercise_id)) ? [] : doneToday));
  const [idx, setIdx] = useState(() => Math.max(0, items.findIndex((i) => !baseDone.includes(i.exercise_id))));
  const [setNo, setSetNo] = useState(1);
  const [phase, setPhase] = useState<"work" | "rest" | "finished">("work");
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (phase === "finished") return;
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
      setRestLeft((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "rest" && restLeft === 0) {
      setPhase("work");
      if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
    }
  }, [restLeft, phase]);

  const item = items[idx];
  const totalSets = item?.sets || 1;

  function startRest(sec: number) {
    setRestTotal(sec);
    setRestLeft(sec);
    setPhase("rest");
  }

  function nextIndex(from: number, done: string[]) {
    for (let k = from + 1; k < items.length; k++) if (!done.includes(items[k].exercise_id)) return k;
    return -1;
  }

  function setDone() {
    if (!item) return;
    if (navigator.vibrate) navigator.vibrate(30);
    if (setNo < totalSets) {
      setSetNo((s) => s + 1);
      startRest(item.rest_seconds || 60);
      return;
    }
    onComplete(item.exercise_id);
    const done = [...baseDone, ...completed, item.exercise_id];
    setCompleted((c) => [...c, item.exercise_id]);
    const n = nextIndex(idx, done);
    if (n === -1) return setPhase("finished");
    setIdx(n);
    setSetNo(1);
    startRest(item.rest_seconds || 60);
  }

  function skipExercise() {
    const n = nextIndex(idx, [...baseDone, ...completed]);
    if (n === -1) return setPhase("finished");
    setIdx(n);
    setSetNo(1);
    setPhase("work");
  }

  const R = 70;
  const C = 2 * Math.PI * R;
  const next = items[nextIndex(idx, [...baseDone, ...completed])];
  const iconBtn = { background: t.card, borderRadius: t.pill };

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28 }}
      className="fixed inset-0 z-40 overflow-y-auto" style={{ background: t.bg }}>
      <div className="max-w-md mx-auto px-5 pt-6 pb-10">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center" style={iconBtn} aria-label="Close"><X size={18} /></button>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Elapsed</p>
            <p className="text-xl tabular-nums">{mmss(elapsed)}</p>
          </div>
          <button onClick={onMusic} className="w-10 h-10 flex items-center justify-center" style={iconBtn} aria-label="Music"><Music size={18} /></button>
        </div>

        {items.length === 0 && <p className="mt-20 text-center text-gray-400">No exercises today.</p>}

        {phase === "finished" && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-14 text-center">
            <motion.div className="mx-auto w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: t.accent, color: t.onAccent }}
              animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }} transition={{ repeat: 2, duration: 0.6 }}>
              <Trophy size={52} />
            </motion.div>
            <h2 className="mt-6 text-4xl leading-none">
              Workout<br /><span style={{ color: t.accent }}>complete!</span>
            </h2>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[
                { label: "Time", value: mmss(elapsed), Icon: Clock },
                { label: "Exercises", value: String(completed.length), Icon: Dumbbell },
                { label: "Streak", value: `${Math.max(streak, 1)} days`, Icon: Flame },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="p-4 flex flex-col items-center gap-1" style={{ background: t.card, borderRadius: t.radius }}>
                  <Icon size={18} color={t.accent} />
                  <p className="text-lg">{value}</p>
                  <p className="text-[11px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="mt-8 w-full py-4 text-lg" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
              Back home
            </button>
          </motion.div>
        )}

        {phase !== "finished" && item && (
          <>
            <div className="mt-5 relative">
              <VideoBox key={item.id} theme={t} url={item.exercises?.youtube_url || null} image={exerciseImage(item.exercises)} name={item.exercises?.name} className="h-64" />
              <span className="absolute top-3 right-3 px-3 py-1 text-xs bg-black/70 pointer-events-none" style={{ borderRadius: t.pill }}>
                {idx + 1} / {items.length}
              </span>
            </div>

            <p className="mt-5 text-xs flex items-center gap-1.5" style={{ color: t.accent }}>
              <FitIcon category={item.exercises?.category} size={16} /> {item.exercises?.category}
            </p>
            <h2 className="text-3xl leading-tight">{item.exercises?.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{item.reps} reps · Set {setNo} of {totalSets}</p>

            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: totalSets }).map((_, i) => (
                <motion.span key={i} className="flex-1 h-2 rounded-full"
                  animate={{ background: i < setNo - (phase === "rest" ? 0 : 1) ? t.accent : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {phase === "rest" ? (
                <motion.div key="rest" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col items-center">
                  <div className="relative">
                    <svg width="170" height="170" viewBox="0 0 170 170">
                      <circle cx="85" cy="85" r={R} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                      <circle cx="85" cy="85" r={R} stroke={t.accent} strokeWidth="10" fill="none" strokeLinecap="round"
                        strokeDasharray={C} strokeDashoffset={C * (1 - restLeft / restTotal)} transform="rotate(-90 85 85)"
                        style={{ transition: "stroke-dashoffset 1s linear" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs text-gray-400">Rest</p>
                      <p className="text-4xl tabular-nums">{mmss(restLeft)}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3 w-full">
                    <button onClick={() => { setRestLeft((r) => r + 15); setRestTotal((r) => r + 15); }} className="py-3 text-sm flex items-center justify-center gap-1"
                      style={{ background: t.card, borderRadius: t.pill }}>
                      <Plus size={16} /> 15 sec
                    </button>
                    <button onClick={() => setRestLeft(0)} className="py-3 text-sm flex items-center justify-center gap-1"
                      style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
                      Skip rest <SkipForward size={16} />
                    </button>
                  </div>
                  {setNo === 1 && <p className="mt-4 text-xs text-gray-400">Up next: {item.exercises?.name}</p>}
                </motion.div>
              ) : (
                <motion.div key="work" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={setDone} className="w-full py-5 text-xl flex items-center justify-center gap-2"
                    style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
                    <Check size={22} strokeWidth={3} />
                    {setNo < totalSets ? `Set ${setNo} done` : "Finish exercise"}
                  </motion.button>
                  <button onClick={skipExercise} className="mt-3 w-full py-3 text-sm text-gray-400 flex items-center justify-center gap-1">
                    Skip exercise <SkipForward size={14} />
                  </button>
                  {item.exercises?.instructions && (
                    <div className="mt-4 p-4 flex gap-3 text-sm text-gray-300" style={{ background: t.card, borderRadius: t.radius }}>
                      <Lightbulb size={18} color={t.accent} className="shrink-0 mt-0.5" />
                      {item.exercises.instructions}
                    </div>
                  )}
                  {next && next.id !== item.id && (
                    <div className="mt-4 p-2.5 flex items-center gap-3" style={{ background: t.card, borderRadius: t.radius }}>
                      <Photo src={exerciseImage(next.exercises)} fallback="/images/fullbody.jpg" className="w-12 h-12 object-cover grayscale shrink-0" style={{ borderRadius: t.small }} />
                      <div>
                        <p className="text-[11px] text-gray-400">Up next</p>
                        <p className="text-sm">{next.exercises?.name}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}