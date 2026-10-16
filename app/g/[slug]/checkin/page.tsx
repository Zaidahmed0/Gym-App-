"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, RotateCw, CalendarCheck, Trophy, ArrowRight } from "lucide-react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { FONTS, BACKGROUNDS, textOn, type Branding } from "@/utils/theme";
import Photo from "../home/Photo";
import { checkIn } from "./actions";

const QUOTES = [
  "The hardest rep is walking through the door. Done.",
  "Discipline beats motivation. You showed up.",
  "Every rep is a vote for the person you want to be.",
  "Sweat now, shine later.",
  "No shortcuts. Just sets and reps.",
  "You didn't find time. You made it.",
  "Strong is built one day at a time.",
  "Your only competition is yesterday's you.",
  "Consistency is the real cheat code.",
  "Show up. Lift. Repeat.",
  "Be stronger than your excuses.",
  "Earn your rest day.",
  "Today's sweat is tomorrow's strength.",
  "Champions train when nobody's watching.",
  "One more day closer to your goal.",
];

const DEFAULT_IMAGES = ["/images/hero.jpg", "/images/fullbody.jpg?v=a", "/images/chest.jpg?v=b", "/images/back.jpg?v=c", "/images/arms.jpg?v=d"];

type Success = {
  ok: true;
  already: boolean;
  name: string;
  gymName: string;
  visitsThisMonth: number;
  totalVisits: number;
  images: string[];
};

export default function CheckInPage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const code = search.get("code");
  const router = useRouter();
  const supabase = createClient();

  const [gym, setGym] = useState<Branding | null>(null);
  const [stage, setStage] = useState<"loading" | "locating" | "done" | "error" | "location">("loading");
  const [result, setResult] = useState<Success | null>(null);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState("");
  const [image, setImage] = useState("/images/hero.jpg");

  const loginUrl = `/g/${slug}?next=${encodeURIComponent(`/g/${slug}/checkin${code ? `?code=${code}` : ""}`)}`;

  async function run() {
    setStage("locating");
    setError("");
    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      if (!("geolocation" in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      });
    });

    const res = (await checkIn({
      slug,
      code,
      lat: position?.coords.latitude ?? null,
      lng: position?.coords.longitude ?? null,
      accuracy: position?.coords.accuracy ?? null,
    })) as Success | { error: string };

    if ("ok" in res && res.ok) {
      const pool = res.images.length ? res.images : DEFAULT_IMAGES;
      setImage(pool[Math.floor(Math.random() * pool.length)]);
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      setResult(res);
      setStage("done");
      if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
      return;
    }

    const err = (res as { error: string }).error;
    if (err === "login") return router.replace(loginUrl);
    if (err === "location") return setStage("location");
    setError(err);
    setStage("error");
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.rpc("get_gym_branding", { p_slug: slug });
      const g = (data as Branding[] | null)?.[0];
      if (g) setGym(g);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace(loginUrl);
      run();
    }
    init();
  }, [slug]);

  const confetti = useMemo(
    () =>
      stage === "done"
        ? Array.from({ length: 28 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.6,
            duration: 1.8 + Math.random() * 1.4,
            size: 6 + Math.random() * 8,
            rotate: Math.random() * 360,
            white: i % 3 === 0,
          }))
        : [],
    [stage]
  );

  const accent = gym?.accent_color || "#D4F75C";
  const onAccent = textOn(accent);
  const bg = BACKGROUNDS[gym?.theme_bg || "midnight"];
  const font = FONTS[gym?.font_style || "bold"];
  const pill = gym?.card_style === "sharp" ? "8px" : "999px";
  const radius = gym?.card_style === "sharp" ? "8px" : "24px";

  return (
    <main className={`min-h-screen text-white relative overflow-hidden ${font.className}`} style={{ background: bg.bg }}>
      {stage === "done" &&
        confetti.map((c) => (
          <motion.span key={c.id} className="absolute top-0 z-20 pointer-events-none"
            style={{ left: `${c.left}%`, width: c.size, height: c.size * 0.45, background: c.white ? "#fff" : accent, borderRadius: 2 }}
            initial={{ y: -30, rotate: c.rotate, opacity: 1 }}
            animate={{ y: "105vh", rotate: c.rotate + 540, opacity: [1, 1, 0] }}
            transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }} />
        ))}

      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {(stage === "loading" || stage === "locating") && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: `${accent}22`, color: accent }}
              animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
              <MapPin size={40} />
            </motion.div>
            <p className="mt-6 text-2xl">Checking you in...</p>
            <p className="mt-2 text-sm text-gray-400">Making sure you&apos;re at {gym?.name || "the gym"}</p>
          </div>
        )}

        {stage === "location" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${accent}22`, color: accent }}>
              <MapPin size={34} />
            </div>
            <p className="mt-6 text-3xl leading-none">Turn on<br /><span style={{ color: accent }}>location</span></p>
            <p className="mt-4 text-sm text-gray-400">
              We need your location to confirm you&apos;re at the gym. Allow location for this app in your phone settings, then try again.
            </p>
            <button onClick={run} className="mt-6 px-6 py-3 flex items-center gap-2" style={{ background: accent, color: onAccent, borderRadius: pill }}>
              <RotateCw size={16} /> Try again
            </button>
          </div>
        )}

        {stage === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500/15 text-red-400">
              <MapPin size={34} />
            </div>
            <p className="mt-6 text-3xl leading-none">Couldn&apos;t<br /><span className="text-red-400">check in</span></p>
            <p className="mt-4 text-sm text-gray-300">{error}</p>
            <div className="mt-6 flex gap-2">
              <button onClick={run} className="px-5 py-3 text-sm flex items-center gap-2 border border-white/20" style={{ borderRadius: pill }}>
                <RotateCw size={14} /> Try again
              </button>
              <button onClick={() => router.push(`/g/${slug}/home`)} className="px-5 py-3 text-sm" style={{ background: accent, color: onAccent, borderRadius: pill }}>
                Go home
              </button>
            </div>
          </div>
        )}

        {stage === "done" && result && (
          <>
            <div className="relative h-[46vh] overflow-hidden">
              <Photo src={image} fallback="/images/hero.jpg" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${bg.bg} 4%, transparent 65%)` }} />
              <motion.div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: accent, color: onAccent, boxShadow: `0 0 0 12px ${accent}33` }}
                initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10, delay: 0.2 }}>
                <motion.span animate={{ rotate: [0, -12, 12, -6, 0] }} transition={{ delay: 0.8, duration: 0.8 }}>
                  <Icon icon="mdi:arm-flex" width={48} height={48} />
                </motion.span>
              </motion.div>
            </div>

            <motion.div className="px-6 pb-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <p className="mt-4 text-sm" style={{ color: accent }}>{result.already ? "Already checked in today" : `Checked in at ${result.gymName}`}</p>
              <h1 className="mt-1 text-4xl leading-none">
                {result.already ? "Back again," : "Welcome back,"}<br />
                <span style={{ color: accent }}>{result.name}!</span>
              </h1>
              <p className="mt-5 text-lg text-gray-200 italic">&ldquo;{quote}&rdquo;</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-4 flex flex-col items-center gap-1" style={{ background: bg.card, borderRadius: radius }}>
                  <CalendarCheck size={20} color={accent} />
                  <p className="text-2xl">{result.visitsThisMonth}</p>
                  <p className="text-[11px] text-gray-400">Visits this month</p>
                </div>
                <div className="p-4 flex flex-col items-center gap-1" style={{ background: bg.card, borderRadius: radius }}>
                  <Trophy size={20} color={accent} />
                  <p className="text-2xl">{result.totalVisits}</p>
                  <p className="text-[11px] text-gray-400">Total visits</p>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.96 }} onClick={() => router.push(`/g/${slug}/home`)}
                className="mt-6 w-full py-4 text-lg flex items-center justify-center gap-2"
                style={{ background: accent, color: onAccent, borderRadius: pill }}>
                Start today&apos;s workout <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}