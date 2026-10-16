"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { textOn, formatDate, makePassword } from "@/utils/theme";
import { addMember, resetMemberPassword } from "./actions";

type Membership = { id: string; plan_name: string; start_date: string; end_date: string; amount: number; status: string };
type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  memberships: Membership[];
  member_plans: { plan_id: string }[];
};
type Gym = { id: string; name: string; slug: string; accent_color: string };
type WorkoutPlan = { id: string; title: string };

const PLANS = [
  { label: "1 month", months: 1 },
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 },
];

function today() {
  return formatDate(new Date());
}

function addMonths(date: string, months: number) {
  if (!date) return "";
  const [y, m, d] = date.split("-").map(Number);
  return formatDate(new Date(y, m - 1 + months, d));
}

function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return formatDate(new Date(y, m - 1, d + days));
}

function daysLeft(endDate: string) {
  const end = new Date(endDate + "T23:59:59");
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

function latest(m: Member) {
  return [...(m.memberships || [])].sort((a, b) => b.end_date.localeCompare(a.end_date))[0];
}

function whatsappLink(phone: string | null, text: string) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default function OwnerPage() {
  const supabase = createClient();
  const router = useRouter();

  const [gym, setGym] = useState<Gym | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [checking, setChecking] = useState(true);
  const [filter, setFilter] = useState<"all" | "expiring" | "expired" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [planMonths, setPlanMonths] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [creds, setCreds] = useState<{ text: string; phone: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"renew" | "edit" | "history" | "workout" | "password" | null>(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewStart, setRenewStart] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [assignPlanId, setAssignPlanId] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  async function loadMembers(gymId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, is_active, memberships(id, plan_name, start_date, end_date, amount, status), member_plans(plan_id)")
      .eq("gym_id", gymId)
      .eq("role", "member")
      .order("created_at", { ascending: false });
    setMembers((data as Member[]) || []);
  }

  async function loadWorkoutPlans(gymId: string) {
    const { data } = await supabase.from("workout_plans").select("id, title").eq("gym_id", gymId).order("title");
    setWorkoutPlans(data || []);
  }

  useEffect(() => {
    async function init() {
      setStartDate(today());
      setPassword(makePassword());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
      if (profile?.role !== "owner") {
        setChecking(false);
        return;
      }

      const { data: gymData } = await supabase.from("gyms").select("id, name, slug, accent_color").eq("id", profile.gym_id).single();
      setGym(gymData);
      await Promise.all([loadMembers(profile.gym_id), loadWorkoutPlans(profile.gym_id)]);
      setChecking(false);
    }
    init();
  }, []);

  function buildCreds(name: string, mail: string, pass: string) {
    if (!gym) return "";
    return `Hi ${name}! Welcome to ${gym.name} 💪\n\nOpen your gym app: ${window.location.origin}/g/${gym.slug}\nEmail: ${mail}\nPassword: ${pass}\n\nTip: open the link on your phone and tap "Add to Home Screen".`;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!gym) return;
    setSaving(true);
    setMessage("");
    setCreds(null);

    const plan = PLANS.find((p) => p.months === planMonths)!;
    const result = await addMember({
      fullName,
      email,
      phone,
      password,
      planName: plan.label,
      startDate,
      endDate: addMonths(startDate, planMonths),
      amount: Number(amount) || 0,
    });

    setSaving(false);
    if (result.error) return setMessage("Error: " + result.error);

    setCreds({ text: buildCreds(fullName, email.trim().toLowerCase(), password), phone });
    setMessage(`${fullName} added`);
    setFullName("");
    setEmail("");
    setPhone("");
    setAmount("");
    setPassword(makePassword());
    loadMembers(gym.id);
  }

  async function copyCreds() {
    if (!creds) return;
    await navigator.clipboard.writeText(creds.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openMember(m: Member) {
    if (openId === m.id) {
      setOpenId(null);
      setMode(null);
      return;
    }
    setOpenId(m.id);
    setMode(null);
    setActionMsg("");
  }

  function startRenew(m: Member) {
    const plan = latest(m);
    const t = today();
    const start = plan && plan.end_date >= t ? addDays(plan.end_date, 1) : t;
    setRenewStart(start);
    setRenewMonths(1);
    setRenewAmount("");
    setMode("renew");
    setActionMsg("");
  }

  function startEdit(m: Member) {
    setEditName(m.full_name);
    setEditPhone(m.phone || "");
    setMode("edit");
    setActionMsg("");
  }

  function startWorkout(m: Member) {
    setAssignPlanId(m.member_plans?.[0]?.plan_id || "");
    setMode("workout");
    setActionMsg("");
  }

  function startPassword() {
    setResetPass(makePassword());
    setMode("password");
    setActionMsg("");
  }

  async function saveRenew(m: Member) {
    if (!gym) return;
    const plan = PLANS.find((p) => p.months === renewMonths)!;
    const { error } = await supabase.from("memberships").insert({
      member_id: m.id,
      gym_id: gym.id,
      plan_name: plan.label,
      start_date: renewStart,
      end_date: addMonths(renewStart, renewMonths),
      amount: Number(renewAmount) || 0,
      status: "active",
    });
    if (error) return setActionMsg("Error: " + error.message);
    setActionMsg("Plan renewed");
    setMode(null);
    loadMembers(gym.id);
  }

  async function saveEdit(m: Member) {
    if (!gym) return;
    const { error } = await supabase.from("profiles").update({ full_name: editName, phone: editPhone }).eq("id", m.id);
    if (error) return setActionMsg("Error: " + error.message);
    setActionMsg("Details updated");
    setMode(null);
    loadMembers(gym.id);
  }

  async function saveWorkout(m: Member) {
    if (!gym) return;
    for (const mp of m.member_plans || []) {
      await supabase.from("member_plans").delete().eq("member_id", m.id).eq("plan_id", mp.plan_id);
    }
    if (assignPlanId) {
      const { error } = await supabase.from("member_plans").insert({ member_id: m.id, plan_id: assignPlanId });
      if (error) return setActionMsg("Error: " + error.message);
    }
    setActionMsg(assignPlanId ? "Workout plan assigned" : "Workout plan removed");
    setMode(null);
    loadMembers(gym.id);
  }

  async function savePassword(m: Member) {
    const result = await resetMemberPassword(m.id, resetPass);
    if (result.error) return setActionMsg("Error: " + result.error);
    setCreds({ text: buildCreds(m.full_name, m.email, resetPass), phone: m.phone });
    setActionMsg("New password set. Share it with the member.");
    setMode(null);
  }

  async function toggleActive(m: Member) {
    if (!gym) return;
    const { error } = await supabase.from("profiles").update({ is_active: !m.is_active }).eq("id", m.id);
    if (error) return setActionMsg("Error: " + error.message);
    setActionMsg(m.is_active ? "Member deactivated" : "Member activated");
    loadMembers(gym.id);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (checking) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!gym) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const accent = gym.accent_color;
  const onAccent = textOn(accent);

  const counts = { total: members.length, active: 0, expiring: 0, expired: 0, inactive: 0, revenue: 0 };
  const thisMonth = today().slice(0, 7);
  members.forEach((m) => {
    m.memberships?.forEach((p) => {
      if (p.start_date.slice(0, 7) === thisMonth) counts.revenue += Number(p.amount) || 0;
    });
    if (!m.is_active) {
      counts.inactive++;
      return;
    }
    const plan = latest(m);
    if (!plan) return;
    const d = daysLeft(plan.end_date);
    if (d < 0) counts.expired++;
    else {
      counts.active++;
      if (d <= 7) counts.expiring++;
    }
  });

  const visible = members.filter((m) => {
    const plan = latest(m);
    const d = plan ? daysLeft(plan.end_date) : -1;
    if (filter === "inactive" && m.is_active) return false;
    if (filter !== "inactive" && filter !== "all" && !m.is_active) return false;
    if (filter === "expiring" && !(d >= 0 && d <= 7)) return false;
    if (filter === "expired" && d >= 0) return false;
    const q = search.toLowerCase();
    return !q || m.full_name.toLowerCase().includes(q) || m.email.includes(q) || (m.phone || "").includes(q);
  });

  const input = "w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none";
  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-zinc-700 text-gray-300"}`;
  const smallBtn = "px-4 py-2 rounded-full text-sm border border-zinc-700";
  const accentStyle = { background: accent, color: onAccent };

  const credsCard = creds && (
    <div className="mt-4 p-5 rounded-2xl bg-black border" style={{ borderColor: accent }}>
      <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans">{creds.text}</pre>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={copyCreds} className="py-2 rounded-xl font-bold" style={accentStyle}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
        <a href={whatsappLink(creds.phone, creds.text)} target="_blank" rel="noreferrer"
          className="py-2 rounded-xl font-bold text-center bg-green-500 text-black">
          Send on WhatsApp
        </a>
      </div>
      <button type="button" onClick={() => setCreds(null)} className="mt-2 w-full text-xs text-gray-500">Close</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black" style={accentStyle}>
              {gym.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-400">Owner dashboard</p>
              <p className="text-xl font-bold">{gym.name}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => router.push("/owner/workouts")} className="px-4 py-2 rounded-full text-sm font-bold" style={accentStyle}>
              Workouts
            </button>
            <button onClick={() => router.push("/owner/attendance")} className={smallBtn}>Attendance</button>
            <button onClick={() => router.push("/owner/notifications")} className={smallBtn}>Notifications</button>
            <button onClick={logout} className={smallBtn}>Logout</button>
          </div>
        </div>

        <h1 className="mt-8 text-5xl font-black leading-none">
          Your <span style={{ color: accent }}>crew</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">Member app link: /g/{gym.slug}</p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-5 rounded-3xl" style={accentStyle}>
            <p className="text-sm">Total members</p>
            <p className="text-4xl font-black">{counts.total}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900">
            <p className="text-sm text-gray-400">Active</p>
            <p className="text-4xl font-black">{counts.active}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900">
            <p className="text-sm text-gray-400">Expiring soon</p>
            <p className="text-4xl font-black text-orange-400">{counts.expiring}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900">
            <p className="text-sm text-gray-400">Expired</p>
            <p className="text-4xl font-black text-red-400">{counts.expired}</p>
          </div>
          <div className="p-5 rounded-3xl bg-zinc-900 col-span-2 md:col-span-1">
            <p className="text-sm text-gray-400">This month</p>
            <p className="text-3xl font-black">₹{counts.revenue.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="mt-6 w-full py-3 rounded-2xl font-bold" style={accentStyle}>
          {showForm ? "Close form" : "+ Add member"}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="mt-4 p-6 rounded-3xl bg-zinc-900">
            <div className="grid gap-3 md:grid-cols-2">
              <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={input} />
              <input type="email" placeholder="member@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={input} />
              <input placeholder="Phone (for WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
              <div className="flex gap-2">
                <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={input} />
                <button type="button" onClick={() => setPassword(makePassword())} className="px-4 rounded-2xl border border-zinc-700 text-sm">New</button>
              </div>
            </div>

            <p className="mt-5 mb-2 text-sm text-gray-400">Plan</p>
            <div className="flex flex-wrap gap-2">
              {PLANS.map((p) => (
                <button type="button" key={p.months} onClick={() => setPlanMonths(p.months)} className={chip(planMonths === p.months)}>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div>
                <p className="mb-2 text-sm text-gray-400">Start date</p>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={input} />
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-400">Ends on</p>
                <div className={`${input} text-gray-300`}>{addMonths(startDate, planMonths) || "-"}</div>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-400">Amount paid (₹)</p>
                <input type="number" placeholder="1500" value={amount} onChange={(e) => setAmount(e.target.value)} className={input} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="mt-6 w-full py-3 rounded-2xl font-bold" style={accentStyle}>
              {saving ? "Adding..." : "Add member →"}
            </button>
            {message && <p className="mt-3 text-center" style={{ color: accent }}>{message}</p>}
          </form>
        )}

        {!openId && credsCard}

        <div className="mt-8 flex flex-wrap gap-2 items-center">
          <button onClick={() => setFilter("all")} className={chip(filter === "all")}>All</button>
          <button onClick={() => setFilter("expiring")} className={chip(filter === "expiring")}>Expiring soon</button>
          <button onClick={() => setFilter("expired")} className={chip(filter === "expired")}>Expired</button>
          <button onClick={() => setFilter("inactive")} className={chip(filter === "inactive")}>Inactive</button>
          <input placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 outline-none text-sm" />
        </div>

        <p className="mt-3 text-xs text-gray-500">Tap a member to renew, edit, assign a workout, reset password or deactivate.</p>

        <div className="mt-3 grid gap-3">
          {visible.length === 0 && <p className="text-gray-500 text-center py-10">No members here yet.</p>}
          {visible.map((m) => {
            const plan = latest(m);
            const d = plan ? daysLeft(plan.end_date) : -1;
            const badge = !m.is_active
              ? { text: "Inactive", cls: "bg-zinc-700 text-gray-300" }
              : d < 0 ? { text: "Expired", cls: "bg-red-500/20 text-red-400" }
              : d <= 7 ? { text: `${d} days left`, cls: "bg-orange-500/20 text-orange-400" }
              : { text: `${d} days left`, cls: "" };
            const isOpen = openId === m.id;
            const workoutName = workoutPlans.find((w) => w.id === m.member_plans?.[0]?.plan_id)?.title;

            return (
              <div key={m.id} className={`rounded-3xl bg-zinc-900 ${!m.is_active ? "opacity-60" : ""}`}>
                <button onClick={() => openMember(m)} className="w-full p-5 flex flex-wrap justify-between items-center gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center font-bold">
                      {m.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{m.full_name}</p>
                      <p className="text-sm text-gray-500">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                      <p className="text-xs mt-1" style={{ color: workoutName ? accent : "#71717a" }}>
                        {workoutName ? `💪 ${workoutName}` : "No workout plan"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${badge.cls}`} style={badge.cls ? {} : accentStyle}>
                      {badge.text}
                    </span>
                    {plan && <p className="mt-1 text-xs text-gray-500">{plan.plan_name} · ends {plan.end_date}</p>}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-zinc-800 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => startRenew(m)} className="px-4 py-2 rounded-full text-sm font-bold" style={accentStyle}>Renew plan</button>
                      <button onClick={() => startWorkout(m)} className={smallBtn}>Workout plan</button>
                      <button onClick={() => startEdit(m)} className={smallBtn}>Edit details</button>
                      <button onClick={startPassword} className={smallBtn}>Reset password</button>
                      <button onClick={() => { setMode("history"); setActionMsg(""); }} className={smallBtn}>Payment history</button>
                      <button onClick={() => toggleActive(m)} className={`${smallBtn} ${m.is_active ? "text-red-400 border-red-900" : ""}`}>
                        {m.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>

                    {mode === "renew" && (
                      <div className="mt-4 p-4 rounded-2xl bg-black">
                        <div className="flex flex-wrap gap-2">
                          {PLANS.map((p) => (
                            <button type="button" key={p.months} onClick={() => setRenewMonths(p.months)} className={chip(renewMonths === p.months)}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div>
                            <p className="mb-2 text-sm text-gray-400">Starts</p>
                            <input type="date" value={renewStart} onChange={(e) => setRenewStart(e.target.value)} className={input} />
                          </div>
                          <div>
                            <p className="mb-2 text-sm text-gray-400">Ends</p>
                            <div className={`${input} text-gray-300`}>{addMonths(renewStart, renewMonths) || "-"}</div>
                          </div>
                          <div>
                            <p className="mb-2 text-sm text-gray-400">Amount (₹)</p>
                            <input type="number" placeholder="1500" value={renewAmount} onChange={(e) => setRenewAmount(e.target.value)} className={input} />
                          </div>
                        </div>
                        <button onClick={() => saveRenew(m)} className="mt-4 w-full py-3 rounded-2xl font-bold" style={accentStyle}>Confirm renewal →</button>
                      </div>
                    )}

                    {mode === "workout" && (
                      <div className="mt-4 p-4 rounded-2xl bg-black">
                        {workoutPlans.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No workout plans yet.{" "}
                            <button onClick={() => router.push("/owner/workouts")} style={{ color: accent }}>Create one →</button>
                          </p>
                        ) : (
                          <>
                            <select value={assignPlanId} onChange={(e) => setAssignPlanId(e.target.value)} className={input}>
                              <option value="">No plan</option>
                              {workoutPlans.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
                            </select>
                            <button onClick={() => saveWorkout(m)} className="mt-4 w-full py-3 rounded-2xl font-bold" style={accentStyle}>Save workout plan →</button>
                          </>
                        )}
                      </div>
                    )}

                    {mode === "edit" && (
                      <div className="mt-4 p-4 rounded-2xl bg-black">
                        <div className="grid gap-3 md:grid-cols-2">
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" className={input} />
                          <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" className={input} />
                        </div>
                        <button onClick={() => saveEdit(m)} className="mt-4 w-full py-3 rounded-2xl font-bold" style={accentStyle}>Save details →</button>
                      </div>
                    )}

                    {mode === "password" && (
                      <div className="mt-4 p-4 rounded-2xl bg-black">
                        <div className="flex gap-2">
                          <input value={resetPass} onChange={(e) => setResetPass(e.target.value)} className={input} />
                          <button type="button" onClick={() => setResetPass(makePassword())} className="px-4 rounded-2xl border border-zinc-700 text-sm">New</button>
                        </div>
                        <button onClick={() => savePassword(m)} className="mt-4 w-full py-3 rounded-2xl font-bold" style={accentStyle}>Set new password →</button>
                      </div>
                    )}

                    {mode === "history" && (
                      <div className="mt-4 p-4 rounded-2xl bg-black grid gap-2">
                        {[...m.memberships].sort((a, b) => b.start_date.localeCompare(a.start_date)).map((p) => (
                          <div key={p.id} className="flex justify-between text-sm border-b border-zinc-900 pb-2">
                            <span className="text-gray-300">{p.plan_name} · {p.start_date} → {p.end_date}</span>
                            <span className="font-bold">₹{Number(p.amount).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {actionMsg && <p className="mt-3 text-sm" style={{ color: accent }}>{actionMsg}</p>}
                    {credsCard}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}