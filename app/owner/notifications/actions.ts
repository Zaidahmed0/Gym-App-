"use server";

import { createClient } from "@/utils/supabase/server";
import { adminClient, pushToMembers, pushPendingNotifications } from "@/utils/push";

async function getOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: me } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
  if (me?.role !== "owner" || !me.gym_id) return null;
  const { data: gym } = await supabase.from("gyms").select("id, slug").eq("id", me.gym_id).single();
  return gym ? { supabase, gym } : null;
}

function istToday() {
  return new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
}

export async function pushAnnouncement(title: string, body: string | null, image: string | null, audience: string) {
  const owner = await getOwner();
  if (!owner) return { error: "Not allowed", sent: 0 };

  const { data: members } = await adminClient()
    .from("profiles")
    .select("id, memberships(end_date)")
    .eq("gym_id", owner.gym.id)
    .eq("role", "member")
    .eq("is_active", true);

  const today = Date.parse(istToday());
  const ids = (members || [])
    .filter((m) => {
      if (audience === "all") return true;
      const ends = ((m.memberships as { end_date: string }[]) || []).map((x) => x.end_date).sort();
      const last = ends[ends.length - 1];
      if (!last) return false;
      const left = Math.round((Date.parse(last) - today) / 86400000);
      if (audience === "active") return left >= 0;
      if (audience === "expiring") return left >= 0 && left <= 7;
      return true;
    })
    .map((m) => m.id);

  const sent = await pushToMembers(ids, {
    title,
    body,
    image,
    url: `/g/${owner.gym.slug}/home`,
    icon: `/g/${owner.gym.slug}/icon?size=192`,
  });
  return { sent };
}

export async function sendRemindersNow() {
  const owner = await getOwner();
  if (!owner) return { error: "Not allowed" };
  const { data, error } = await owner.supabase.rpc("send_expiry_reminders", { p_gym: owner.gym.id });
  if (error) return { error: error.message };
  const sent = await pushPendingNotifications(owner.gym.id);
  return { created: (data as number) || 0, sent };
}