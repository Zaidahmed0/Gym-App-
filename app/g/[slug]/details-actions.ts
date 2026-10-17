"use server";

import { createClient } from "@/utils/supabase/server";
import { adminClient } from "@/utils/push";

const ALLOWED = [
  "phone", "date_of_birth", "gender", "blood_group", "emergency_name",
  "emergency_relation", "emergency_phone", "medical_notes", "address", "occupation",
] as const;

type Details = Partial<Record<(typeof ALLOWED)[number], string>>;

export async function updateMyDetails(input: Details) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "member") return { error: "Not allowed" };

  const update: Record<string, string | null> = {};
  for (const key of ALLOWED) {
    if (key in input) {
      const value = (input[key] || "").trim();
      update[key] = value ? value.slice(0, 500) : null;
    }
  }

  const emergency = (update.emergency_phone || "").replace(/\D/g, "");
  if (update.emergency_phone && emergency.length < 10) return { error: "Please enter a valid emergency phone number." };

  const { error } = await adminClient().from("profiles").update(update).eq("id", user.id);
  return error ? { error: error.message } : { success: true };
}