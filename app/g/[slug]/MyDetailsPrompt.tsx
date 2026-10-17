"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, X, Check, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BACKGROUNDS, textOn, formatDate } from "@/utils/theme";
import { updateMyDetails } from "./details-actions";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = [["male", "Male"], ["female", "Female"], ["other", "Other"]];
const RELATIONS = ["Father", "Mother", "Spouse", "Brother", "Sister", "Friend", "Other"];

type Form = {
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  emergency_name: string;
  emergency_relation: string;
  emergency_phone: string;
  medical_notes: string;
  address: string;
  occupation: string;
};

const EMPTY: Form = {
  phone: "", date_of_birth: "", gender: "", blood_group: "", emergency_name: "",
  emergency_relation: "", emergency_phone: "", medical_notes: "", address: "", occupation: "",
};

export default function MyDetailsPrompt() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [accent, setAccent] = useState("#D4F75C");
  const [bg, setBg] = useState(BACKGROUNDS.midnight);
  const [sharp, setSharp] = useState(false);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [{ data: b }, { data: p }, { data: st }] = await Promise.all([
      supabase.rpc("get_gym_branding", { p_slug: slug }),
      supabase.from("profiles")
        .select("full_name, role, phone, date_of_birth, gender, blood_group, emergency_name, emergency_relation, emergency_phone, medical_notes, address, occupation")
        .eq("id", user.id).single(),
      supabase.from("member_settings").select("goal").eq("member_id", user.id).maybeSingle(),
    ]);
    const brand = (b as { accent_color: string; theme_bg: string | null; card_style: string | null }[] | null)?.[0];
    if (brand) {
      setAccent(brand.accent_color);
      setBg(BACKGROUNDS[brand.theme_bg || "midnight"] || BACKGROUNDS.midnight);
      setSharp(brand.card_style === "sharp");
    }
    if (!p || p.role !== "member") return null;
    setName((p.full_name || "").split(" ")[0]);
    const next = { ...EMPTY };
    (Object.keys(EMPTY) as (keyof Form)[]).forEach((k) => { next[k] = ((p as Record<string, unknown>)[k] as string) || ""; });
    setForm(next);
    return { p, hasGoal: !!st?.goal };
  }

  useEffect(() => {
    const handler = async () => {
      setDone(false);
      setError("");
      await loadProfile();
      setOpen(true);
    };
    window.addEventListener("open-my-details", handler);
    return () => window.removeEventListener("open-my-details", handler);
  }, [slug]);

  useEffect(() => {
    async function check() {
      if (!pathname?.endsWith("/home")) return;
      const res = await loadProfile();
      if (!res) return;
      const missing = !res.p.emergency_phone || !res.p.blood_group;
      if (missing && res.hasGoal && localStorage.getItem("details-later") !== formatDate(new Date())) {
        setTimeout(() => setOpen(true), 900);
      }
    }
    check();
  }, [pathname, slug]);

  function later() {
    localStorage.setItem("details-later", formatDate(new Date()));
    setOpen(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await updateMyDetails(form);
    setSaving(false);
    if ("error" in res && res.error) return setError(res.error);
    setDone(true);
    if (navigator.vibrate) navigator.vibrate([40, 30, 80]);
    setTimeout(() => setOpen(false), 1400);
  }

  const onAccent = textOn(accent);
  const radius = sharp ? "8px" : "18px";
  const pill = sharp ? "8px" : "999px";
  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const input = (k: keyof Form, label: string, type = "text", placeholder = "") => (
    <label className="block p-3.5" style={{ background: bg.card, borderRadius: radius }}>
      <span className="block text-[11px] text-gray-400">{label}</span>
      <input type={type} value={form[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)}
        className="mt-1 w-full bg-transparent outline-none text-base" />
    </label>
  );

  const chip = (active: boolean) => ({
    background: active ? accent : bg.card,
    color: active ? onAccent : "#ddd",
    borderRadius: pill,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[66] overflow-y-auto text-white" style={{ background: bg.bg }}>
          <div className="max-w-md mx-auto px-5 pt-6 pb-32">
            {!done ? (
              <>
                <div className="flex justify-between items-center">
                  <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 12 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${accent}22`, color: accent }}>
                    <HeartPulse size={24} />
                  </motion.span>
                  <button onClick={later} className="text-xs text-gray-400 flex items-center gap-1">Later <X size={14} /></button>
                </div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-4xl leading-none">
                  Stay safe,<br /><span className="italic" style={{ color: accent }}>{name || "champ"}</span>
                </motion.h1>
                <p className="mt-3 text-sm text-gray-400">If anything happens during a workout, your gym will know who to call.</p>

                <p className="mt-8 mb-3 text-xs uppercase tracking-widest text-gray-500">Emergency contact</p>
                <div className="grid gap-2.5">
                  {input("emergency_name", "Name", "text", "Who should we call?")}
                  <div className="flex flex-wrap gap-2">
                    {RELATIONS.map((r) => (
                      <button key={r} onClick={() => set("emergency_relation", r)} className="px-3.5 py-2 text-sm" style={chip(form.emergency_relation === r)}>{r}</button>
                    ))}
                  </div>
                  {input("emergency_phone", "Phone number", "tel", "10 digit mobile")}
                </div>

                <p className="mt-8 mb-3 text-xs uppercase tracking-widest text-gray-500">Health</p>
                <p className="mb-2 text-[11px] text-gray-400">Blood group</p>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD.map((b) => (
                    <motion.button whileTap={{ scale: 0.9 }} key={b} onClick={() => set("blood_group", b)} className="py-3 text-lg"
                      style={{ background: form.blood_group === b ? accent : bg.card, color: form.blood_group === b ? onAccent : "#fff", borderRadius: radius }}>
                      {b}
                    </motion.button>
                  ))}
                </div>
                <label className="mt-2.5 block p-3.5" style={{ background: bg.card, borderRadius: radius }}>
                  <span className="block text-[11px] text-gray-400">Injuries or medical conditions</span>
                  <textarea value={form.medical_notes} onChange={(e) => set("medical_notes", e.target.value)} rows={2}
                    placeholder="Knee pain, back injury, BP, asthma... or leave empty" className="mt-1 w-full bg-transparent outline-none text-base resize-none" />
                </label>

                <p className="mt-8 mb-3 text-xs uppercase tracking-widest text-gray-500">About you</p>
                <div className="grid gap-2.5">
                  {input("phone", "Your phone", "tel")}
                  {input("date_of_birth", "Date of birth", "date")}
                  <div className="flex gap-2">
                    {GENDERS.map(([k, l]) => (
                      <button key={k} onClick={() => set("gender", k)} className="flex-1 py-3 text-sm" style={chip(form.gender === k)}>{l}</button>
                    ))}
                  </div>
                  {input("occupation", "Occupation", "text", "Student, job, business...")}
                  {input("address", "Area / address")}
                </div>

                <p className="mt-6 flex items-center gap-2 text-[11px] text-gray-500">
                  <ShieldCheck size={14} /> Only you and your gym can see these details.
                </p>
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
              </>
            ) : (
              <div className="mt-40 text-center">
                <motion.div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: accent, color: onAccent }}
                  initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  <Check size={44} strokeWidth={3} />
                </motion.div>
                <h1 className="mt-6 text-4xl leading-none">All <span className="italic" style={{ color: accent }}>set!</span></h1>
                <p className="mt-3 text-sm text-gray-400">Your gym has your details now.</p>
              </div>
            )}
          </div>

          {!done && (
            <div className="fixed bottom-0 inset-x-0 p-5" style={{ background: `linear-gradient(0deg, ${bg.bg} 70%, transparent)` }}>
              <motion.button whileTap={{ scale: 0.96 }} disabled={saving} onClick={save}
                className="max-w-md mx-auto block w-full py-4 text-lg font-bold" style={{ background: accent, color: onAccent, borderRadius: pill }}>
                {saving ? "Saving..." : "Save my details"}
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}