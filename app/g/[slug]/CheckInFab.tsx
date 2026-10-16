"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDate, textOn } from "@/utils/theme";

function distanceM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function CheckInFab() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [near, setNear] = useState(false);
  const [accent, setAccent] = useState("#D4F75C");

  useEffect(() => {
    async function init() {
      setVisible(false);
      setNear(false);
      if (!pathname?.endsWith("/home")) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: b }, { data: geo }, { data: att }] = await Promise.all([
        supabase.rpc("get_gym_branding", { p_slug: slug }),
        supabase.rpc("get_gym_geo", { p_slug: slug }),
        supabase.from("attendance").select("id").eq("member_id", user.id).eq("checkin_date", formatDate(new Date())).limit(1),
      ]);

      const brand = (b as { accent_color: string }[] | null)?.[0];
      if (brand) setAccent(brand.accent_color);
      const done = !!att?.length;
      setChecked(done);
      setVisible(true);

      const g = (geo as { latitude: number | null; longitude: number | null; geofence_m: number | null }[] | null)?.[0];
      if (done || g?.latitude == null || g?.longitude == null || !("geolocation" in navigator) || !navigator.permissions) return;

      const perm = await navigator.permissions.query({ name: "geolocation" as PermissionName }).catch(() => null);
      if (perm?.state !== "granted") return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const d = distanceM(g.latitude!, g.longitude!, pos.coords.latitude, pos.coords.longitude);
          if (d <= (g.geofence_m || 150) + Math.min(pos.coords.accuracy, 75)) setNear(true);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
    init();
  }, [pathname, slug]);

  if (!visible) return null;
  const onAccent = textOn(accent);

  if (checked) {
    return (
      <div className="fixed right-4 bottom-24 z-[35] px-3 py-1.5 rounded-full text-xs flex items-center gap-1 bg-black/80 border border-white/10 text-white">
        <Check size={14} color={accent} /> Checked in today
      </div>
    );
  }

  return (
    <AnimatePresence>
      {near ? (
        <motion.button key="near" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onClick={() => router.push(`/g/${slug}/checkin`)}
          className="fixed left-4 right-4 bottom-24 z-[35] max-w-md mx-auto p-4 rounded-2xl flex items-center gap-3 shadow-2xl"
          style={{ background: accent, color: onAccent }}>
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            <MapPin size={26} />
          </motion.span>
          <span className="flex-1 text-left">
            <span className="block font-bold">You&apos;re at the gym!</span>
            <span className="block text-xs opacity-80">Tap to check in</span>
          </span>
        </motion.button>
      ) : (
        <motion.button key="fab" initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}
          onClick={() => router.push(`/g/${slug}/checkin`)}
          className="fixed right-4 bottom-24 z-[35] pl-4 pr-5 py-3 rounded-full flex items-center gap-2 shadow-2xl text-sm font-bold"
          style={{ background: accent, color: onAccent }}>
          <MapPin size={18} /> Check in
        </motion.button>
      )}
    </AnimatePresence>
  );
}