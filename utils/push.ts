import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export type PushPayload = {
  title: string;
  body?: string | null;
  image?: string | null;
  icon?: string;
  url: string;
};

export async function pushToMembers(memberIds: string[], payload: PushPayload) {
  if (!memberIds.length) return 0;
  configure();
  const admin = adminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("member_id", memberIds);

  let sent = 0;
  await Promise.all(
    (subs || []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    })
  );
  return sent;
}

export async function pushPendingNotifications(gymId?: string) {
  const admin = adminClient();
  const since = new Date(Date.now() - 2 * 86400000).toISOString();
  let query = admin
    .from("notifications")
    .select("id, member_id, gym_id, title, body, image_url")
    .is("pushed_at", null)
    .gte("created_at", since);
  if (gymId) query = query.eq("gym_id", gymId);

  const { data } = await query;
  if (!data?.length) return 0;

  const gymIds = [...new Set(data.map((n) => n.gym_id).filter(Boolean))] as string[];
  const { data: gyms } = await admin.from("gyms").select("id, slug").in("id", gymIds);
  const slugOf = new Map((gyms || []).map((g) => [g.id, g.slug]));

  let sent = 0;
  for (const n of data) {
    const slug = slugOf.get(n.gym_id);
    sent += await pushToMembers([n.member_id], {
      title: n.title,
      body: n.body,
      image: n.image_url,
      url: slug ? `/g/${slug}/home` : "/",
      icon: slug ? `/g/${slug}/icon?size=192` : undefined,
    });
  }

  await admin.from("notifications").update({ pushed_at: new Date().toISOString() }).in("id", data.map((n) => n.id));
  return sent;
}