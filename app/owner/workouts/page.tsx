"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Gym = { id: string; name: string; accent_color: string };
type Exercise = {
  id: string;
  gym_id: string | null;
  name: string;
  category: string | null;
  youtube_url: string | null;
  instructions: string | null;
};
type Plan = { id: string; title: string; category: string | null };
type PlanExercise = {
  id: string;
  day_of_week: number;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  sort_order: number;
  exercises: { name: string; category: string | null; youtube_url: string | null } | null;
};

const CATEGORIES = ["Legs", "Chest", "Back", "Shoulders", "Arms", "Core", "Cardio", "Full body"];
const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

function textOn(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#0B0B0B" : "#FFFFFF";
}

function youtubeId(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function WorkoutsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [gym, setGym] = useState<Gym | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"plans" | "library">("plans");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [catFilter, setCatFilter] = useState("All");
  const [exName, setExName] = useState("");
  const [exCat, setExCat] = useState(CATEGORIES[0]);
  const [exVideo, setExVideo] = useState("");
  const [exInfo, setExInfo] = useState("");
  const [showExForm, setShowExForm] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [planTitle, setPlanTitle] = useState("");
  const [planCat, setPlanCat] = useState("Full body");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planItems, setPlanItems] = useState<PlanExercise[]>([]);

  const [addExId, setAddExId] = useState("");
  const [addDay, setAddDay] = useState(1);
  const [addSets, setAddSets] = useState("3");
  const [addReps, setAddReps] = useState("10");
  const [addRest, setAddRest] = useState("60");

  const [message, setMessage] = useState("");

  async function loadExercises() {
    const { data } = await supabase.from("exercises").select("*").order("name");
    setExercises(data || []);
  }

  async function loadPlans(gymId: string) {
    const { data } = await supabase.from("workout_plans").select("id, title, category").eq("gym_id", gymId).order("title");
    setPlans(data || []);
  }

  async function loadPlanItems(planId: string) {
    const { data } = await supabase
      .from("plan_exercises")
      .select("id, day_of_week, sets, reps, rest_seconds, sort_order, exercises(name, category, youtube_url)")
      .eq("plan_id", planId)
      .order("sort_order");
    setPlanItems((data as unknown as PlanExercise[]) || []);
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
      const { data: gymData } = await supabase.from("gyms").select("id, name, accent_color").eq("id", profile.gym_id).single();
      setGym(gymData);
      await Promise.all([loadExercises(), loadPlans(profile.gym_id)]);
      setChecking(false);
    }
    init();
  }, []);

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!gym) return;
    setMessage("");
    if (exVideo && !youtubeId(exVideo)) return setMessage("That doesn't look like a YouTube link.");
    const { error } = await supabase.from("exercises").insert({
      gym_id: gym.id,
      name: exName,
      category: exCat,
      youtube_url: exVideo || null,
      instructions: exInfo || null,
    });
    if (error) return setMessage("Error: " + error.message);
    setMessage(`${exName} added to your library`);
    setExName("");
    setExVideo("");
    setExInfo("");
    setShowExForm(false);
    loadExercises();
  }

  function copyDefault(ex: Exercise) {
    setExName(ex.name);
    setExCat(ex.category || CATEGORIES[0]);
    setExInfo(ex.instructions || "");
    setExVideo("");
    setShowExForm(true);
    setMessage("Paste a YouTube link and save to make your own version.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteExercise(ex: Exercise) {
    if (!confirm(`Delete ${ex.name}?`)) return;
    const { error } = await supabase.from("exercises").delete().eq("id", ex.id);
    if (error) return setMessage("Error: " + error.message);
    loadExercises();
  }

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!gym) return;
    setMessage("");
    const { data, error } = await supabase
      .from("workout_plans")
      .insert({ gym_id: gym.id, title: planTitle, category: planCat })
      .select()
      .single();
    if (error) return setMessage("Error: " + error.message);
    setPlanTitle("");
    await loadPlans(gym.id);
    openPlan(data.id);
  }

  async function openPlan(id: string) {
    setSelectedPlan(id);
    setMessage("");
    await loadPlanItems(id);
  }

  async function deletePlan(id: string) {
    if (!gym || !confirm("Delete this plan?")) return;
    await supabase.from("workout_plans").delete().eq("id", id);
    setSelectedPlan(null);
    setPlanItems([]);
    loadPlans(gym.id);
  }

  async function addToPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan || !addExId) return;
    const { error } = await supabase.from("plan_exercises").insert({
      plan_id: selectedPlan,
      exercise_id: addExId,
      day_of_week: addDay,
      sets: Number(addSets) || null,
      reps: addReps,
      rest_seconds: Number(addRest) || null,
      sort_order: planItems.length,
    });
    if (error) return setMessage("Error: " + error.message);
    setAddExId("");
    loadPlanItems(selectedPlan);
  }

  async function removeFromPlan(id: string) {
    if (!selectedPlan) return;
    await supabase.from("plan_exercises").delete().eq("id", id);
    loadPlanItems(selectedPlan);
  }

  if (checking) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!gym) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const accent = gym.accent_color;
  const onAccent = textOn(accent);
  const input = "w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none";
  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-zinc-700 text-gray-300"}`;
  const accentBtn = { background: accent, color: onAccent };

  const shownExercises = exercises.filter((x) => catFilter === "All" || x.category === catFilter);
  const currentPlan = plans.find((p) => p.id === selectedPlan);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{gym.name}</p>
            <h1 className="text-5xl font-black leading-none mt-1">
              Work<span style={{ color: accent }}>outs</span>
            </h1>
          </div>
          <button onClick={() => router.push("/owner")} className="px-4 py-2 rounded-full border border-zinc-700 text-sm">
            ← Members
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={() => setTab("plans")} className={chip(tab === "plans")}>Workout plans</button>
          <button onClick={() => setTab("library")} className={chip(tab === "library")}>Exercise library</button>
        </div>

        {message && <p className="mt-4 text-sm" style={{ color: accent }}>{message}</p>}

        {tab === "library" && (
          <div className="mt-6">
            <button onClick={() => setShowExForm(!showExForm)} className="w-full py-3 rounded-2xl font-bold" style={accentBtn}>
              {showExForm ? "Close" : "+ Add your own exercise"}
            </button>

            {showExForm && (
              <form onSubmit={addExercise} className="mt-4 p-6 rounded-3xl bg-zinc-900 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input placeholder="Exercise name" value={exName} onChange={(e) => setExName(e.target.value)} required className={input} />
                  <select value={exCat} onChange={(e) => setExCat(e.target.value)} className={input}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <input placeholder="YouTube link, like https://youtu.be/..." value={exVideo} onChange={(e) => setExVideo(e.target.value)} className={input} />
                {youtubeId(exVideo) && (
                  <img src={`https://img.youtube.com/vi/${youtubeId(exVideo)}/hqdefault.jpg`} alt="Video preview" className="w-60 rounded-2xl" />
                )}
                <textarea placeholder="How to do it (tips for members)" value={exInfo} onChange={(e) => setExInfo(e.target.value)} rows={3} className={input} />
                <button type="submit" className="py-3 rounded-2xl font-bold" style={accentBtn}>Save exercise →</button>
              </form>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {["All", ...CATEGORIES].map((c) => (
                <button key={c} onClick={() => setCatFilter(c)} className={chip(catFilter === c)}>{c}</button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {shownExercises.map((ex) => {
                const vid = youtubeId(ex.youtube_url);
                const isMine = ex.gym_id === gym.id;
                return (
                  <div key={ex.id} className="p-4 rounded-3xl bg-zinc-900 flex gap-4">
                    {vid ? (
                      <a href={ex.youtube_url!} target="_blank" rel="noreferrer" className="shrink-0">
                        <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="" className="w-28 h-20 object-cover rounded-2xl grayscale" />
                      </a>
                    ) : (
                      <div className="w-28 h-20 rounded-2xl bg-black flex items-center justify-center text-xs text-gray-600 shrink-0">No video</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="font-bold">{ex.name}</p>
                        <span className="text-xs px-2 py-1 rounded-full h-fit"
                          style={isMine ? accentBtn : { background: "#27272a", color: "#a1a1aa" }}>
                          {isMine ? "Yours" : "Default"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{ex.category}</p>
                      <div className="mt-2 flex gap-3 text-xs">
                        {isMine ? (
                          <button onClick={() => deleteExercise(ex)} className="text-red-400">Delete</button>
                        ) : (
                          <button onClick={() => copyDefault(ex)} style={{ color: accent }}>+ Add my video</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "plans" && (
          <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
            <div>
              <form onSubmit={createPlan} className="p-4 rounded-3xl bg-zinc-900 grid gap-3">
                <input placeholder="Plan name, like Beginner Bulk" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} required className={input} />
                <select value={planCat} onChange={(e) => setPlanCat(e.target.value)} className={input}>
                  {["Full body", "Weight loss", "Muscle gain", "Strength", "Beginner"].map((c) => <option key={c}>{c}</option>)}
                </select>
                <button type="submit" className="py-3 rounded-2xl font-bold" style={accentBtn}>+ New plan</button>
              </form>

              <div className="mt-4 grid gap-2">
                {plans.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No plans yet.</p>}
                {plans.map((p) => (
                  <button key={p.id} onClick={() => openPlan(p.id)}
                    className="p-4 rounded-2xl text-left"
                    style={selectedPlan === p.id ? accentBtn : { background: "#18181b" }}>
                    <p className="font-bold">{p.title}</p>
                    <p className="text-xs opacity-70">{p.category}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              {!currentPlan ? (
                <div className="p-10 rounded-3xl bg-zinc-900 text-center text-gray-500">
                  Create or select a plan to add exercises.
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-zinc-900">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-3xl font-black">{currentPlan.title}</p>
                      <p className="text-sm text-gray-400">{currentPlan.category}</p>
                    </div>
                    <button onClick={() => deletePlan(currentPlan.id)} className="text-sm text-red-400">Delete plan</button>
                  </div>

                  <form onSubmit={addToPlan} className="mt-5 p-4 rounded-2xl bg-black grid gap-3">
                    <select value={addExId} onChange={(e) => setAddExId(e.target.value)} required className={input}>
                      <option value="">Choose exercise</option>
                      {exercises.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name} ({x.category}){x.youtube_url ? " 🎬" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => (
                        <button type="button" key={d.value} onClick={() => setAddDay(d.value)} className={chip(addDay === d.value)}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="mb-1 text-xs text-gray-400">Sets</p>
                        <input type="number" value={addSets} onChange={(e) => setAddSets(e.target.value)} className={input} />
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-400">Reps</p>
                        <input value={addReps} onChange={(e) => setAddReps(e.target.value)} placeholder="10 or 8-12" className={input} />
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-400">Rest (sec)</p>
                        <input type="number" value={addRest} onChange={(e) => setAddRest(e.target.value)} className={input} />
                      </div>
                    </div>
                    <button type="submit" className="py-3 rounded-2xl font-bold" style={accentBtn}>Add to plan →</button>
                  </form>

                  <div className="mt-6 grid gap-5">
                    {DAYS.map((d) => {
                      const items = planItems.filter((i) => i.day_of_week === d.value);
                      if (items.length === 0) return null;
                      return (
                        <div key={d.value}>
                          <p className="font-black text-lg mb-2" style={{ color: accent }}>{d.label}</p>
                          <div className="grid gap-2">
                            {items.map((i) => (
                              <div key={i.id} className="p-3 rounded-2xl bg-black flex justify-between items-center">
                                <div>
                                  <p className="font-bold">{i.exercises?.name}{i.exercises?.youtube_url ? " 🎬" : ""}</p>
                                  <p className="text-xs text-gray-500">
                                    {i.sets} sets × {i.reps} reps · {i.rest_seconds}s rest
                                  </p>
                                </div>
                                <button onClick={() => removeFromPlan(i.id)} className="text-xs text-red-400">Remove</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {planItems.length === 0 && (
                      <p className="text-sm text-gray-500 text-center">No exercises yet. Add some above.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}