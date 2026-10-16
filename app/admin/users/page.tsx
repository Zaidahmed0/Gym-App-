"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { makePassword } from "@/utils/theme";
import { listAllUsers, adminResetPassword, type AdminUser } from "./actions";

const ROLE_LABEL: Record<string, string> = { super_admin: "Admin", owner: "Owner", trainer: "Trainer", member: "Member" };

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [gym, setGym] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newPass, setNewPass] = useState("");
  const [creds, setCreds] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    listAllUsers().then((res) => {
      if (res.error) setError(res.error);
      setUsers(res.users);
      setLoading(false);
    });
  }, []);

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  function startReset(u: AdminUser) {
    setOpenId(openId === u.id ? null : u.id);
    setNewPass(makePassword());
    setCreds("");
  }

  async function saveReset(u: AdminUser) {
    const res = await adminResetPassword(u.id, newPass);
    if (res.error) return setCreds("Error: " + res.error);
    const link = u.role === "member" && u.gym_slug ? `${window.location.origin}/g/${u.gym_slug}` : `${window.location.origin}/login`;
    setCreds(`Hi ${u.full_name || ""}, your new login details:\n\nLogin: ${link}\nEmail: ${u.email}\nPassword: ${newPass}`);
  }

  if (loading) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (error) return <main className="min-h-screen bg-black text-red-400 p-8">{error}</main>;

  const gyms = [...new Map(users.filter((u) => u.gym_id).map((u) => [u.gym_id!, u.gym_name || "Gym"])).entries()];
  const shown = users.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (gym !== "all" && u.gym_id !== gym) return false;
    const s = q.toLowerCase();
    return !s || (u.full_name || "").toLowerCase().includes(s) || (u.email || "").includes(s) || (u.phone || "").includes(s) || u.id.startsWith(s);
  });

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border ${active ? "bg-white text-black border-white" : "border-zinc-700 text-gray-300"}`;
  const count = (r: string) => users.filter((u) => u.role === r).length;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">Everyone on the platform</p>
            <h1 className="text-5xl font-black leading-none mt-1">
              All <span className="text-lime-300">users</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">{count("owner")} owners · {count("member")} members</p>
          </div>
          <button onClick={() => router.push("/admin")} className="px-4 py-2 rounded-full border border-zinc-700 text-sm">← Gyms</button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 items-center">
          {[["all", "All"], ["owner", "Owners"], ["member", "Members"], ["super_admin", "Admins"]].map(([k, l]) => (
            <button key={k} onClick={() => setRole(k)} className={chip(role === k)}>{l}</button>
          ))}
          <select value={gym} onChange={(e) => setGym(e.target.value)} className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm outline-none">
            <option value="all">All gyms</option>
            {gyms.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <input placeholder="Search name, email, phone or ID" value={q} onChange={(e) => setQ(e.target.value)}
            className="flex-1 min-w-[220px] px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 outline-none text-sm" />
        </div>

        <div className="mt-5 grid gap-3">
          {shown.length === 0 && <p className="text-center text-gray-500 py-10">No users found.</p>}
          {shown.map((u) => (
            <div key={u.id} className={`rounded-3xl bg-zinc-900 ${u.is_active === false ? "opacity-60" : ""}`}>
              <div className="p-5 flex flex-wrap justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center font-bold shrink-0">
                    {(u.full_name || u.email || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold flex items-center gap-2 flex-wrap">
                      {u.full_name || "No name"}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === "owner" ? "bg-lime-300 text-black" : u.role === "super_admin" ? "bg-purple-400 text-black" : "bg-zinc-700"}`}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 truncate">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                    <p className="text-xs text-gray-500">{u.gym_name || "No gym"} · Last login {timeAgo(u.last_sign_in_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copy(u.id, u.id)} className="px-3 py-1.5 rounded-full text-xs border border-zinc-700 font-mono">
                    {copied === u.id ? "Copied ✓" : `ID ${u.id.slice(0, 8)}…`}
                  </button>
                  {u.role !== "super_admin" && (
                    <button onClick={() => startReset(u)} className="px-3 py-1.5 rounded-full text-xs bg-lime-300 text-black font-bold">Reset password</button>
                  )}
                </div>
              </div>

              {openId === u.id && (
                <div className="px-5 pb-5 border-t border-zinc-800 pt-4">
                  <div className="flex gap-2">
                    <input value={newPass} onChange={(e) => setNewPass(e.target.value)} className="flex-1 px-4 py-2.5 rounded-2xl bg-black border border-zinc-800 outline-none font-mono text-sm" />
                    <button onClick={() => setNewPass(makePassword())} className="px-4 rounded-2xl border border-zinc-700 text-sm">New</button>
                    <button onClick={() => saveReset(u)} className="px-4 rounded-2xl bg-lime-300 text-black text-sm font-bold">Save</button>
                  </div>
                  {creds && (
                    <div className="mt-3 p-4 rounded-2xl bg-black border border-lime-300">
                      <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans">{creds}</pre>
                      {!creds.startsWith("Error") && (
                        <button onClick={() => copy(creds, "creds")} className="mt-3 w-full py-2 rounded-xl bg-lime-300 text-black text-sm font-bold">
                          {copied === "creds" ? "Copied ✓" : "Copy login details"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}