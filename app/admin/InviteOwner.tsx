"use client";

import { useState } from "react";
import { createOwner } from "./actions";

type Props = { gyms: { id: string; name: string }[] };

function makePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

export default function InviteOwner({ gyms }: Props) {
  const [gymId, setGymId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(makePassword());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setMessage("Password must be at least 8 characters.");
    setLoading(true);
    setMessage("");
    setCredentials("");

    const result = await createOwner(gymId, email, fullName, password);
    setLoading(false);
    if (result.error) return setMessage("Error: " + result.error);

    const gymName = gyms.find((g) => g.id === gymId)?.name;
    setCredentials(
      `Hi ${fullName}, your ${gymName} dashboard is ready!\n\nLogin: ${window.location.origin}/login\nEmail: ${email.trim().toLowerCase()}\nPassword: ${password}`
    );
    setFullName("");
    setEmail("");
    setPassword(makePassword());
  }

  async function copy() {
    await navigator.clipboard.writeText(credentials);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const input = "w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none focus:border-lime-300";

  return (
    <form onSubmit={handleCreate} className="mt-10 p-6 rounded-3xl bg-zinc-900">
      <p className="font-bold text-lg">Create a gym owner</p>
      <p className="text-sm text-gray-400 mb-4">Share the login details with them on WhatsApp.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <select value={gymId} onChange={(e) => setGymId(e.target.value)} required className={input}>
          <option value="">Choose gym</option>
          {gyms.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <input placeholder="Owner name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={input} />
        <input type="email" placeholder="owner@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={input} />
        <div className="flex gap-2">
          <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={input} />
          <button type="button" onClick={() => setPassword(makePassword())}
            className="px-4 rounded-2xl border border-zinc-700 text-sm whitespace-nowrap">
            New
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="mt-4 w-full py-3 rounded-2xl bg-lime-300 text-black font-bold">
        {loading ? "Creating..." : "Create owner →"}
      </button>
      {message && <p className="mt-3 text-center text-red-400">{message}</p>}

      {credentials && (
        <div className="mt-5 p-5 rounded-2xl bg-black border border-lime-300">
          <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans">{credentials}</pre>
          <button type="button" onClick={copy} className="mt-4 w-full py-2 rounded-xl bg-lime-300 text-black font-bold">
            {copied ? "Copied ✓" : "Copy login details"}
          </button>
        </div>
      )}
    </form>
  );
}