"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Exercise = {
  id: string;
  name: string;
  category: string | null;
  youtube_url: string | null;
  image_url: string | null;
  instructions: string | null;
};

const CATEGORIES = ["Legs", "Chest", "Back", "Shoulders", "Arms", "Core", "Cardio", "Full body"];

function youtubeId(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function AdminExercises() {
  const supabase = createClient();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [list, setList] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [youtube, setYoutube] = useState("");
  const [image, setImage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase.from("exercises").select("*").is("gym_id", null).order("category").order("name");
    setList((data as Exercise[]) || []);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role === "super_admin") {
        setAllowed(true);
        await load();
      }
      setChecking(false);
    }
    init();
  }, []);

  function reset() {
    setEditingId(null);
    setName("");
    setCategory(CATEGORIES[0]);
    setYoutube("");
    setImage("");
    setInstructions("");
  }

  function edit(x: Exercise) {
    setEditingId(x.id);
    setName(x.name);
    setCategory(x.category || CATEGORIES[0]);
    setYoutube(x.youtube_url || "");
    setImage(x.image_url || "");
    setInstructions(x.instructions || "");
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (youtube && !youtubeId(youtube)) return setMsg("That doesn't look like a YouTube link.");
    const values = {
      name,
      category,
      youtube_url: youtube || null,
      image_url: image || null,
      instructions: instructions || null,
    };
    const { error } = editingId
      ? await supabase.from("exercises").update(values).eq("id", editingId)
      : await supabase.from("exercises").insert({ ...values, gym_id: null });
    if (error) return setMsg("Error: " + error.message);
    setMsg(editingId ? "Updated for all gyms" : "Added for all gyms");
    reset();
    load();
  }

  async function remove(x: Exercise) {
    if (!confirm(`Delete ${x.name} for all gyms? Plans using it will lose this exercise.`)) return;
    const { error } = await supabase.from("exercises").delete().eq("id", x.id);
    if (error) return setMsg("Error: " + error.message);
    load();
  }

  if (checking) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!allowed) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const input = "w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none focus:border-lime-300";
  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-zinc-700 text-gray-300"}`;
  const vid = youtubeId(youtube);
  const shown = list.filter((x) => filter === "All" || x.category === filter);
  const withVideo = list.filter((x) => x.youtube_url).length;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">Shared with every gym</p>
            <h1 className="text-5xl font-black leading-none mt-1">
              Exercise <span className="text-lime-300">library</span>
            </h1>
            <p className="mt-2 text-gray-400 text-sm">{list.length} exercises · {withVideo} with video</p>
          </div>
          <button onClick={() => router.push("/admin")} className="px-4 py-2 rounded-full border border-zinc-700 text-sm">← Gyms</button>
        </div>

        <form onSubmit={save} className="mt-8 p-6 rounded-3xl bg-zinc-900">
          <p className="font-bold text-lg">{editingId ? "Edit exercise" : "Add exercise"}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input placeholder="Exercise name" value={name} onChange={(e) => setName(e.target.value)} required className={input} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="YouTube link (https://youtu.be/...)" value={youtube} onChange={(e) => setYoutube(e.target.value)} className={input} />
            <input placeholder="Photo link (optional, https://...jpg)" value={image} onChange={(e) => setImage(e.target.value)} className={input} />
          </div>
          <textarea placeholder="How to do it (form tips)" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className={`${input} mt-3`} />

          {(vid || image) && (
            <div className="mt-3 flex gap-3">
              {vid && <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="Video preview" className="w-40 rounded-2xl" />}
              {image && <img src={image} alt="Photo preview" className="w-40 h-[90px] object-cover rounded-2xl" />}
            </div>
          )}

          <button type="submit" className="mt-5 w-full py-3 rounded-2xl bg-lime-300 text-black font-bold">
            {editingId ? "Save changes →" : "Add for all gyms →"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="mt-3 w-full py-3 rounded-2xl border border-zinc-700 text-gray-300">Cancel</button>
          )}
          {msg && <p className="mt-3 text-center text-sm text-lime-300">{msg}</p>}
        </form>

        <div className="mt-8 flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={chip(filter === c)}>{c}</button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {shown.map((x) => {
            const id = youtubeId(x.youtube_url);
            const thumb = x.image_url || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null);
            return (
              <div key={x.id} className="p-4 rounded-3xl bg-zinc-900 flex gap-4">
                {thumb ? (
                  <img src={thumb} alt="" className="w-28 h-20 object-cover rounded-2xl grayscale shrink-0" />
                ) : (
                  <div className="w-28 h-20 rounded-2xl bg-black flex items-center justify-center text-xs text-gray-600 shrink-0">No media</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{x.name}</p>
                  <p className="text-xs text-gray-500">{x.category}</p>
                  <p className={`text-xs mt-1 ${x.youtube_url ? "text-lime-300" : "text-orange-400"}`}>
                    {x.youtube_url ? "Video added" : "No video yet"}
                  </p>
                  <div className="mt-2 flex gap-3 text-xs">
                    <button onClick={() => edit(x)} className="text-lime-300">Edit</button>
                    <button onClick={() => remove(x)} className="text-red-400">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}