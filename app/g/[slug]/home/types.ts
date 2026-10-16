import { formatDate } from "@/utils/theme";

export type Theme = {
  accent: string;
  onAccent: string;
  bg: string;
  card: string;
  radius: string;
  pill: string;
  small: string;
};

export type ExerciseInfo = {
  name: string;
  category: string | null;
  youtube_url: string | null;
  instructions: string | null;
  image_url: string | null;
};

export type Item = {
  id: string;
  exercise_id: string;
  day_of_week: number;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  sort_order: number;
  exercises: ExerciseInfo | null;
};

export type Exercise = ExerciseInfo & { id: string };
export type Membership = { plan_name: string; start_date: string; end_date: string };
export type Progress = { id: string; log_date: string; weight_kg: number };
export type Me = { id: string; full_name: string; email: string; is_active: boolean };
export type Log = { exercise_id: string; log_date: string };
export type Settings = {
  goal: "lose" | "gain" | "maintain" | null;
  target_weight: number | null;
  height_cm: number | null;
  spotify_url: string | null;
  water_goal: number;
  announcements_seen_at: string | null;
};

export type FeedItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
  unread: boolean;
  pinned?: boolean;
};

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const CATEGORIES = ["Legs", "Chest", "Back", "Shoulders", "Arms", "Core", "Cardio", "Full body"];

const CATEGORY_FILES: Record<string, string> = {
  Legs: "legs",
  Chest: "chest",
  Back: "back",
  Shoulders: "shoulders",
  Arms: "arms",
  Core: "core",
  Cardio: "cardio",
  "Full body": "fullbody",
};

export function categoryImage(category: string | null, seed = "") {
  const file = CATEGORY_FILES[category || ""] || "fullbody";
  return seed ? `/images/${file}.jpg?v=${encodeURIComponent(seed)}` : `/images/${file}.jpg`;
}

export function exerciseImage(ex: { image_url?: string | null; category: string | null; name?: string } | null) {
  return ex?.image_url || categoryImage(ex?.category || null, ex?.name || "");
}

export function parse(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function shift(d: string, n: number) {
  const x = parse(d);
  x.setDate(x.getDate() + n);
  return formatDate(x);
}

export function diffDays(a: string, b: string) {
  return Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);
}

export function weekOf(todayStr: string) {
  const dow = parse(todayStr).getDay();
  const monday = shift(todayStr, -((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => shift(monday, i));
}

export function youtubeId(url: string | null) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function spotifyEmbed(url: string | null) {
  if (!url) return null;
  const match = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0` : null;
}

export function mmss(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function estimateMinutes(items: Item[]) {
  const seconds = items.reduce((t, i) => t + (i.sets || 3) * (40 + (i.rest_seconds || 60)), 0);
  return Math.max(5, Math.round(seconds / 60));
}