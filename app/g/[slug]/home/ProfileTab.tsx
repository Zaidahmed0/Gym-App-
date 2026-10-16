"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Star, CalendarDays, Music, Droplet, KeyRound, LogOut, ChevronRight, Minus, Plus, BadgeCheck } from "lucide-react";
import type { Me, Membership, Settings, Theme } from "./types";

type Props = {
  theme: Theme;
  me: Me;
  membership: Membership | null;
  daysLeft: number;
  streak: number;
  level: number;
  levelPct: number;
  totalDays: number;
  settings: Settings;
  onSaveSettings: (s: Partial<Settings>) => Promise<void>;
  onPassword: (p: string) => Promise<string>;
  onLogout: () => void;
  onMusic: () => void;
};

export default function ProfileTab(p: Props) {
  const t = p.theme;
  const card = { background: t.card, borderRadius: t.radius };
  const soft = `${t.accent}22`;
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const result = await p.onPassword(pass);
    setMsg(result);
    if (result === "Password changed") setPass("");
  }

  const waterGoal = p.settings.water_goal || 8;
  const stats = [
    { label: "Streak", value: p.streak, Icon: Flame },
    { label: "Level", value: p.level, Icon: Star },
    { label: "Days", value: p.totalDays, Icon: CalendarDays },
  ];

  return (
    <div>
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="relative w-24 h-24">
          <motion.div className="absolute inset-0 rounded-full" style={{ border: `2px dashed ${t.accent}` }}
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} />
          <div className="absolute inset-1.5 rounded-full flex items-center justify-center text-3xl"
            style={{ background: t.accent, color: t.onAccent }}>
            {p.me.full_name.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <p className="mt-3 text-2xl flex items-center gap-1.5">
          {p.me.full_name} <BadgeCheck size={20} color={t.accent} />
        </p>
        <p className="text-sm text-gray-400">{p.me.email}</p>
      </div>

      <div className="mt-6 grid grid-cols-3 text-center py-4" style={card}>
        {stats.map(({ label, value, Icon }, i) => (
          <div key={label} className={i === 1 ? "border-x border-white/10" : ""}>
            <div className="flex items-center justify-center gap-1.5">
              <Icon size={18} color={t.accent} fill={label === "Calendar" ? "none" : label === "Days" ? "none" : t.accent} />
              <p className="text-xl">{value}</p>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 p-5" style={card}>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Level {p.level}</span>
          <span style={{ color: t.accent }}>Level {p.level + 1}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: t.accent }} initial={{ width: 0 }} animate={{ width: `${p.levelPct * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-400">{5 - Math.round(p.levelPct * 5)} more workout days to level up</p>
      </div>

      <div className="mt-3 p-5" style={card}>
        <p className="text-xs text-gray-400">Membership</p>
        <p className="text-xl mt-1">{p.membership?.plan_name}</p>
        <p className="text-sm text-gray-400 mt-1">{p.membership?.start_date} → {p.membership?.end_date}</p>
        <p className="mt-3 text-sm" style={{ color: p.daysLeft <= 7 ? "#fdba74" : t.accent }}>{p.daysLeft} days left</p>
      </div>

      <button onClick={p.onMusic} className="mt-3 w-full p-4 flex items-center gap-3 text-left" style={card}>
        <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: soft, color: t.accent }}>
          <Music size={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm">Workout music</p>
          <p className="text-xs text-gray-400">{p.settings.spotify_url ? "Spotify playlist connected" : "Add your Spotify playlist"}</p>
        </div>
        <ChevronRight size={18} className="text-gray-500" />
      </button>

      <div className="mt-3 p-4 flex items-center gap-3" style={card}>
        <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#4DD8FF22", color: "#4DD8FF" }}>
          <Droplet size={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm">Daily water goal</p>
          <p className="text-xs text-gray-400">{waterGoal} glasses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => p.onSaveSettings({ water_goal: Math.max(1, waterGoal - 1) })} className="w-9 h-9 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", borderRadius: t.pill }} aria-label="Decrease"><Minus size={16} /></button>
          <button onClick={() => p.onSaveSettings({ water_goal: Math.min(20, waterGoal + 1) })} className="w-9 h-9 flex items-center justify-center"
            style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }} aria-label="Increase"><Plus size={16} /></button>
        </div>
      </div>

      <form onSubmit={changePassword} className="mt-3 p-4" style={card}>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: soft, color: t.accent }}>
            <KeyRound size={18} />
          </span>
          <p className="text-sm">Change password</p>
        </div>
        <input type="password" placeholder="New password" value={pass} onChange={(e) => setPass(e.target.value)}
          className="w-full px-4 py-3 outline-none bg-black/30" style={{ borderRadius: t.small }} />
        <button type="submit" className="mt-3 w-full py-3" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>Update password</button>
        {msg && <p className="mt-2 text-xs" style={{ color: t.accent }}>{msg}</p>}
      </form>

      <button onClick={p.onLogout} className="mt-6 w-full py-3 text-sm border border-white/20 flex items-center justify-center gap-2" style={{ borderRadius: t.pill }}>
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}