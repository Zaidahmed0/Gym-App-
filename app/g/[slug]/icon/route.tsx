import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

const BGS: Record<string, string> = {
  midnight: "#0B0B0B",
  charcoal: "#1C1C1E",
  navy: "#0B1020",
  forest: "#0C1410",
};

function textOn(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#0B0B0B" : "#FFFFFF";
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const size = Math.min(1024, Math.max(64, Number(new URL(req.url).searchParams.get("size")) || 512));

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.rpc("get_gym_branding", { p_slug: slug });
  const gym = (data as { name: string; logo_url: string | null; accent_color: string; theme_bg: string | null }[] | null)?.[0];

  const accent = gym?.accent_color || "#D4F75C";
  const bg = BGS[gym?.theme_bg || "midnight"] || "#0B0B0B";
  const initials = (gym?.name || "GY").slice(0, 2).toUpperCase();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        {gym?.logo_url ? (
          <img src={gym.logo_url} width={size * 0.72} height={size * 0.72}
            style={{ borderRadius: size * 0.2, objectFit: "cover" }} />
        ) : (
          <div style={{
            width: size * 0.72, height: size * 0.72, borderRadius: size * 0.2, background: accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: textOn(accent), fontSize: size * 0.32, fontWeight: 900,
          }}>
            {initials}
          </div>
        )}
      </div>
    ),
    { width: size, height: size }
  );
}