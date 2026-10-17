"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { textOn } from "@/utils/theme";

type Gym = { name: string; slug: string; logo_url: string | null; accent_color: string };

const ACCENT = "#D4F75C";

export default function StartPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Gym[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
        if (p?.role === "member" && p.gym_id) {
          const { data: g } = await supabase.from("gyms").select("slug").eq("id", p.gym_id).single();
          if (g) return router.replace(`/g/${g.slug}/home`);
        }
        if (p?.role === "owner") return router.replace("/owner");
        if (p?.role === "super_admin") return router.replace("/admin");
      }
      const last = localStorage.getItem("last-gym");
      if (last) return router.replace(`/g/${last}`);
      setChecking(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase.rpc("search_gyms", { q });
      setResults((data as Gym[]) || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  function choose(g: Gym) {
    localStorage.setItem("last-gym", g.slug);
    router.push(`/g/${g.slug}`);
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <motion.div className="w-14 h-14 rounded-2xl" style={{ background: ACCENT }}
          animate={{ rotate: [0, 90, 180, 270, 360], borderRadius: ["20%", "50%", "20%"] }} transition={{ repeat: Infinity, duration: 1.4 }} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 pt-16 pb-10 flex flex-col">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col">
        <motion.span initial={{ rotate: -10, scale: 0 }} animate={{ rotate: -2, scale: 1 }} transition={{ type: "spring", damping: 12 }}
          className="self-start text-xl font-black px-3 py-1 text-black" style={{ background: ACCENT }}>
          GymPulse
        </motion.span>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-10 text-5xl font-black leading-[0.9]">
          FIND YOUR<br /><span className="italic" style={{ color: ACCENT }}>GYM.</span>
        </motion.h1>
        <p className="mt-4 text-gray-400">Search your gym&apos;s name, then log in with the details your gym gave you.</p>

        <div className="mt-8 flex items-center gap-3 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-[#D4F75C] transition-colors">
          <Search size={20} className="text-gray-500" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gym name"
            className="flex-1 py-4 bg-transparent outline-none text-lg" />
        </div>

        <div className="mt-4 grid gap-2">
          {searching && <p className="text-sm text-gray-500 px-1">Searching...</p>}
          <AnimatePresence>
            {results.map((g, i) => (
              <motion.button key={g.slug} onClick={() => choose(g)}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-2xl bg-zinc-900 flex items-center gap-3 text-left">
                {g.logo_url ? (
                  <img src={g.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center font-black"
                    style={{ background: g.accent_color, color: textOn(g.accent_color) }}>
                    {g.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="flex-1 font-bold">{g.name}</span>
                <ArrowRight size={18} style={{ color: g.accent_color }} />
              </motion.button>
            ))}
          </AnimatePresence>
          {!searching && q.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-gray-500 px-1">No gym found. Check the spelling or ask your gym for their app link.</p>
          )}
        </div>

        <Link href="/login" className="mt-auto pt-10 text-center text-sm text-gray-500">
          Gym owner? <span className="underline underline-offset-4">Log in here</span>
        </Link>
      </div>
    </main>
  );
}