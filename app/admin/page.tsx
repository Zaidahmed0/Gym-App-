"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archivo_Black, Fredoka, Inter } from "next/font/google";
import { createClient } from "@/utils/supabase/client";
import InviteOwner from "./InviteOwner";

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
  accent_color: string;
  theme_bg: string;
  font_style: string;
  card_style: string;
  tagline: string | null;
  is_active: boolean;
};

function makeSlug(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function textOn(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#0B0B0B" : "#FFFFFF";
}

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [bgKey, setBgKey] = useState("midnight");
  const [fontKey, setFontKey] = useState("bold");
  const [cardStyle, setCardStyle] = useState("rounded");

  const bg = BACKGROUNDS[bgKey];
  const font = FONTS[fontKey];
  const radius = cardStyle === "rounded" ? "22px" : "6px";

  async function loadGyms() {
    const { data } = await supabase.from("gyms").select("*").order("created_at", { ascending: false });
    setGyms(data || []);
  }

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role === "super_admin") {
        setAllowed(true);
        await loadGyms();
      }
      setChecking(false);
    }
    check();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setTagline("");
    setColor(COLORS[0]);
    setBgKey("midnight");
    setFontKey("bold");
    setCardStyle("rounded");
  }

  function editGym(gym: Gym) {
    setEditingId(gym.id);
    setName(gym.name);
    setTagline(gym.tagline || "");
    setColor(gym.accent_color);
    setBgKey(gym.theme_bg || "midnight");
    setFontKey(gym.font_style || "bold");
    setCardStyle(gym.card_style || "rounded");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGym(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const values = {
      name,
      tagline,
      accent_color: color,
      theme_bg: bgKey,
      font_style: fontKey,
      card_style: cardStyle,
    };

    const { error } = editingId
      ? await supabase.from("gyms").update(values).eq("id", editingId)
      : await supabase.from("gyms").insert({ ...values, slug: makeSlug(name) });

    if (error) return setMessage("Error: " + error.message);
    setMessage(editingId ? "Changes saved" : "Gym created");
    resetForm();
    loadGyms();
  }

  async function toggleActive(gym: Gym) {
    await supabase.from("gyms").update({ is_active: !gym.is_active }).eq("id", gym.id);
    loadGyms();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (checking) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!allowed) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const label = "block mb-2 mt-5 text-sm text-gray-400";
  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-zinc-700 text-gray-300"}`;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black leading-none">
              Theme <span className="text-lime-300">studio</span>
            </h1>
            <p className="mt-2 text-gray-400">{gyms.length} gyms on the platform</p>
          </div>
          <button onClick={logout} className="px-4 py-2 rounded-full border border-zinc-700 text-sm">Logout</button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={saveGym} className="p-6 rounded-3xl bg-zinc-900">
            <p className="font-bold text-lg">{editingId ? "Edit gym" : "Create a new gym"}</p>

            <label className={label}>Gym name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Iron Tribe Fitness"
              className="w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none focus:border-lime-300" />
            {name && !editingId && <p className="mt-2 text-sm text-gray-500">Link: yourapp.com/{makeSlug(name)}</p>}

            <label className={label}>Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="Stronger every day"
              className="w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none focus:border-lime-300" />

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

            <button type="submit" className="mt-7 w-full py-3 rounded-2xl font-bold"
              style={{ background: color, color: textOn(color) }}>
              {editingId ? "Save changes →" : "Create gym →"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="mt-3 w-full py-3 rounded-2xl border border-zinc-700 text-gray-300">
                Cancel editing
              </button>
            )}
            {message && <p className="mt-3 text-center text-lime-300">{message}</p>}
          </form>

          <div className="lg:sticky lg:top-6 h-fit">
            <p className="text-sm text-gray-400 mb-3">Live preview</p>
            <div className={`w-[300px] h-[600px] rounded-[44px] border-[6px] border-zinc-800 p-5 overflow-hidden ${font.className}`}
              style={{ background: bg.bg }}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center text-xs"
                  style={{ background: color, color: textOn(color), borderRadius: cardStyle === "rounded" ? "12px" : "4px" }}>
                  {(name || "GY").slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm">{name || "Your gym"}</span>
              </div>

              <p className="mt-8 text-xs text-gray-400">Hey Rohan</p>
              <p className="text-3xl leading-none mt-1">
                Let&apos;s crush<br /><span style={{ color }}>leg day</span>
              </p>
              {tagline && <p className="mt-3 text-sm italic" style={{ color }}>{tagline}</p>}

              <div className="mt-6 p-4 flex justify-between items-center"
                style={{ background: color, color: textOn(color), borderRadius: radius }}>
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
                style={{ background: color, color: textOn(color), borderRadius: cardStyle === "rounded" ? "999px" : "6px" }}>
                Start workout →
              </div>
            </div>
          </div>
        </div>

        <InviteOwner gyms={gyms} />

        <p className="mt-10 mb-3 font-bold text-lg">All gyms</p>
        <div className="grid gap-3 md:grid-cols-2">
          {gyms.map((gym) => (
            <div key={gym.id} className="p-5 rounded-3xl bg-zinc-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black"
                  style={{ background: gym.accent_color, color: textOn(gym.accent_color) }}>
                  {gym.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{gym.name}</p>
                  <p className="text-sm text-gray-500">/{gym.slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editGym(gym)} className="px-3 py-1 rounded-full text-sm border border-zinc-700">Edit</button>
                <button onClick={() => toggleActive(gym)}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${gym.is_active ? "bg-lime-300 text-black" : "bg-zinc-700 text-gray-300"}`}>
                  {gym.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}