"use server";

import { createClient } from "@/utils/supabase/server";
import { adminClient } from "@/utils/push";

async function isSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return me?.role === "super_admin";
}

export type AdminUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  gym_id: string | null;
  gym_name: string | null;
  gym_slug: string | null;
  is_active: boolean | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export async function listAllUsers(): Promise<{ users: AdminUser[]; error?: string }> {
  if (!(await isSuperAdmin())) return { users: [], error: "Not allowed" };
  const admin = adminClient();

  const [{ data: profiles }, { data: gyms }, authRes] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, phone, role, gym_id, is_active, created_at").order("created_at", { ascending: false }),
    admin.from("gyms").select("id, name, slug"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const lastSeen = new Map((authRes.data?.users || []).map((u) => [u.id, u.last_sign_in_at ?? null]));
  const gymOf = new Map((gyms || []).map((g) => [g.id, g]));

  return {
    users: (profiles || []).map((p) => ({
      ...p,
      gym_name: p.gym_id ? gymOf.get(p.gym_id)?.name ?? null : null,
      gym_slug: p.gym_id ? gymOf.get(p.gym_id)?.slug ?? null : null,
      last_sign_in_at: lastSeen.get(p.id) ?? null,
    })),
  };
}

export async function adminResetPassword(userId: string, password: string) {
  if (!(await isSuperAdmin())) return { error: "Not allowed" };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const { error } = await adminClient().auth.admin.updateUserById(userId, { password });
  return error ? { error: error.message } : { success: true };
}