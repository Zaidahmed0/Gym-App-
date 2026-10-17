"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, MessageCircle, HeartPulse, ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { textOn, formatDate } from "@/utils/theme";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  emergency_name: string | null;
  emergency_relation: string | null;
  emergency_phone: string | null;
  address: string | null;
  medical_notes: string | null;
  occupation: string | null;
  referred_by: string | null;
  joined_on: string | null;
  owner_notes: string | null;
};
type Membership = { id: string; plan_name: string; start_date: string; end_date: string; amount: number; fee: number | null };
type Payment = { id: string; membership_id: string | null; member_service_id: string | null; amount: number; method: string; paid_on: string; note: string | null };
type Service = { id: string; name: string; price: number; duration_days: number | null; is_active: boolean };
type MemberService = { id: string; service_id: string | null; name: string; start_date: string; end_date: string | null; fee: number };
type Visit = { checkin_date: string; checked_in_at: string; method: string };

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const METHODS = ["cash", "upi", "card", "bank", "other"];
const TABS = ["Profile", "Payments", "Services", "Attendance"] as const;

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

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [gym, setGym] = useState<{ id: string; name: string; accent_color: string } | null>(null);
  const [today, setToday] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  const [p, setP] = useState<Profile | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [catalog, setCatalog] = useState<Service[]>([]);
  const [mServices, setMServices] = useState<MemberService[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [msg, setMsg] = useState("");

  const [payTarget, setPayTarget] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payNote, setPayNote] = useState("");
  const [feeEdit, setFeeEdit] = useState<Record<string, string>>({});

  const [svcId, setSvcId] = useState("");
  const [svcFee, setSvcFee] = useState("");
  const [svcPaid, setSvcPaid] = useState("");
  const [newSvcName, setNewSvcName] = useState("");
  const [newSvcPrice, setNewSvcPrice] = useState("");
  const [newSvcDays, setNewSvcDays] = useState("30");

  async function load(gymId: string, t: string) {
    const [pr, ms, pay, cat, msv, att] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).eq("gym_id", gymId).single(),
      supabase.from("memberships").select("id, plan_name, start_date, end_date, amount, fee").eq("member_id", id).order("start_date", { ascending: false }),
      supabase.from("payments").select("id, membership_id, member_service_id, amount, method, paid_on, note").eq("member_id", id).order("paid_on", { ascending: false }),
      supabase.from("services").select("id, name, price, duration_days, is_active").eq("gym_id", gymId).order("name"),
      supabase.from("member_services").select("id, service_id, name, start_date, end_date, fee").eq("member_id", id).order("start_date", { ascending: false }),
      supabase.from("attendance").select("checkin_date, checked_in_at, method").eq("member_id", id).gte("checkin_date", shiftDate(t, -60)).order("checkin_date", { ascending: false }),
    ]);
    if (!pr.data) {
      setDenied(true);
      return;
    }
    setP(pr.data as Profile);
    setForm(pr.data as Profile);
    setMemberships((ms.data as Membership[]) || []);
    setPayments((pay.data as Payment[]) || []);
    setCatalog((cat.data as Service[]) || []);
    setMServices((msv.data as MemberService[]) || []);
    setVisits((att.data as Visit[]) || []);
  }

  useEffect(() => {
    async function init() {
      const t = formatDate(new Date());
      setToday(t);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data: me } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
      if (me?.role !== "owner") {
        setDenied(true);
        setLoading(false);
        return;
      }
      const { data: g } = await supabase.from("gyms").select("id, name, accent_color").eq("id", me.gym_id).single();
      setGym(g);
      if (g) await load(g.id, t);
      setLoading(false);
    }
    init();
  }, [id]);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  async function saveProfile() {
    if (!gym) return;
    const fields: (keyof Profile)[] = [
      "full_name", "phone", "date_of_birth", "gender", "blood_group", "emergency_name", "emergency_relation",
      "emergency_phone", "address", "medical_notes", "occupation", "referred_by", "joined_on", "owner_notes",
    ];
    const update: Record<string, unknown> = {};
    fields.forEach((f) => { update[f] = form[f] === "" ? null : form[f] ?? null; });
    const { error } = await supabase.from("profiles").update(update).eq("id", id);
    if (error) return flash("Error: " + error.message);
    flash("Profile saved");
    load(gym.id, today);
  }

  async function saveFee(m: Membership) {
    if (!gym) return;
    const value = Number(feeEdit[m.id]);
    if (Number.isNaN(value)) return;
    const { error } = await supabase.from("memberships").update({ fee: value }).eq("id", m.id);
    if (error) return flash("Error: " + error.message);
    setFeeEdit((f) => ({ ...f, [m.id]: "" }));
    flash("Fee updated");
    load(gym.id, today);
  }

  async function recordPayment() {
    if (!gym || !payTarget || !payAmount) return;
    const [kind, targetId] = payTarget.split(":");
    const { error } = await supabase.from("payments").insert({
      gym_id: gym.id,
      member_id: id,
      membership_id: kind === "m" ? targetId : null,
      member_service_id: kind === "s" ? targetId : null,
      amount: Number(payAmount),
      method: payMethod,
      paid_on: today,
      note: payNote || null,
    });
    if (error) return flash("Error: " + error.message);
    setPayAmount("");
    setPayNote("");
    flash("Payment recorded");
    load(gym.id, today);
  }

  async function deletePayment(pid: string) {
    if (!gym || !confirm("Delete this payment entry?")) return;
    await supabase.from("payments").delete().eq("id", pid);
    load(gym.id, today);
  }

  async function addCatalogService() {
    if (!gym || !newSvcName) return;
    const { error } = await supabase.from("services").insert({
      gym_id: gym.id,
      name: newSvcName,
      price: Number(newSvcPrice) || 0,
      duration_days: Number(newSvcDays) || null,
    });
    if (error) return flash("Error: " + error.message);
    setNewSvcName("");
    setNewSvcPrice("");
    flash("Service added to your list");
    load(gym.id, today);
  }

  async function assignService() {
    if (!gym || !svcId) return;
    const svc = catalog.find((s) => s.id === svcId);
    if (!svc) return;
    const fee = svcFee ? Number(svcFee) : Number(svc.price);
    const { data, error } = await supabase
      .from("member_services")
      .insert({
        gym_id: gym.id,
        member_id: id,
        service_id: svc.id,
        name: svc.name,
        start_date: today,
        end_date: svc.duration_days ? shiftDate(today, svc.duration_days) : null,
        fee,
      })
      .select("id")
      .single();
    if (error) return flash("Error: " + error.message);
    if (Number(svcPaid) > 0 && data) {
      await supabase.from("payments").insert({
        gym_id: gym.id, member_id: id, member_service_id: data.id, amount: Number(svcPaid), method: payMethod, paid_on: today,
      });
    }
    setSvcId("");
    setSvcFee("");
    setSvcPaid("");
    flash(`${svc.name} added`);
    load(gym.id, today);
  }

  async function removeService(msId: string) {
    if (!gym || !confirm("Remove this service from the member?")) return;
    await supabase.from("member_services").delete().eq("id", msId);
    load(gym.id, today);
  }

  if (loading) return <main className="min-h-screen bg-black text-gray-400 p-8">Loading...</main>;
  if (denied || !gym || !p) return <main className="min-h-screen bg-black text-red-400 p-8">Member not found</main>;

  const accent = gym.accent_color;
  const onAccent = textOn(accent);
  const accentStyle = { background: accent, color: onAccent };
  const card = "p-5 rounded-3xl bg-zinc-900";
  const input = "w-full px-4 py-3 rounded-2xl bg-black border border-zinc-800 outline-none";
  const label = "block mb-1.5 mt-4 text-xs text-gray-400";

  const paidFor = (kind: "m" | "s", targetId: string) =>
    payments.filter((x) => (kind === "m" ? x.membership_id : x.member_service_id) === targetId).reduce((s, x) => s + Number(x.amount), 0);

  const membershipDues = memberships.map((m) => ({ ...m, paid: paidFor("m", m.id), due: Number(m.fee ?? m.amount ?? 0) - paidFor("m", m.id) }));
  const serviceDues = mServices.map((s) => ({ ...s, paid: paidFor("s", s.id), due: Number(s.fee || 0) - paidFor("s", s.id) }));
  const totalDue = [...membershipDues, ...serviceDues].reduce((s, x) => s + Math.max(0, x.due), 0);
  const totalPaid = payments.reduce((s, x) => s + Number(x.amount), 0);

  const latest = memberships[0];
  const daysLeft = latest ? diffDays(today, latest.end_date) : -1;
  const tenure = p.joined_on ? diffDays(p.joined_on, today) : null;
  const age = p.date_of_birth ? Math.floor(diffDays(p.date_of_birth, today) / 365.25) : null;
  const firstName = p.full_name.split(" ")[0];

  const visitSet = new Set(visits.map((v) => v.checkin_date));
  const last30 = visits.filter((v) => v.checkin_date >= shiftDate(today, -29)).length;
  const grid = Array.from({ length: 60 }, (_, i) => shiftDate(today, i - 59));

  const field = (key: keyof Profile, text: string, type = "text", placeholder = "") => (
    <div>
      <label className={label}>{text}</label>
      <input type={type} value={(form[key] as string) || ""} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={input} />
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.push("/owner")} className="flex items-center gap-1 text-sm text-gray-400"><ArrowLeft size={16} /> Members</button>

        <div className="mt-6 flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black" style={accentStyle}>
              {p.full_name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black leading-none">{p.full_name}</h1>
              <p className="mt-1 text-sm text-gray-400">
                {tenure !== null ? `Member for ${tenure} days` : "Joining date not set"}
                {age !== null ? ` · ${age} yrs` : ""}{p.gender ? ` · ${p.gender}` : ""}
              </p>
              <div className="mt-2 flex gap-2 flex-wrap text-xs">
                <span className="px-3 py-1 rounded-full font-bold"
                  style={!p.is_active ? { background: "#3f3f46" } : daysLeft < 0 ? { background: "#7f1d1d", color: "#fecaca" } : daysLeft <= 7 ? { background: "#7c2d12", color: "#fed7aa" } : accentStyle}>
                  {!p.is_active ? "Inactive" : daysLeft < 0 ? "Expired" : `${daysLeft} days left`}
                </span>
                {totalDue > 0 && <span className="px-3 py-1 rounded-full font-bold bg-red-500/20 text-red-300">Due {rupee(totalDue)}</span>}
                <span className="px-3 py-1 rounded-full bg-zinc-800">{last30} visits in 30 days</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {p.phone && <a href={`tel:${p.phone}`} className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center" aria-label="Call"><Phone size={18} /></a>}
            {p.phone && (
              <a href={waLink(p.phone, `Hi ${firstName}!`)} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-green-500 text-black flex items-center justify-center" aria-label="WhatsApp">
                <MessageCircle size={18} />
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 p-5 rounded-3xl border border-red-900 bg-red-950/40 grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <HeartPulse className="text-red-400 shrink-0" size={22} />
            <div>
              <p className="text-xs text-red-300">Emergency contact</p>
              <p className="font-bold">{p.emergency_name || "Not added"}{p.emergency_relation ? ` (${p.emergency_relation})` : ""}</p>
              {p.emergency_phone && <a href={`tel:${p.emergency_phone}`} className="text-sm underline">{p.emergency_phone}</a>}
            </div>
          </div>
          <div>
            <p className="text-xs text-red-300">Blood group</p>
            <p className="text-2xl font-black">{p.blood_group || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-red-300">Injuries / medical notes</p>
            <p className="text-sm">{p.medical_notes || "None recorded"}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className="px-5 py-2.5 rounded-full text-sm shrink-0 border"
              style={tab === t ? { ...accentStyle, borderColor: accent } : { borderColor: "#3f3f46", color: "#d4d4d8" }}>
              {t}
            </button>
          ))}
        </div>

        {msg && <p className="mt-4 text-sm" style={{ color: accent }}>{msg}</p>}

        {tab === "Profile" && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className={card}>
              <p className="font-bold">Basic details</p>
              {field("full_name", "Full name")}
              {field("phone", "Phone")}
              <label className={label}>Email</label>
              <div className={`${input} text-gray-500`}>{p.email}</div>
              {field("date_of_birth", "Date of birth", "date")}
              <label className={label}>Gender</label>
              <select value={form.gender || ""} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={input}>
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {field("occupation", "Occupation", "text", "Student, IT, business...")}
              {field("address", "Address / area")}
              {field("joined_on", "Joined on", "date")}
              {field("referred_by", "Referred by", "text", "Friend's name or Instagram, Google...")}
            </div>
            <div className="grid gap-4 h-fit">
              <div className={card}>
                <p className="font-bold">Health & emergency</p>
                <label className={label}>Blood group</label>
                <select value={form.blood_group || ""} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className={input}>
                  <option value="">Not set</option>
                  {BLOOD.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {field("emergency_name", "Emergency contact name")}
                {field("emergency_relation", "Relation", "text", "Father, wife, brother...")}
                {field("emergency_phone", "Emergency phone", "tel")}
                <label className={label}>Injuries / medical conditions</label>
                <textarea value={form.medical_notes || ""} onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} rows={3}
                  placeholder="Knee pain, back injury, BP, diabetes..." className={input} />
              </div>
              <div className={card}>
                <p className="font-bold">Private notes</p>
                <p className="text-xs text-gray-500">Only you can see these.</p>
                <textarea value={form.owner_notes || ""} onChange={(e) => setForm({ ...form, owner_notes: e.target.value })} rows={3} className={`${input} mt-3`} />
              </div>
              <button onClick={saveProfile} className="py-3.5 rounded-2xl font-bold" style={accentStyle}>Save profile →</button>
            </div>
          </div>
        )}

        {tab === "Payments" && (
          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-5 rounded-3xl bg-zinc-900"><p className="text-xs text-gray-400">Total paid</p><p className="text-3xl font-black">{rupee(totalPaid)}</p></div>
              <div className="p-5 rounded-3xl bg-zinc-900"><p className="text-xs text-gray-400">Due now</p><p className={`text-3xl font-black ${totalDue > 0 ? "text-red-400" : ""}`}>{rupee(totalDue)}</p></div>
              {totalDue > 0 && (
                <a href={waLink(p.phone, `Hi ${firstName}, a gentle reminder from ${gym.name}: ${rupee(totalDue)} is pending. You can pay at the front desk. Thank you! 🙏`)}
                  target="_blank" rel="noreferrer" className="p-5 rounded-3xl bg-green-500 text-black font-bold flex items-center justify-center text-center col-span-2 md:col-span-1">
                  Send due reminder on WhatsApp
                </a>
              )}
            </div>

            <div className={card}>
              <p className="font-bold">Record a payment</p>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <select value={payTarget} onChange={(e) => setPayTarget(e.target.value)} className={`${input} md:col-span-2`}>
                  <option value="">For which plan or service?</option>
                  {membershipDues.map((m) => (
                    <option key={m.id} value={`m:${m.id}`}>{m.plan_name} ({m.start_date}){m.due > 0 ? ` · due ${rupee(m.due)}` : ""}</option>
                  ))}
                  {serviceDues.map((s) => (
                    <option key={s.id} value={`s:${s.id}`}>{s.name}{s.due > 0 ? ` · due ${rupee(s.due)}` : ""}</option>
                  ))}
                </select>
                <input type="number" placeholder="Amount ₹" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={input} />
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className={input}>
                  {METHODS.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <input placeholder="Note (optional)" value={payNote} onChange={(e) => setPayNote(e.target.value)} className={`${input} mt-3`} />
              <button onClick={recordPayment} className="mt-3 w-full py-3 rounded-2xl font-bold" style={accentStyle}>Record payment</button>
            </div>

            <div className={card}>
              <p className="font-bold">Plans</p>
              <div className="mt-3 grid gap-2">
                {membershipDues.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-black grid md:grid-cols-[1fr_auto] gap-3 items-center">
                    <div>
                      <p className="font-bold">{m.plan_name} <span className="text-xs text-gray-500">{m.start_date} → {m.end_date}</span></p>
                      <p className="text-sm text-gray-400">
                        Fee {rupee(Number(m.fee ?? m.amount ?? 0))} · Paid {rupee(m.paid)} · {m.due > 0 ? <span className="text-red-400">Due {rupee(m.due)}</span> : <span style={{ color: accent }}>Fully paid</span>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Total fee" value={feeEdit[m.id] ?? ""} onChange={(e) => setFeeEdit({ ...feeEdit, [m.id]: e.target.value })}
                        className="w-28 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 outline-none text-sm" />
                      <button onClick={() => saveFee(m)} className="px-3 rounded-xl text-sm border border-zinc-700">Set fee</button>
                    </div>
                  </div>
                ))}
                {memberships.length === 0 && <p className="text-sm text-gray-500">No plans yet.</p>}
              </div>
            </div>

            <div className={card}>
              <p className="font-bold">Payment history</p>
              <div className="mt-3 grid gap-2">
                {payments.map((x) => (
                  <div key={x.id} className="px-4 py-3 rounded-2xl bg-black flex justify-between items-center text-sm gap-3">
                    <div>
                      <p className="font-bold">{rupee(Number(x.amount))} <span className="text-xs text-gray-500 uppercase">{x.method}</span></p>
                      <p className="text-xs text-gray-500">{x.paid_on}{x.note ? ` · ${x.note}` : ""}</p>
                    </div>
                    <button onClick={() => deletePayment(x.id)} className="text-xs text-red-400">Delete</button>
                  </div>
                ))}
                {payments.length === 0 && <p className="text-sm text-gray-500">No payments yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === "Services" && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className={card}>
              <p className="font-bold">Add a service to {firstName}</p>
              {catalog.filter((s) => s.is_active).length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">Create your first service on the right (Personal Training, Diet plan, Locker...).</p>
              ) : (
                <>
                  <select value={svcId} onChange={(e) => { setSvcId(e.target.value); setSvcFee(String(catalog.find((s) => s.id === e.target.value)?.price ?? "")); }}
                    className={`${input} mt-3`}>
                    <option value="">Choose service</option>
                    {catalog.filter((s) => s.is_active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name} · {rupee(Number(s.price))}{s.duration_days ? ` / ${s.duration_days} days` : ""}</option>
                    ))}
                  </select>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Fee ₹" value={svcFee} onChange={(e) => setSvcFee(e.target.value)} className={input} />
                    <input type="number" placeholder="Paid now ₹" value={svcPaid} onChange={(e) => setSvcPaid(e.target.value)} className={input} />
                  </div>
                  <button onClick={assignService} className="mt-3 w-full py-3 rounded-2xl font-bold" style={accentStyle}>Add service</button>
                </>
              )}

              <p className="mt-6 font-bold">{firstName}&apos;s services</p>
              <div className="mt-3 grid gap-2">
                {serviceDues.map((s) => {
                  const left = s.end_date ? diffDays(today, s.end_date) : null;
                  return (
                    <div key={s.id} className="p-4 rounded-2xl bg-black flex justify-between items-center gap-3">
                      <div>
                        <p className="font-bold">{s.name}</p>
                        <p className="text-xs text-gray-500">
                          {s.start_date}{s.end_date ? ` → ${s.end_date}` : ""}{left !== null ? (left < 0 ? " · ended" : ` · ${left} days left`) : ""}
                        </p>
                        <p className="text-xs">{s.due > 0 ? <span className="text-red-400">Due {rupee(s.due)}</span> : <span style={{ color: accent }}>Paid</span>}</p>
                      </div>
                      <button onClick={() => removeService(s.id)} className="text-xs text-red-400">Remove</button>
                    </div>
                  );
                })}
                {mServices.length === 0 && <p className="text-sm text-gray-500">No services yet.</p>}
              </div>
            </div>

            <div className={`${card} h-fit`}>
              <p className="font-bold">Your services list</p>
              <p className="text-xs text-gray-500">Used for all members.</p>
              <div className="mt-3 grid gap-2">
                {catalog.map((s) => (
                  <div key={s.id} className="px-4 py-3 rounded-2xl bg-black flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="text-gray-400">{rupee(Number(s.price))}{s.duration_days ? ` / ${s.duration_days}d` : ""}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                <input placeholder="Service name, like Personal Training" value={newSvcName} onChange={(e) => setNewSvcName(e.target.value)} className={input} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Price ₹" value={newSvcPrice} onChange={(e) => setNewSvcPrice(e.target.value)} className={input} />
                  <input type="number" placeholder="Days" value={newSvcDays} onChange={(e) => setNewSvcDays(e.target.value)} className={input} />
                </div>
                <button onClick={addCatalogService} className="py-3 rounded-2xl border border-zinc-700 flex items-center justify-center gap-1 text-sm"><Plus size={16} /> Create service</button>
              </div>
            </div>
          </div>
        )}

        {tab === "Attendance" && (
          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-5 rounded-3xl bg-zinc-900"><p className="text-xs text-gray-400">Last 30 days</p><p className="text-3xl font-black">{last30}</p></div>
              <div className="p-5 rounded-3xl bg-zinc-900"><p className="text-xs text-gray-400">Per week</p><p className="text-3xl font-black">{(last30 / 4.3).toFixed(1)}</p></div>
              <div className="p-5 rounded-3xl bg-zinc-900"><p className="text-xs text-gray-400">Last visit</p><p className="text-lg font-black">{visits[0]?.checkin_date || "Never"}</p></div>
            </div>
            <div className={card}>
              <p className="font-bold">Last 60 days</p>
              <div className="mt-4 grid grid-cols-10 md:grid-cols-[repeat(20,minmax(0,1fr))] gap-1.5">
                {grid.map((d) => (
                  <div key={d} title={d} className="aspect-square rounded-md"
                    style={{ background: visitSet.has(d) ? accent : "#27272a", outline: d === today ? "1.5px solid #fff" : "none" }} />
                ))}
              </div>
              <div className="mt-4 grid gap-1.5">
                {visits.slice(0, 10).map((v) => (
                  <div key={v.checked_in_at} className="px-4 py-2.5 rounded-xl bg-black flex justify-between text-sm">
                    <span>{v.checkin_date}</span>
                    <span className="text-gray-400">
                      {new Date(v.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {v.method === "qr" ? "QR" : v.method === "geo" ? "Location" : "Manual"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}