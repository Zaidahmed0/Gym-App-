"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Cake } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { textOn, formatDate } from "@/utils/theme";

type Member = {
  id: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  joined_on: string | null;
  date_of_birth: string | null;
  memberships: { id: string; start_date: string; end_date: string; fee: number | null; amount: number }[];
};
type Payment = { amount: number; membership_id: string | null; member_service_id: string | null; paid_on: string; member_id: string };
type MS = { id: string; member_id: string; name: string; end_date: string | null; fee: number };
type Visit = { member_id: string; checkin_date: string; checked_in_at: string };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shiftDate(d: string, n: number) {
  const [y, m, day] = d.split("-").map(Number);
  return formatDate(new Date(y, m - 1, day + n));
}
function diffDays(a: string, b: string) {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86400000);
}
function waLink(phone: string | null, text: string) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function InsightsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [gym, setGym] = useState<{ id: string; name: string; accent_color: string } | null>(null);
  const [today, setToday] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<MS[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    async function init() {
      const t = formatDate(new Date());
      setToday(t);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: me } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
      if (me?.role !== "owner") {
        setLoading(false);
        return;
      }
      const { data: g } = await supabase.from("gyms").select("id, name, accent_color").eq("id", me.gym_id).single();
      if (!g) {
        setLoading(false);
        return;
      }
      setGym(g);
      const [mem, pay, svc, att] = await Promise.all([
        supabase.from("profiles")
          .select("id, full_name, phone, is_active, joined_on, date_of_birth, memberships(id, start_date, end_date, fee, amount)")
          .eq("gym_id", g.id).eq("role", "member"),
        supabase.from("payments").select("amount, membership_id, member_service_id, paid_on, member_id").eq("gym_id", g.id),
        supabase.from("member_services").select("id, member_id, name, end_date, fee").eq("gym_id", g.id),
        supabase.from("attendance").select("member_id, checkin_date, checked_in_at").eq("gym_id", g.id).gte("checkin_date", shiftDate(t, -29)),
      ]);
      setMembers((mem.data as Member[]) || []);
      setPayments((pay.data as Payment[]) || []);
      setServices((svc.data as MS[]) || []);
      setVisits((att.data as Visit[]) || []);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (!gym) return <main className="min-h-screen bg-black text-red-400 p-8">Access denied</main>;

  const accent = gym.accent_color;
  const onAccent = textOn(accent);
  const accentStyle = { background: accent, color: onAccent };
  const card = "p-6 rounded-3xl bg-zinc-900";
  const monthStart = today.slice(0, 8) + "01";

  const latestOf = (m: Member) => [...(m.memberships || [])].sort((a, b) => b.end_date.localeCompare(a.end_date))[0];

  let active = 0, expiring = 0, expired = 0, inactive = 0;
  members.forEach((m) => {
    if (!m.is_active) return void inactive++;
    const l = latestOf(m);
    if (!l || l.end_date < today) return void expired++;
    active++;
    if (diffDays(today, l.end_date) <= 7) expiring++;
  });
  const activeIds = new Set(members.filter((m) => m.is_active && latestOf(m)?.end_date >= today).map((m) => m.id));

  const todayIn = new Set(visits.filter((v) => v.checkin_date === today).map((v) => v.member_id));
  const notYet = [...activeIds].filter((id) => !todayIn.has(id)).length;

  const newJoins = members.filter((m) => (m.joined_on || "") >= monthStart).length;
  const renewals = members.reduce(
    (n, m) => n + (m.memberships || []).filter((x) => x.start_date >= monthStart && (m.joined_on || "") < monthStart).length, 0);
  const collected = payments.filter((p) => p.paid_on >= monthStart).reduce((s, p) => s + Number(p.amount), 0);

  const paidBy = new Map<string, number>();
  payments.forEach((p) => {
    const key = p.membership_id ? `m:${p.membership_id}` : p.member_service_id ? `s:${p.member_service_id}` : "";
    if (key) paidBy.set(key, (paidBy.get(key) || 0) + Number(p.amount));
  });
  const dueByMember = new Map<string, number>();
  members.forEach((m) => (m.memberships || []).forEach((x) => {
    const due = Number(x.fee ?? x.amount ?? 0) - (paidBy.get(`m:${x.id}`) || 0);
    if (due > 0) dueByMember.set(m.id, (dueByMember.get(m.id) || 0) + due);
  }));
  services.forEach((s) => {
    const due = Number(s.fee || 0) - (paidBy.get(`s:${s.id}`) || 0);
    if (due > 0) dueByMember.set(s.member_id, (dueByMember.get(s.member_id) || 0) + due);
  });
  const dues = [...dueByMember.entries()]
    .map(([id, amount]) => ({ m: members.find((x) => x.id === id)!, amount }))
    .filter((d) => d.m)
    .sort((a, b) => b.amount - a.amount);
  const totalDue = dues.reduce((s, d) => s + d.amount, 0);

  const hours = Array.from({ length: 24 }, () => 0);
  const weekdays = Array.from({ length: 7 }, () => 0);
  visits.forEach((v) => {
    hours[new Date(v.checked_in_at).getHours()]++;
    const [y, mo, d] = v.checkin_date.split("-").map(Number);
    weekdays[new Date(y, mo - 1, d).getDay()]++;
  });
  const shownHours = hours.slice(5, 23);
  const maxHour = Math.max(1, ...shownHours);
  const maxDay = Math.max(1, ...weekdays);
  const peakHour = hours.indexOf(Math.max(...hours));
  const avgPerWeek = activeIds.size ? (visits.filter((v) => activeIds.has(v.member_id)).length / activeIds.size / 4.3).toFixed(1) : "0";

  const birthdays = members
    .filter((m) => m.date_of_birth)
    .map((m) => {
      const [, mo, d] = m.date_of_birth!.split("-").map(Number);
      let next = `${today.slice(0, 4)}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (next < today) next = `${Number(today.slice(0, 4)) + 1}${next.slice(4)}`;
      return { m, inDays: diffDays(today, next) };
    })
    .filter((b) => b.inDays <= 7)
    .sort((a, b) => a.inDays - b.inDays);

  const tenure = [0, 0, 0, 0];
  members.filter((m) => activeIds.has(m.id)).forEach((m) => {
    const d = m.joined_on ? diffDays(m.joined_on, today) : 0;
    tenure[d < 30 ? 0 : d < 90 ? 1 : d < 365 ? 2 : 3]++;
  });
  const tenureLabels = ["0-30 days", "1-3 months", "3-12 months", "1 year+"];
  const maxTenure = Math.max(1, ...tenure);

  const activeServices = services.filter((s) => !s.end_date || s.end_date >= today);
  const serviceCounts = new Map<string, number>();
  activeServices.forEach((s) => serviceCounts.set(s.name, (serviceCounts.get(s.name) || 0) + 1));

  const stat = (label: string, value: string | number, highlight = false, color = "") => (
    <div className="p-5 rounded-3xl" style={highlight ? accentStyle : { background: "#18181b" }}>
      <p className={`text-xs ${highlight ? "" : "text-gray-400"}`}>{label}</p>
      <p className={`text-3xl md:text-4xl font-black ${color}`}>{value}</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push("/owner")} className="flex items-center gap-1 text-sm text-gray-400"><ArrowLeft size={16} /> Members</button>
        <h1 className="mt-4 text-5xl font-black leading-none">In<span style={{ color: accent }}>sights</span></h1>
        <p className="mt-2 text-gray-400">{gym.name} · {today}</p>

        <p className="mt-8 mb-3 font-bold text-lg">Today</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stat("Checked in today", todayIn.size, true)}
          {stat("Active, not in yet", notYet)}
          {stat("Peak hour (30 days)", visits.length ? `${peakHour % 12 || 12} ${peakHour < 12 ? "AM" : "PM"}` : "-")}
          {stat("Avg visits / member / week", avgPerWeek)}
        </div>

        <p className="mt-8 mb-3 font-bold text-lg">This month</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stat("Collected", rupee(collected), true)}
          {stat("Pending dues", rupee(totalDue), false, totalDue > 0 ? "text-red-400" : "")}
          {stat("New members", newJoins)}
          {stat("Renewals", renewals)}
        </div>

        <p className="mt-8 mb-3 font-bold text-lg">Members</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stat("Active", active)}
          {stat("Expiring in 7 days", expiring, false, "text-orange-400")}
          {stat("Expired", expired, false, "text-red-400")}
          {stat("Inactive", inactive)}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <p className="font-bold">Busy hours</p>
            <p className="text-xs text-gray-500">Check-ins in the last 30 days</p>
            <div className="mt-4 flex items-end gap-1 h-32">
              {shownHours.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm" style={{ height: `${Math.max(3, (c / maxHour) * 100)}%`, background: c === maxHour && c > 0 ? accent : "#3f3f46" }} />
                  <span className="text-[8px] text-gray-500">{(i + 5) % 12 || 12}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={card}>
            <p className="font-bold">Busy days</p>
            <p className="text-xs text-gray-500">Check-ins in the last 30 days</p>
            <div className="mt-4 grid gap-2">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <div key={d} className="flex items-center gap-3 text-sm">
                  <span className="w-9 text-gray-400">{DAYS[d]}</span>
                  <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(weekdays[d] / maxDay) * 100}%`, background: accent }} />
                  </div>
                  <span className="w-8 text-right">{weekdays[d]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={card}>
            <div className="flex justify-between items-center">
              <p className="font-bold">Pending dues</p>
              <p className="font-black text-red-400">{rupee(totalDue)}</p>
            </div>
            <div className="mt-3 grid gap-2">
              {dues.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">Everyone has paid. 🎉</p>}
              {dues.slice(0, 12).map(({ m, amount }) => (
                <div key={m.id} className="px-4 py-3 rounded-2xl bg-black flex justify-between items-center gap-3">
                  <button onClick={() => router.push(`/owner/members/${m.id}`)} className="text-left">
                    <p className="font-bold text-sm">{m.full_name}</p>
                    <p className="text-xs text-red-400">{rupee(amount)} due</p>
                  </button>
                  <a href={waLink(m.phone, `Hi ${m.full_name.split(" ")[0]}, a gentle reminder from ${gym.name}: ${rupee(amount)} is pending. You can pay at the front desk. Thank you! 🙏`)}
                    target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-black shrink-0">Remind</a>
                </div>
              ))}
            </div>
          </div>

          <div className={card}>
            <p className="font-bold flex items-center gap-2"><Cake size={18} color={accent} /> Birthdays this week</p>
            <div className="mt-3 grid gap-2">
              {birthdays.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">No birthdays in the next 7 days. Add dates of birth in member profiles.</p>}
              {birthdays.map(({ m, inDays }) => (
                <div key={m.id} className="px-4 py-3 rounded-2xl bg-black flex justify-between items-center gap-3">
                  <div>
                    <p className="font-bold text-sm">{m.full_name}</p>
                    <p className="text-xs" style={{ color: accent }}>{inDays === 0 ? "Today! 🎂" : inDays === 1 ? "Tomorrow" : `In ${inDays} days`}</p>
                  </div>
                  <a href={waLink(m.phone, `Happy birthday ${m.full_name.split(" ")[0]}! 🎂💪 Wishing you a strong year ahead from all of us at ${gym.name}!`)}
                    target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 text-black shrink-0">Wish</a>
                </div>
              ))}
            </div>
          </div>

          <div className={card}>
            <p className="font-bold">How long members have been with you</p>
            <div className="mt-4 grid gap-3">
              {tenure.map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-gray-400">{tenureLabels[i]}</span>
                  <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c / maxTenure) * 100}%`, background: accent }} />
                  </div>
                  <span className="w-8 text-right">{c}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">New members (0-30 days) need the most attention to stay.</p>
          </div>

          <div className={card}>
            <p className="font-bold">Active services</p>
            <div className="mt-3 grid gap-2">
              {serviceCounts.size === 0 && <p className="text-sm text-gray-500 py-4 text-center">No services yet. Add them from any member&apos;s Full profile → Services.</p>}
              {[...serviceCounts.entries()].map(([name, count]) => (
                <div key={name} className="px-4 py-3 rounded-2xl bg-black flex justify-between text-sm">
                  <span>{name}</span><span className="font-bold">{count} members</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}