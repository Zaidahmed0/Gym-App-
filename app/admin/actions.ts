"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export async function createOwner(gymId: string, email: string, fullName: string, password: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "super_admin") return { error: "Not allowed" };

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    if (error.message.toLowerCase().includes("already")) return { error: "This email is already registered." };
    return { error: error.message };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    gym_id: gymId,
    role: "owner",
    full_name: fullName,
    email: cleanEmail,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: profileError.message };
  }

  return { success: true };
}