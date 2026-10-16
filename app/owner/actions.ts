"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

type NewMember = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  planName: string;
  startDate: string;
  endDate: string;
  amount: number;
};

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

async function getOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: me } = await supabase.from("profiles").select("role, gym_id").eq("id", user.id).single();
  if (me?.role !== "owner" || !me.gym_id) return null;
  return me;
}

export async function addMember(m: NewMember) {
  const me = await getOwner();
  if (!me) return { error: "Not allowed" };
  if (m.password.length < 8) return { error: "Password must be at least 8 characters." };

  const admin = adminClient();
  const email = m.email.trim().toLowerCase();

  const { data: created, error: userError } = await admin.auth.admin.createUser({
    email,
    password: m.password,
    email_confirm: true,
    user_metadata: { full_name: m.fullName },
  });
  if (userError) {
    if (userError.message.toLowerCase().includes("already")) return { error: "This email is already registered." };
    return { error: userError.message };
  }

  const memberId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: memberId,
    gym_id: me.gym_id,
    role: "member",
    full_name: m.fullName,
    email,
    phone: m.phone,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(memberId);
    return { error: profileError.message };
  }

  const { error: planError } = await admin.from("memberships").insert({
    member_id: memberId,
    gym_id: me.gym_id,
    plan_name: m.planName,
    start_date: m.startDate,
    end_date: m.endDate,
    amount: m.amount,
    status: "active",
  });
  if (planError) return { error: planError.message };

  return { success: true };
}

export async function resetMemberPassword(memberId: string, password: string) {
  const me = await getOwner();
  if (!me) return { error: "Not allowed" };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const admin = adminClient();
  const { data: member } = await admin.from("profiles").select("gym_id, role").eq("id", memberId).single();
  if (!member || member.gym_id !== me.gym_id || member.role !== "member") return { error: "Not allowed" };

  const { error } = await admin.auth.admin.updateUserById(memberId, { password });
  if (error) return { error: error.message };
  return { success: true };
}