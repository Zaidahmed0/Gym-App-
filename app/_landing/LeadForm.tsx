"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LeadForm({ accent }: { accent: string }) {
  const [name, setName] = useState("");
  const [gym, setGym] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid phone number.");
    setBusy(true);
    setError("");
    const { error } = await createClient().from("leads").insert({ name, gym_name: gym, phone, city });
    setBusy(false);
    if (error) return setError("Something went wrong. Please try WhatsApp instead.");
    setDone(true);
  }

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="p-8 rounded-3xl bg-zinc-900 text-center">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-black" style={{ background: accent }}>
          <Check size={30} strokeWidth={3} />
        </div>
        <p className="mt-4 text-2xl font-bold">You&apos;re on the list!</p>
        <p className="mt-2 text-gray-400">We&apos;ll call you within 24 hours to set up your demo.</p>
      </motion.div>
    );
  }

  const input = "w-full px-5 py-4 rounded-2xl bg-black border border-zinc-800 outline-none focus:border-white/40 transition-colors";

  return (
    <form onSubmit={submit} className="p-6 md:p-8 rounded-3xl bg-zinc-900 grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className={input} />
        <input placeholder="Gym name" value={gym} onChange={(e) => setGym(e.target.value)} className={input} />
        <input placeholder="Phone (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} required className={input} />
        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className={input} />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={busy}
        className="mt-2 py-4 rounded-2xl font-bold text-black flex items-center justify-center gap-2" style={{ background: accent }}>
        {busy ? "Sending..." : <>Book my free demo <ArrowRight size={18} /></>}
      </motion.button>
      <p className="text-xs text-gray-500 text-center">No spam. We&apos;ll only use this to set up your demo.</p>
    </form>
  );
}