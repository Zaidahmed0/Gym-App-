"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { FONTS, BACKGROUNDS, textOn, type Branding } from "@/utils/theme";
import Photo from "./home/Photo";

export default function MemberLogin() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [gym, setGym] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.rpc("get_gym_branding", { p_slug: slug });
      const g = (data as Branding[] | null)?.[0];
      if (!g) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setGym(g);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
        if (p?.role === "member" && p.gym_id === g.id) {
          router.replace(`/g/${slug}/home`);
          return;
        }
      }
      setLoading(false);
    }
    init();
  }, [slug]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!gym) return;
    setBusy(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      setBusy(false);
      return setMessage("Wrong email or password.");
    }

    const { data: p } = await supabase.from("profiles").select("role, gym_id").eq("id", data.user.id).single();
    if (p?.role !== "member" || p.gym_id !== gym.id) {
      await supabase.auth.signOut();
      setBusy(false);
      return setMessage(`This account isn't a member of ${gym.name}.`);
    }
    router.replace(`/g/${slug}/home`);
  }

  if (loading) return <main className="min-h-screen bg-black" />;
  if (notFound || !gym) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
        <p className="text-gray-400">This gym link doesn&apos;t exist. Check with your gym.</p>
      </main>
    );
  }

  const accent = gym.accent_color;
  const onAccent = textOn(accent);
  const bg = BACKGROUNDS[gym.theme_bg || "midnight"];
  const font = FONTS[gym.font_style || "bold"];
  const sharp = gym.card_style === "sharp";
  const radius = sharp ? "8px" : "18px";

  return (
    <main className={`min-h-screen text-white flex flex-col ${font.className}`} style={{ background: bg.bg }}>
      <div className="relative h-[52vh] max-h-[480px] overflow-hidden">
        <Photo src="/images/hero.jpg" className="absolute inset-0 w-full h-full object-cover grayscale" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${bg.bg} 5%, transparent 60%)` }} />
        <svg className="absolute -left-10 bottom-6 w-[140%] h-48" viewBox="0 0 400 200" aria-hidden="true">
          <motion.path d="M-20 160 C60 190 90 60 170 90 S280 20 420 50" stroke={accent} strokeWidth="26" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <div className="relative max-w-md mx-auto px-6 pt-8 flex items-center gap-3">
          {gym.logo_url ? (
            <img src={gym.logo_url} alt="" className="w-12 h-12 object-cover" style={{ borderRadius: radius }} />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center" style={{ background: accent, color: onAccent, borderRadius: radius }}>
              {gym.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="drop-shadow">{gym.name}</span>
        </div>
      </div>

      <motion.form onSubmit={login} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="relative max-w-md w-full mx-auto px-6 pb-10 -mt-4">
        <h1 className="text-5xl leading-none">
          Let&apos;s get<br /><span style={{ color: accent }}>moving</span>
        </h1>
        <p className="mt-3 mb-7 text-sm text-gray-400">{gym.tagline || "Log in to see today's workout."}</p>

        <label className="flex items-center gap-3 px-4 mb-3" style={{ background: bg.card, borderRadius: radius }}>
          <Mail size={18} className="text-gray-500" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="flex-1 py-4 outline-none bg-transparent" />
        </label>
        <label className="flex items-center gap-3 px-4 mb-5" style={{ background: bg.card, borderRadius: radius }}>
          <Lock size={18} className="text-gray-500" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="flex-1 py-4 outline-none bg-transparent" />
        </label>

        <motion.button whileTap={{ scale: 0.96 }} type="submit" disabled={busy} className="w-full py-4 text-lg flex items-center justify-center gap-2"
          style={{ background: accent, color: onAccent, borderRadius: sharp ? "8px" : "999px" }}>
          {busy ? "Logging in..." : <>Let&apos;s go <ArrowRight size={20} /></>}
        </motion.button>

        {message && <p className="mt-4 text-center text-sm text-red-400">{message}</p>}
        <p className="mt-6 text-center text-xs text-gray-500">Forgot password? Ask your gym to reset it.</p>
      </motion.form>
    </main>
  );
}