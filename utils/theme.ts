import { Archivo_Black, Fredoka, Inter } from "next/font/google";

const boldFont = Archivo_Black({ weight: "400", subsets: ["latin"] });
const roundFont = Fredoka({ weight: ["500", "700"], subsets: ["latin"] });
const cleanFont = Inter({ weight: ["500", "800"], subsets: ["latin"] });

export const FONTS: Record<string, { label: string; className: string }> = {
  bold: { label: "Bold poster", className: boldFont.className },
  rounded: { label: "Rounded", className: roundFont.className },
  clean: { label: "Clean modern", className: cleanFont.className },
};

export const BACKGROUNDS: Record<string, { label: string; bg: string; card: string }> = {
  midnight: { label: "Midnight", bg: "#0B0B0B", card: "#1B1B1B" },
  charcoal: { label: "Charcoal", bg: "#1C1C1E", card: "#2C2C2E" },
  navy: { label: "Deep navy", bg: "#0B1020", card: "#18213A" },
  forest: { label: "Forest", bg: "#0C1410", card: "#17251D" },
};

export type Branding = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
  theme_bg: string | null;
  font_style: string | null;
  card_style: string | null;
  tagline: string | null;
  welcome_text: string | null;
  is_active: boolean;
};

export function textOn(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#0B0B0B" : "#FFFFFF";
}

export function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function makePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}