"use server";

import { createClient } from "@/utils/supabase/server";
import { adminClient } from "@/utils/push";

function distanceM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function istToday() {
  return new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
}

type Input = { slug: string; code?: string | null; lat?: number | null; lng?: number | null; accuracy?: number | null };

export async function checkIn(input: Input) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "login" };

  const admin = adminClient();
  const { data: gym } = await admin
    .from("gyms")
    .select("id, name, latitude, longitude, geofence_m, checkin_code, checkin_images")
    .eq("slug", input.slug)
    .single();
  if (!gym) return { error: "This gym doesn't exist." };

  const { data: me } = await admin.from("profiles").select("full_name, role, gym_id, is_active").eq("id", user.id).single();
  if (!me || me.role !== "member" || me.gym_id !== gym.id) return { error: `You're not a member of ${gym.name}.` };
  if (!me.is_active) return { error: "Your access is paused. Talk to the front desk." };

  const today = istToday();
  const { data: ms } = await admin
    .from("memberships")
    .select("end_date")
    .eq("member_id", user.id)
    .order("end_date", { ascending: false })
    .limit(1);
  if (!ms?.[0] || ms[0].end_date < today) return { error: "Your plan has expired. Renew at the front desk to check in." };

  if (input.code && input.code !== gym.checkin_code) {
    return { error: "This QR code is old. Ask the front desk for the new one." };
  }

  let distance: number | null = null;
  if (gym.latitude != null && gym.longitude != null) {
    if (input.lat == null || input.lng == null) return { error: "location" };
    distance = Math.round(distanceM(gym.latitude, gym.longitude, input.lat, input.lng));
    const allowed = (gym.geofence_m || 150) + Math.min(input.accuracy || 0, 75);
    if (distance > allowed) {
      return { error: `You seem to be ${distance} m away from ${gym.name}. Check in when you're at the gym.` };
    }
  } else if (!input.code) {
    return { error: "Scan the QR code at the gym entrance to check in." };
  }

  const { error: insertError } = await admin.from("attendance").insert({
    gym_id: gym.id,
    member_id: user.id,
    checkin_date: today,
    method: input.code ? "qr" : "geo",
    distance_m: distance,
  });
  const already = !!insertError && insertError.code === "23505";
  if (insertError && !already) return { error: insertError.message };

  const monthStart = today.slice(0, 8) + "01";
  const [{ count: monthCount }, { count: total }] = await Promise.all([
    admin.from("attendance").select("id", { count: "exact", head: true }).eq("member_id", user.id).gte("checkin_date", monthStart),
    admin.from("attendance").select("id", { count: "exact", head: true }).eq("member_id", user.id),
  ]);

  return {
    ok: true,
    already,
    name: me.full_name.split(" ")[0],
    gymName: gym.name,
    visitsThisMonth: monthCount || 0,
    totalVisits: total || 0,
    images: (gym.checkin_images as string[] | null) || [],
  };
}