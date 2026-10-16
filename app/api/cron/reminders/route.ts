import { adminClient, pushPendingNotifications } from "@/utils/push";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: created, error } = await adminClient().rpc("send_expiry_reminders");
  const sent = await pushPendingNotifications();

  return Response.json({ created: created ?? 0, sent, error: error?.message ?? null });
}