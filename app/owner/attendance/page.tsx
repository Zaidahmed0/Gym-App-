"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/utils/supabase/client";
import { textOn, formatDate } from "@/utils/theme";

type Gym = {
  id: string;
  name: string;
  slug: string;
  accent_color: string;
  latitude: number | null;
  longitude: number | null;
  geofence_m: number | null;
  checkin_code: string | null;
  checkin_images: string[] | null;
};

type Row = {
  id: string;
  member_id: string;
  checkin_date: string;
  checked_in_at: string;
  method: string;
  profiles: { full_name: string; phone: string | null } | null;
};

type Member = {
  id: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  memberships: { end_date: string }[];
};

const RADII = [50, 100, 150, 300];

function shiftDate(d: string, n: number) {
  const [y, m, day] = d.split("-").map(Number);
  return formatDate(new Date(y, m - 1, day + n));
}

function waLink(phone: string | null, text: string) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default function OwnerAttendance() {
  const supabase = createClient();
  const router = useRouter();

  const [gym, setGym] = useState<Gym | null>(null);
  const [checking, setChecking] = useState(true);
  const [today, setToday] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [qr, setQr] = useState("");
  const [manualId, setManualId] = useState("");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadData(gymId: string, t: string) {
    const [att, mem] = await Promise.all([
      supabase
        .from("attendance")
        .select("id, member_id, checkin_date, checked_in_at, method, profiles(full_name, phone)")
        .eq("gym_id", gymId)
        .gte("checkin_date", shiftDate(t, -30))
        .order("checked_in_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, phone, is_active, memberships(end_date)")
        .eq("gym_id", gymId)
        .eq("role", "member")
        .order("full_name"),
    ]);
    setRows((att.data as unknown as Row[]) || []);
    setMembers((mem.data as Member[]) || []);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    async function init() {
      const t = formatDate(new Date());
      setToday(t);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: profile } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
      if (profile?.role !== "owner") {
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from("gyms")
        .select("id, name, slug, accent_color, latitude, longitude, geofence_m, checkin_code, checkin_images")
        .eq("id", profile.gym_id)
        .single();
      if (data) {
        setGym(data as Gym);
        await loadData(data.id, t);
        timer = setInterval(() => loadData(data.id, t), 30000);
      }
      setChecking(false);
    }
    init();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const checkinUrl = gym ? `${typeof window !== "undefined" ? window.location.origin : ""}/g/${gym.slug}/checkin?code=${gym.checkin_code}` : "";

  useEffect(() => {
    if (!gym?.checkin_code) return;
    QRCode.toDataURL(checkinUrl, { width: 640, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [gym?.checkin_code, gym?.slug]);

  async function updateGym(partial: Partial<Gym>, okMsg: string) {
    if (!gym) return;
    const { error } = await supabase.from("gyms").update(partial).eq("id", gym.id);
    if (error) return setMsg("Error: " + error.message);
    setGym({ ...gym, ...partial });
    setMsg(okMsg);
    setTimeout(() => setMsg(""), 3000);
  }

  function setLocation() {
    if (!("geolocation" in navigator)) return setMsg("This device can't share location.");
    setMsg("Getting your location... stand inside the gym.");
    navigator.geolocation.getCurrentPosition(
      (pos) => updateGym({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }, `Gym location saved (accuracy about ${Math.round(pos.coords.accuracy)} m)`),
      () => setMsg("Location permission denied. Allow location in your browser and try again."),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function newCode() {
    if (!confirm("Make a new QR code? The old printed poster will stop working.")) return;
    updateGym({ checkin_code: Math.random().toString(36).slice(2, 12) }, "New QR code ready. Print the new poster.");
  }

  async function manualCheckIn() {
    if (!gym || !manualId) return;
    const { error } = await supabase.from("attendance").insert({ gym_id: gym.id, member_id: manualId, checkin_date: today, method: "manual" });
    if (error) return setMsg(error.code === "23505" ? "Already checked in today." : "Error: " + error.message);
    setManualId("");
    setMsg("Checked in");
    loadData(gym.id, today);
  }

  async function uploadImages(files: FileList) {
    if (!gym) return;
    setUploading(true);
    const urls: string[] = [];
    for (const [i, file] of Array.from(files).entries()) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) continue;
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${gym.id}/checkin/${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage.from("gym-assets").upload(path, file);
      if (!error) urls.push(supabase.storage.from("gym-assets").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
    if (urls.length) updateGym({ checkin_images: [...(gym.checkin_images || []), ...urls] }, `${urls.length} added to the check-in screen`);
    else setMsg("Only images and GIFs under 5 MB are allowed.");
  }

  function removeImage(url: string) {
    if (!gym) return;
    updateGym({ checkin_images: (gym.checkin_images || []).filter((x) => x !== url) }, "Removed");
  }

  function printPoster() {
    if (!gym || !qr) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${gym.name} check-in</title>
      <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;margin:0}
      h1{font-size:46px;margin:0 0 6px}p{font-size:22px;color:#444;margin:0 0 24px}
      img{width:420px;height:420px}.s{margin-top:24px;font-size:18px;color:#666}
      .b{display:inline-block;background:${gym.accent_color};color:${textOn(gym.accent_color)};padding:10px 26px;border-radius:999px;font-size:26px;font-weight:bold;margin-bottom:20px}</style>
      </head><body><h1>${gym.name}</h1><div class="b">SCAN TO CHECK IN</div><p>Open your phone camera and point it here</p>
      <img src="${qr}" /><div class="s">One scan a day keeps your streak alive 💪</div>
      <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    w.document.close();
  }

  if (checking) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!gym) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const accent = gym.accent_color;
  const onAccent = textOn(accent);
  const accentStyle = { background: accent, color: onAccent };
  const card = "p-6 rounded-3xl bg-zinc-900";

  const todayRows = rows.filter((r) => r.checkin_date === today);
  const days = Array.from({ length: 14 }, (_, i) => shiftDate(today, i - 13));
  const counts = days.map((d) => rows.filter((r) => r.checkin_date === d).length);
  const maxCount = Math.max(1, ...counts);
  const weekCount = rows.filter((r) => r.checkin_date >= shiftDate(today, -6)).length;
  const avg = (counts.reduce((a, b) => a + b, 0) / 14).toFixed(1);

  const lastSeen = new Map<string, string>();
  rows.forEach((r) => {
    const prev = lastSeen.get(r.member_id);
    if (!prev || r.checkin_date > prev) lastSeen.set(r.member_id, r.checkin_date);
  });
  const activeMembers = members.filter((m) => {
    const ends = (m.memberships || []).map((x) => x.end_date).sort();
    return m.is_active && ends.length && ends[ends.length - 1] >= today;
  });
  const missing = activeMembers
    .filter((m) => {
      const seen = lastSeen.get(m.id);
      return !seen || seen < shiftDate(today, -7);
    })
    .map((m) => ({ ...m, seen: lastSeen.get(m.id) || null }));

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{gym.name}</p>
            <h1 className="text-5xl font-black leading-none mt-1">
              Atten<span style={{ color: accent }}>dance</span>
            </h1>
          </div>
          <button onClick={() => router.push("/owner")} className="px-4 py-2 rounded-full border border-zinc-700 text-sm">← Members</button>
        </div>

        {msg && <p className="mt-4 text-sm" style={{ color: accent }}>{msg}</p>}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-5 rounded-3xl" style={accentStyle}>
            <p className="text-sm">In the gym today</p>
            <p className="text-4xl font-black">{todayRows.length}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900">
            <p className="text-sm text-gray-400">Last 7 days</p>
            <p className="text-4xl font-black">{weekCount}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900">
            <p className="text-sm text-gray-400">Daily average</p>
            <p className="text-4xl font-black">{avg}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900">
            <p className="text-sm text-gray-400">Missing 7+ days</p>
            <p className="text-4xl font-black text-orange-400">{missing.length}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <div className={card}>
              <p className="font-bold text-lg">Last 14 days</p>
              <div className="mt-4 flex items-end gap-1.5 h-36">
                {counts.map((c, i) => (
                  <div key={days[i]} className="flex-1 flex flex-col items-center gap-1">
                    {c > 0 && <span className="text-[10px]" style={{ color: accent }}>{c}</span>}
                    <div className="w-full rounded-md" style={{ height: Math.max(4, (c / maxCount) * 100), background: c ? accent : "#27272a" }} />
                    <span className={`text-[9px] ${days[i] === today ? "" : "text-gray-500"}`} style={days[i] === today ? { color: accent } : {}}>
                      {Number(days[i].slice(8))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={card}>
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg">Today ({todayRows.length})</p>
                <button onClick={() => loadData(gym.id, today)} className="text-xs px-3 py-1.5 rounded-full border border-zinc-700">Refresh</button>
              </div>
              <div className="mt-4 flex gap-2">
                <select value={manualId} onChange={(e) => setManualId(e.target.value)} className="flex-1 px-4 py-2.5 rounded-2xl bg-black border border-zinc-800 outline-none text-sm">
                  <option value="">Manual check-in: choose member</option>
                  {activeMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
                <button onClick={manualCheckIn} className="px-4 rounded-2xl text-sm font-bold" style={accentStyle}>Check in</button>
              </div>
              <div className="mt-4 grid gap-2">
                {todayRows.length === 0 && <p className="text-sm text-gray-500 text-center py-6">Nobody has checked in yet today.</p>}
                {todayRows.map((r) => (
                  <div key={r.id} className="p-3 rounded-2xl bg-black flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm">
                        {(r.profiles?.full_name || "?").slice(0, 1).toUpperCase()}
                      </div>
                      <p className="font-bold text-sm">{r.profiles?.full_name}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>{new Date(r.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p>{r.method === "qr" ? "QR scan" : r.method === "geo" ? "Location" : "Manual"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={card}>
              <p className="font-bold text-lg">Haven&apos;t come in 7+ days</p>
              <p className="text-sm text-gray-400">Send them a nudge before they quit.</p>
              <div className="mt-4 grid gap-2">
                {missing.length === 0 && <p className="text-sm text-gray-500 text-center py-6">Everyone&apos;s showing up. 🔥</p>}
                {missing.map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-black flex justify-between items-center gap-3">
                    <div>
                      <p className="font-bold text-sm">{m.full_name}</p>
                      <p className="text-xs text-gray-500">{m.seen ? `Last visit ${m.seen}` : "No visits in 30 days"}</p>
                    </div>
                    <a href={waLink(m.phone, `Hey ${m.full_name.split(" ")[0]}! We miss you at ${gym.name} 💪 Your streak is waiting. See you today?`)}
                      target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-black shrink-0">
                      WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 h-fit">
            <div className={card}>
              <p className="font-bold text-lg">Check-in QR</p>
              <p className="text-sm text-gray-400">Print and stick it at the entrance.</p>
              {qr && <img src={qr} alt="Check-in QR code" className="mt-4 w-full rounded-2xl bg-white p-3" />}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={printPoster} className="py-2.5 rounded-2xl text-sm font-bold" style={accentStyle}>Print poster</button>
                <a href={qr} download={`${gym.slug}-checkin-qr.png`} className="py-2.5 rounded-2xl text-sm text-center border border-zinc-700">Download</a>
              </div>
              <button onClick={newCode} className="mt-2 w-full py-2 rounded-2xl text-xs text-gray-400 border border-zinc-800">Make a new code</button>
            </div>

            <div className={card}>
              <p className="font-bold text-lg">Geofence</p>
              <p className="text-sm text-gray-400">Members can only check in when they&apos;re this close to the gym.</p>
              <p className="mt-3 text-sm">
                {gym.latitude != null ? (
                  <span style={{ color: accent }}>Location set ✓</span>
                ) : (
                  <span className="text-orange-400">Not set yet, anyone with the QR can check in</span>
                )}
              </p>
              <button onClick={setLocation} className="mt-3 w-full py-2.5 rounded-2xl text-sm font-bold" style={accentStyle}>
                {gym.latitude != null ? "Update to my current location" : "I'm at the gym, use my location"}
              </button>
              <p className="mt-4 mb-2 text-xs text-gray-400">Allowed distance</p>
              <div className="flex gap-2 flex-wrap">
                {RADII.map((r) => (
                  <button key={r} onClick={() => updateGym({ geofence_m: r }, `Distance set to ${r} m`)}
                    className="px-4 py-2 rounded-full text-sm border"
                    style={(gym.geofence_m || 150) === r ? { ...accentStyle, borderColor: accent } : { borderColor: "#3f3f46", color: "#d4d4d8" }}>
                    {r} m
                  </button>
                ))}
              </div>
            </div>

            <div className={card}>
              <p className="font-bold text-lg">Check-in screen</p>
              <p className="text-sm text-gray-400">Photos or GIFs shown when members check in. Your gym, your trainers, your vibe.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(gym.checkin_images || []).map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="" className="w-full h-20 object-cover rounded-xl" />
                    <button onClick={() => removeImage(url)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-[10px]">✕</button>
                  </div>
                ))}
                <label className="h-20 rounded-xl border border-dashed border-zinc-600 flex items-center justify-center text-xs text-gray-400 cursor-pointer text-center">
                  {uploading ? "Uploading..." : "+ Add"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadImages(e.target.files)} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}