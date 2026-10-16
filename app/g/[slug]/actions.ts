"use server";

import { createClient } from "@/utils/supabase/server";
import { adminClient } from "@/utils/push";

type Sub = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

export async function savePushSubscription(sub: Sub) {
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return { error: "Invalid subscription" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: me } = await supabase.from("profiles").select("gym_id, role").eq("id", user.id).single();
  if (me?.role !== "member") return { error: "Not a member" };

  const { error } = await adminClient()
    .from("push_subscriptions")
    .upsert(
      { member_id: user.id, gym_id: me.gym_id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      { onConflict: "endpoint" }
    );

  return error ? { error: error.message } : { success: true };
}