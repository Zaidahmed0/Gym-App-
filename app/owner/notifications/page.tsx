"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { textOn } from "@/utils/theme";
import { pushAnnouncement, sendRemindersNow } from "./actions";

type Gym = {
  id: string;
  name: string;
  accent_color: string;
  auto_reminders: boolean;
  welcome_enabled: boolean;
  welcome_text: string | null;
  welcome_image: string | null;
};

type Ann = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  audience: string;
  pinned: boolean;
  popup: boolean;
  created_at: string;
};

const AUDIENCES = [
  { key: "all", label: "Everyone" },
  { key: "active", label: "Active members" },
  { key: "expiring", label: "Expiring in 7 days" },
];

const TEMPLATES = [
  { title: "Motivation Monday 💪", body: "New week, new PRs. Show up today and make it count!" },
  { title: "Gym timings update", body: "Tomorrow the gym will open at 7 AM and close at 9 PM." },
  { title: "New batch starting", body: "Our new morning batch starts this Monday. Ask the front desk to join." },
  { title: "Festival offer 🎉", body: "Renew this week and get 15 extra days free. Limited time!" },
];

export default function OwnerNotifications() {
  const supabase = createClient();
  const router = useRouter();

  const [gym, setGym] = useState<Gym | null>(null);
  const [anns, setAnns] = useState<Ann[]>([]);
  const [checking, setChecking] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audience, setAudience] = useState("all");
  const [pinned, setPinned] = useState(false);
  const [popup, setPopup] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState("");

  const [welcomeText, setWelcomeText] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  async function loadAnns(gymId: string) {
    const { data } = await supabase.from("announcements").select("*").eq("gym_id", gymId).order("created_at", { ascending: false });
    setAnns((data as Ann[]) || []);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: profile } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
      if (profile?.role !== "owner") {
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from("gyms")
        .select("id, name, accent_color, auto_reminders, welcome_enabled, welcome_text, welcome_image")
        .eq("id", profile.gym_id)
        .single();
      if (data) {
        setGym(data as Gym);
        setWelcomeText(data.welcome_text || "");
        await loadAnns(data.id);
      }
      setChecking(false);
    }
    init();
  }, []);

  async function upload(file: File) {
    if (!gym) return null;
    if (!file.type.startsWith("image/")) {
      setMsg("Please choose an image file.");
      return null;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMsg("Image must be under 3 MB.");
      return null;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${gym.id}/posts/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("gym-assets").upload(path, file);
    setUploading(false);
    if (error) {
      setMsg("Upload failed: " + error.message);
      return null;
    }
    return supabase.storage.from("gym-assets").getPublicUrl(path).data.publicUrl;
  }

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!gym) return;
    setPosting(true);
    setMsg("");
    const { error } = await supabase.from("announcements").insert({
      gym_id: gym.id,
      title,
      body: body || null,
      image_url: imageUrl,
      audience,
      pinned,
      popup,
    });
    if (error) {
      setPosting(false);
      return setMsg("Error: " + error.message);
    }

    let pushText = "";
    if (sendPush) {
      const result = await pushAnnouncement(title, body || null, imageUrl, audience);
      pushText = result.sent ? ` Sent to ${result.sent} phone${result.sent === 1 ? "" : "s"}.` : " No phones have notifications turned on yet.";
    }

    setPosting(false);
    setMsg("Posted!" + pushText);
    setTitle("");
    setBody("");
    setImageUrl(null);
    setPinned(false);
    setPopup(true);
    setAudience("all");
    loadAnns(gym.id);
  }

  async function remove(id: string) {
    if (!gym || !confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    loadAnns(gym.id);
  }

  async function togglePin(a: Ann) {
    if (!gym) return;
    await supabase.from("announcements").update({ pinned: !a.pinned }).eq("id", a.id);
    loadAnns(gym.id);
  }

  async function saveGym(partial: Partial<Gym>) {
    if (!gym) return;
    const next = { ...gym, ...partial };
    setGym(next);
    const { error } = await supabase.from("gyms").update(partial).eq("id", gym.id);
    setSettingsMsg(error ? "Error: " + error.message : "Saved");
    setTimeout(() => setSettingsMsg(""), 2000);
  }

  async function sendNow() {
    setSettingsMsg("Sending...");
    const result = await sendRemindersNow();
    if (result.error) return setSettingsMsg("Error: " + result.error);
    setSettingsMsg(`${result.created} reminders created, ${result.sent} sent to phones`);
  }

  if (checking) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!gym) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const accent = gym.accent_color;
  const onAccent = textOn(accent);
  const accentStyle = { background: accent, color: onAccent };
  const input = "w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none";
  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-zinc-700 text-gray-300"}`;

  const toggle = (on: boolean, onClick: () => void) => (
    <button type="button" onClick={onClick} className="w-12 h-7 rounded-full relative shrink-0 transition-colors"
      style={{ background: on ? accent : "#3f3f46" }} aria-pressed={on}>
      <span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 24 : 4 }} />
    </button>
  );

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{gym.name}</p>
            <h1 className="text-5xl font-black leading-none mt-1">
              Notifi<span style={{ color: accent }}>cations</span>
            </h1>
          </div>
          <button onClick={() => router.push("/owner")} className="px-4 py-2 rounded-full border border-zinc-700 text-sm">← Members</button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={post} className="p-6 rounded-3xl bg-zinc-900">
            <p className="font-bold text-lg">Post an announcement</p>
            <p className="text-sm text-gray-400">Motivation, offers, timings, events. Add a photo to make it pop.</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button type="button" key={tpl.title} onClick={() => { setTitle(tpl.title); setBody(tpl.body); }}
                  className="px-3 py-1.5 rounded-full text-xs border border-zinc-700 text-gray-300">
                  {tpl.title}
                </button>
              ))}
            </div>

            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className={`${input} mt-4`} />
            <textarea placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} rows={4} className={`${input} mt-3`} />

            <div className="mt-3 flex items-center gap-3">
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="" className="w-28 h-20 object-cover rounded-2xl" />
                  <button type="button" onClick={() => setImageUrl(null)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-xs">✕</button>
                </div>
              ) : (
                <label className="px-5 py-3 rounded-2xl border border-dashed border-zinc-600 text-sm cursor-pointer text-gray-300">
                  {uploading ? "Uploading..." : "+ Add photo"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImageUrl(await upload(f)); }} />
                </label>
              )}
            </div>

            <p className="mt-5 mb-2 text-sm text-gray-400">Who should see it?</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button type="button" key={a.key} onClick={() => setAudience(a.key)} className={chip(audience === a.key)}>{a.label}</button>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">Send to phones</p>
                  <p className="text-xs text-gray-500">Push notification on lock screen, for members who turned it on</p>
                </div>
                {toggle(sendPush, () => setSendPush(!sendPush))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">Show as popup</p>
                  <p className="text-xs text-gray-500">Pops up once when members open the app</p>
                </div>
                {toggle(popup, () => setPopup(!popup))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">Pin on home screen</p>
                  <p className="text-xs text-gray-500">Stays as a banner until you unpin it</p>
                </div>
                {toggle(pinned, () => setPinned(!pinned))}
              </div>
            </div>

            <button type="submit" disabled={posting || uploading} className="mt-6 w-full py-3 rounded-2xl font-bold" style={accentStyle}>
              {posting ? "Posting..." : "Post to members →"}
            </button>
            {msg && <p className="mt-3 text-center text-sm" style={{ color: accent }}>{msg}</p>}
          </form>

          <div className="grid gap-4 h-fit">
            <div className="p-6 rounded-3xl bg-zinc-900">
              <p className="font-bold text-lg">Automatic messages</p>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm">Expiry reminders</p>
                  <p className="text-xs text-gray-500">Sent every morning, 7, 3 and 1 day before a plan ends, on the last day, and the day after. Goes to the app and the phone.</p>
                </div>
                {toggle(gym.auto_reminders, () => saveGym({ auto_reminders: !gym.auto_reminders }))}
              </div>
              <button onClick={sendNow} className="mt-3 w-full py-2.5 rounded-2xl border border-zinc-700 text-sm">Send reminders now</button>

              <div className="mt-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm">Welcome new members</p>
                  <p className="text-xs text-gray-500">Pops up the first time a new member opens the app.</p>
                </div>
                {toggle(gym.welcome_enabled, () => saveGym({ welcome_enabled: !gym.welcome_enabled }))}
              </div>
              {gym.welcome_enabled && (
                <>
                  <textarea value={welcomeText} onChange={(e) => setWelcomeText(e.target.value)} rows={3}
                    placeholder="Welcome to the tribe! Your journey starts today."
                    className={`${input} mt-3 text-sm`} />
                  <div className="mt-3 flex items-center gap-3">
                    {gym.welcome_image ? (
                      <div className="relative">
                        <img src={gym.welcome_image} alt="" className="w-24 h-16 object-cover rounded-xl" />
                        <button type="button" onClick={() => saveGym({ welcome_image: null })}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-xs">✕</button>
                      </div>
                    ) : (
                      <label className="px-4 py-2 rounded-2xl border border-dashed border-zinc-600 text-xs cursor-pointer text-gray-300">
                        + Welcome photo
                        <input type="file" accept="image/*" className="hidden"
                          onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await upload(f); if (url) saveGym({ welcome_image: url }); } }} />
                      </label>
                    )}
                    <button onClick={() => saveGym({ welcome_text: welcomeText })} className="ml-auto px-4 py-2 rounded-2xl text-sm font-bold" style={accentStyle}>
                      Save
                    </button>
                  </div>
                </>
              )}
              {settingsMsg && <p className="mt-3 text-sm" style={{ color: accent }}>{settingsMsg}</p>}
            </div>
          </div>
        </div>

        <p className="mt-10 mb-3 font-bold text-lg">Past announcements</p>
        <div className="grid gap-3 md:grid-cols-2">
          {anns.length === 0 && <p className="text-gray-500 text-sm">Nothing posted yet.</p>}
          {anns.map((a) => (
            <div key={a.id} className="rounded-3xl bg-zinc-900 overflow-hidden">
              {a.image_url && <img src={a.image_url} alt="" className="w-full h-36 object-cover" />}
              <div className="p-5">
                <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
                  <span>{new Date(a.created_at).toLocaleDateString("en-IN")}</span>
                  <span>· {AUDIENCES.find((x) => x.key === a.audience)?.label}</span>
                  {a.pinned && <span style={{ color: accent }}>· Pinned</span>}
                </div>
                <p className="mt-2 font-bold">{a.title}</p>
                {a.body && <p className="mt-1 text-sm text-gray-400 whitespace-pre-line">{a.body}</p>}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => togglePin(a)} className="px-3 py-1.5 rounded-full text-xs border border-zinc-700">{a.pinned ? "Unpin" : "Pin"}</button>
                  <button onClick={() => remove(a.id)} className="px-3 py-1.5 rounded-full text-xs border border-red-900 text-red-400">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}