"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function startSession() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        window.history.replaceState(null, "", "/set-password");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("This invite link is invalid or expired. Ask your admin for a new one.");
      }
      setReady(true);
    }
    startSession();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) return setMessage("Password must be at least 8 characters.");
    if (password !== confirm) return setMessage("Passwords don't match.");

    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      return setMessage("Error: " + error.message);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "owner") router.push("/owner");
    else if (profile?.role === "super_admin") router.push("/admin");
    else router.push("/");
  }

  const input = "w-full mb-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none focus:border-lime-300";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form onSubmit={handleSave} className="w-full max-w-sm">
        <h1 className="text-5xl font-black leading-none">
          Set your <span className="text-lime-300">password</span>
        </h1>
        <p className="mt-3 mb-8 text-gray-400">One last step and you're in.</p>

        {!ready ? (
          <p className="text-gray-400">Checking your invite...</p>
        ) : (
          <>
            <input type="password" placeholder="New password" value={password}
              onChange={(e) => setPassword(e.target.value)} className={input} required />
            <input type="password" placeholder="Confirm password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} className={input} required />
            <button type="submit" disabled={loading}
              className="mt-3 w-full py-3 rounded-2xl bg-lime-300 text-black font-bold">
              {loading ? "Saving..." : "Save and continue →"}
            </button>
          </>
        )}

        {message && <p className="mt-4 text-center text-lime-300">{message}</p>}
      </form>
    </main>
  );
}