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

type Goal = "lose" | "gain" | "maintain";
type Level = "beginner" | "intermediate" | "advanced";

const DAY_TEMPLATES: Record<string, string[]> = {
  FULL_A: ["Barbell Squat", "Bench Press", "Lat Pulldown", "Shoulder Press", "Bicep Curls", "Plank"],
  FULL_B: ["Romanian Deadlift", "Incline Dumbbell Press", "Seated Cable Row", "Walking Lunges", "Tricep Pushdown", "Bicycle Crunch"],
  FULL_C: ["Leg Press", "Push Ups", "One-Arm Dumbbell Row", "Lateral Raises", "Hammer Curl", "Hanging Leg Raise"],
  UPPER_A: ["Bench Press", "Barbell Row", "Shoulder Press", "Lat Pulldown", "Bicep Curls", "Tricep Pushdown"],
  UPPER_B: ["Incline Dumbbell Press", "Pull Ups", "Seated Cable Row", "Lateral Raises", "Hammer Curl", "Overhead Tricep Extension"],
  LOWER_A: ["Barbell Squat", "Romanian Deadlift", "Leg Extension", "Leg Curl", "Calf Raises", "Plank"],
  LOWER_B: ["Deadlift", "Leg Press", "Bulgarian Split Squat", "Hip Thrust", "Calf Raises", "Russian Twist"],
  PUSH: ["Bench Press", "Incline Dumbbell Press", "Shoulder Press", "Lateral Raises", "Tricep Pushdown", "Overhead Tricep Extension"],
  PULL: ["Deadlift", "Pull Ups", "Barbell Row", "Seated Cable Row", "Face Pulls", "Bicep Curls", "Hammer Curl"],
  LEGS: ["Barbell Squat", "Leg Press", "Romanian Deadlift", "Leg Curl", "Calf Raises", "Hanging Leg Raise"],
};

const SCHEDULES: Record<number, [number, string][]> = {
  3: [[1, "FULL_A"], [3, "FULL_B"], [5, "FULL_C"]],
  4: [[1, "UPPER_A"], [2, "LOWER_A"], [4, "UPPER_B"], [5, "LOWER_B"]],
  5: [[1, "PUSH"], [2, "PULL"], [3, "LEGS"], [5, "UPPER_A"], [6, "LOWER_A"]],
  6: [[1, "PUSH"], [2, "PULL"], [3, "LEGS"], [4, "UPPER_B"], [5, "LOWER_B"], [6, "FULL_C"]],
};

const CARDIO = ["Treadmill Run", "Cycling", "Jump Rope", "Rowing Machine", "Mountain Climbers", "Burpees"];

const GOAL_LABEL: Record<Goal, string> = { lose: "Fat loss", gain: "Muscle gain", maintain: "Stay fit" };

export async function generateSmartPlan(input: {
  goal: Goal;
  level: Level;
  days: number;
  targetWeight?: number | null;
  heightCm?: number | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: me } = await supabase.from("profiles").select("gym_id, role").eq("id", user.id).single();
  if (me?.role !== "member" || !me.gym_id) return { error: "Not a member" };

  const admin = adminClient();

  const { data: library } = await admin
    .from("exercises")
    .select("id, name, gym_id")
    .or(`gym_id.is.null,gym_id.eq.${me.gym_id}`);

  const byName = new Map<string, string>();
  for (const ex of library || []) {
    const key = ex.name.toLowerCase();
    if (!byName.has(key) || ex.gym_id) byName.set(key, ex.id);
  }

  await admin.from("member_plans").delete().eq("member_id", user.id);
  await admin.from("workout_plans").delete().eq("member_id", user.id);

  const { data: plan, error: planError } = await admin
    .from("workout_plans")
    .insert({
      gym_id: me.gym_id,
      member_id: user.id,
      title: `Smart plan · ${GOAL_LABEL[input.goal]}`,
      category: GOAL_LABEL[input.goal],
    })
    .select("id")
    .single();
  if (planError || !plan) return { error: planError?.message || "Could not create plan" };

  const schedule = SCHEDULES[input.days] || SCHEDULES[3];
  const rows: {
    plan_id: string;
    exercise_id: string;
    day_of_week: number;
    sets: number;
    reps: string;
    rest_seconds: number;
    sort_order: number;
  }[] = [];

  schedule.forEach(([dow, key], dayIndex) => {
    let names = DAY_TEMPLATES[key];
    if (input.level === "beginner") names = names.slice(0, 5);
    let order = 0;

    names.forEach((name, i) => {
      const id = byName.get(name.toLowerCase());
      if (!id) return;
      const compound = i < 2;
      const sets =
        input.level === "beginner" ? 3 : input.level === "advanced" ? (compound ? 5 : 4) : compound ? 4 : 3;
      const reps =
        input.goal === "lose" ? "12-15" : input.goal === "gain" ? (compound && input.level !== "beginner" ? "6-8" : "8-12") : "10-12";
      const rest = input.goal === "lose" ? 45 : input.goal === "gain" ? (compound ? 120 : 90) : 60;
      rows.push({ plan_id: plan.id, exercise_id: id, day_of_week: dow, sets, reps, rest_seconds: rest, sort_order: order++ });
    });

    const addCardio = input.goal === "lose" || (input.goal === "maintain" && dayIndex % 2 === 0);
    if (addCardio) {
      const cardioId = byName.get(CARDIO[dayIndex % CARDIO.length].toLowerCase());
      if (cardioId) {
        rows.push({
          plan_id: plan.id,
          exercise_id: cardioId,
          day_of_week: dow,
          sets: 1,
          reps: input.goal === "lose" ? "15 min" : "10 min",
          rest_seconds: 30,
          sort_order: order++,
        });
      }
    }
  });

  if (rows.length) {
    const { error } = await admin.from("plan_exercises").insert(rows);
    if (error) return { error: error.message };
  }

  await admin.from("member_plans").insert({ member_id: user.id, plan_id: plan.id });

  await admin.from("member_settings").upsert({
    member_id: user.id,
    goal: input.goal,
    level: input.level,
    days_per_week: input.days,
    target_weight: input.targetWeight ?? null,
    height_cm: input.heightCm ?? null,
    updated_at: new Date().toISOString(),
  });

  return { success: true, count: rows.length };
}