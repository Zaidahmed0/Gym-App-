"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

async function dashboardFor(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("role, gym_id").eq("id", userId).single();
  if (profile?.role === "super_admin") return "/admin";
  if (profile?.role === "owner") return "/owner";
  if (profile?.role === "member" && profile.gym_id) {
    const { data: gym } = await supabase.from("gyms").select("slug").eq("id", profile.gym_id).single();
    if (gym) return `/g/${gym.slug}/home`;
  }
  return null;
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const target = await dashboardFor(supabase, user.id);
        if (target) return router.replace(target);
      }
      setChecking(false);
    }
    check();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      setMessage("Wrong email or password.");
      setLoading(false);
      return;
    }

    const target = await dashboardFor(supabase, data.user.id);
    if (target) return router.replace(target);
    setMessage("No dashboard found for this account.");
    setLoading(false);
  }

  if (checking) return <main className="min-h-screen bg-black" />;

  const input = "w-full mb-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none focus:border-lime-300";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <h1 className="text-5xl font-black leading-none">
          Welcome <span className="text-lime-300">back</span>
        </h1>
        <p className="mt-3 mb-8 text-gray-400">Log in to your dashboard.</p>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} required />

        <button type="submit" disabled={loading} className="mt-3 w-full py-3 rounded-2xl bg-lime-300 text-black font-bold">
          {loading ? "Logging in..." : "Login →"}
        </button>

        {message && <p className="mt-4 text-center text-red-400">{message}</p>}
      </form>
    </main>
  );
}