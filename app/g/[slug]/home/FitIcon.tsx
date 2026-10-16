"use client";

import { Icon } from "@iconify/react";

const CATEGORY_ICONS: Record<string, string> = {
  Legs: "mdi:weight-lifter",
  Chest: "material-symbols:fitness-center",
  Back: "material-symbols:rowing",
  Shoulders: "mdi:weight-lifter",
  Arms: "mdi:arm-flex",
  Core: "material-symbols:self-improvement",
  Cardio: "material-symbols:sprint",
  "Full body": "material-symbols:sports-gymnastics",
};

export const FIT = {
  home: "material-symbols:home-rounded",
  workouts: "material-symbols:fitness-center",
  progress: "material-symbols:monitoring",
  profile: "material-symbols:person-rounded",
  weight: "material-symbols:monitor-weight",
  goals: "material-symbols:sports-score",
  music: "material-symbols:headphones",
  run: "material-symbols:directions-run",
  rest: "material-symbols:bedtime",
};

type Props = { category?: string | null; icon?: string; size?: number; color?: string; className?: string };

export default function FitIcon({ category, icon, size = 20, color, className }: Props) {
  return (
    <Icon icon={icon || CATEGORY_ICONS[category || ""] || "material-symbols:fitness-center"}
      width={size} height={size} color={color} className={className} />
  );
}