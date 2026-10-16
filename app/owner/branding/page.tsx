"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archivo_Black, Fredoka, Inter } from "next/font/google";
import { createClient } from "@/utils/supabase/client";

const boldFont = Archivo_Black({ weight: "400", subsets: ["latin"] });
const roundFont = Fredoka({ weight: ["500", "700"], subsets: ["latin"] });
const cleanFont = Inter({ weight: ["500", "800"], subsets: ["latin"] });

const FONTS: Record<string, { label: string; className: string }> = {
  bold: { label: "Bold poster", className: boldFont.className },
  rounded: { label: "Rounded", className: roundFont.className },
  clean: { label: "Clean modern", className: cleanFont.className },
};

const BACKGROUNDS: Record<string, { label: string; bg: string; card: string }> = {
  midnight: { label: "Midnight", bg: "#0B0B0B", card: "#1B1B1B" },
  charcoal: { label: "Charcoal", bg: "#1C1C1E", card: "#2C2C2E" },
  navy: { label: "Deep navy", bg: "#0B1020", card: "#18213A" },
  forest: { label: "Forest", bg: "#0C1410", card: "#17251D" },
};

const COLORS = [
  "#D4F75C", "#A3FF12", "#5CF7B0", "#4DD8FF", "#3D7BFF", "#A78BFA",
  "#FF5FA2", "#FF4D6D", "#FF8A3D", "#FACC15", "#FFFFFF", "#F5D0A9",
];

type Gym = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
  theme_bg: string | null;
  font_style: string | null;
  card_style: string | null;
  tagline: string | null;
  welcome_text: string | null;
};

function textOn(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#0B0B0B" : "#FFFFFF";
}

export default function BrandingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [gym, setGym] = useState<Gym | null>(null);
  const [checking, setChecking] = useState(true);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [welcome, setWelcome] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [bgKey, setBgKey] = useState("midnight");
  const [fontKey, setFontKey] = useState("bold");
  const [cardStyle, setCardStyle] = useState("rounded");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: profile } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
      if (profile?.role !== "owner") {
        setChecking(false);
        return;
      }
      const { data } = await supabase.from("gyms").select("*").eq("id", profile.gym_id).single();
      if (data) {
        setGym(data);
        setName(data.name);
        setTagline(data.tagline || "");
        setWelcome(data.welcome_text || "");
        setColor(data.accent_color || COLORS[0]);
        setBgKey(data.theme_bg || "midnight");
        setFontKey(data.font_style || "bold");
        setCardStyle(data.card_style || "rounded");
        setLogoUrl(data.logo_url);
      }
      setChecking(false);
    }
    init();
  }, []);

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !gym) return;
    setMessage("");

    if (!file.type.startsWith("image/")) return setMessage("Please choose an image file.");
    if (file.size > 2 * 1024 * 1024) return setMessage("Logo must be under 2 MB.");

    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${gym.id}/logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("gym-assets").upload(path, file);
    if (error) {
      setUploading(false);
      return setMessage("Upload failed: " + error.message);
    }

    const { data } = supabase.storage.from("gym-assets").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setUploading(false);
    setMessage("Logo uploaded. Hit save to apply it.");
  }

  async function save() {
    if (!gym) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("gyms")
      .update({
        name,
        tagline,
        welcome_text: welcome,
        accent_color: color,
        theme_bg: bgKey,
        font_style: fontKey,
        card_style: cardStyle,
        logo_url: logoUrl,
      })
      .eq("id", gym.id);
    setSaving(false);
    if (error) return setMessage("Error: " + error.message);
    setMessage("Branding saved. Your members will see it in the app.");
  }

  if (checking) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!gym) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const bg = BACKGROUNDS[bgKey];
  const font = FONTS[fontKey];
  const radius = cardStyle === "rounded" ? "22px" : "6px";
  const onColor = textOn(color);

  const label = "block mb-2 mt-5 text-sm text-gray-400";
  const input = "w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none";
  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-zinc-700 text-gray-300"}`;

  const logoBox = (size: string, rounded: string) =>
    logoUrl ? (
      <img src={logoUrl} alt="Gym logo" className={`${size} object-cover`} style={{ borderRadius: rounded }} />
    ) : (
      <div className={`${size} flex items-center justify-center text-xs`}
        style={{ background: color, color: onColor, borderRadius: rounded }}>
        {(name || "GY").slice(0, 2).toUpperCase()}
      </div>
    );

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{gym.name}</p>
            <h1 className="text-5xl font-black leading-none mt-1">
              Your <span style={{ color }}>brand</span>
            </h1>
          </div>
          <button onClick={() => router.push("/owner")} className="px-4 py-2 rounded-full border border-zinc-700 text-sm">
            ← Members
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="p-6 rounded-3xl bg-zinc-900">
            <label className={label} style={{ marginTop: 0 }}>Logo</label>
            <div className="flex items-center gap-4">
              {logoBox("w-20 h-20", cardStyle === "rounded" ? "20px" : "6px")}
              <label className="px-5 py-3 rounded-2xl border border-zinc-700 text-sm cursor-pointer">
                {uploading ? "Uploading..." : logoUrl ? "Change logo" : "Upload logo"}
                <input type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
              </label>
              {logoUrl && (
                <button onClick={() => setLogoUrl(null)} className="text-sm text-red-400">Remove</button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">Square image works best. PNG or JPG, under 2 MB.</p>

            <label className={label}>Gym name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={input} />

            <label className={label}>Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Stronger every day" className={input} />

            <label className={label}>Welcome message for members</label>
            <textarea value={welcome} onChange={(e) => setWelcome(e.target.value)} rows={2}
              placeholder="Welcome to the tribe! Show up, sweat, repeat." className={input} />

            <label className={label}>Accent color</label>
            <div className="flex flex-wrap gap-3 items-center">
              {COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""}`}
                  style={{ background: c }} />
              ))}
              <label className="w-9 h-9 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center cursor-pointer text-gray-400 relative overflow-hidden">
                +
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            </div>

            <label className={label}>Background</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BACKGROUNDS).map(([key, b]) => (
                <button type="button" key={key} onClick={() => setBgKey(key)} className={chip(bgKey === key)}>
                  <span className="inline-block w-3 h-3 rounded-full mr-2 border border-zinc-500" style={{ background: b.bg }} />
                  {b.label}
                </button>
              ))}
            </div>

            <label className={label}>Font style</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(FONTS).map(([key, f]) => (
                <button type="button" key={key} onClick={() => setFontKey(key)} className={`${chip(fontKey === key)} ${f.className}`}>
                  {f.label}
                </button>
              ))}
            </div>

            <label className={label}>Card style</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCardStyle("rounded")} className={chip(cardStyle === "rounded")}>Rounded</button>
              <button type="button" onClick={() => setCardStyle("sharp")} className={chip(cardStyle === "sharp")}>Sharp</button>
            </div>

            <button onClick={save} disabled={saving} className="mt-7 w-full py-3 rounded-2xl font-bold"
              style={{ background: color, color: onColor }}>
              {saving ? "Saving..." : "Save branding →"}
            </button>
            {message && <p className="mt-3 text-center text-sm" style={{ color }}>{message}</p>}
          </div>

          <div className="lg:sticky lg:top-6 h-fit">
            <p className="text-sm text-gray-400 mb-3">What members will see</p>
            <div className={`w-[300px] h-[600px] rounded-[44px] border-[6px] border-zinc-800 p-5 overflow-hidden ${font.className}`}
              style={{ background: bg.bg }}>
              <div className="flex items-center gap-2">
                {logoBox("w-9 h-9", cardStyle === "rounded" ? "12px" : "4px")}
                <span className="text-sm">{name || "Your gym"}</span>
              </div>

              <p className="mt-8 text-xs text-gray-400">Hey Rohan</p>
              <p className="text-3xl leading-none mt-1">
                Let&apos;s crush<br /><span style={{ color }}>leg day</span>
              </p>
              {tagline && <p className="mt-3 text-sm italic" style={{ color }}>{tagline}</p>}
              {welcome && <p className="mt-2 text-xs text-gray-400">{welcome}</p>}

              <div className="mt-5 p-4 flex justify-between items-center"
                style={{ background: color, color: onColor, borderRadius: radius }}>
                <div>
                  <p className="text-xs">Current streak</p>
                  <p className="text-3xl leading-tight">12 days</p>
                </div>
                <span className="text-4xl">🔥</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="p-4" style={{ background: bg.card, borderRadius: radius }}>
                  <p className="text-xs text-gray-400">Weight</p>
                  <p className="text-xl">72.4 kg</p>
                </div>
                <div className="p-4" style={{ background: bg.card, borderRadius: radius }}>
                  <p className="text-xs text-gray-400">Plan ends</p>
                  <p className="text-xl">18 days</p>
                </div>
              </div>

              <div className="mt-3 p-4" style={{ background: bg.card, borderRadius: radius }}>
                <p className="text-xs text-gray-400">Today</p>
                <p className="text-lg">Barbell squats</p>
                <p className="text-xs text-gray-400">4 sets × 10 reps</p>
              </div>

              <div className="mt-5 py-3 text-center text-sm"
                style={{ background: color, color: onColor, borderRadius: cardStyle === "rounded" ? "999px" : "6px" }}>
                Start workout →
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}