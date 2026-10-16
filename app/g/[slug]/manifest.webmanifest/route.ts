import { createClient } from "@supabase/supabase-js";

const BGS: Record<string, string> = {
  midnight: "#0B0B0B",
  charcoal: "#1C1C1E",
  navy: "#0B1020",
  forest: "#0C1410",
};

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.rpc("get_gym_branding", { p_slug: slug });
  const gym = (data as { name: string; theme_bg: string | null }[] | null)?.[0];

  const name = gym?.name || "Gym App";
  const bg = BGS[gym?.theme_bg || "midnight"] || "#0B0B0B";

  const manifest = {
    name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    start_url: `/g/${slug}/home`,
    scope: `/g/${slug}`,
    display: "standalone",
    orientation: "portrait",
    background_color: bg,
    theme_color: bg,
    icons: [
      { src: `/g/${slug}/icon?size=192`, sizes: "192x192", type: "image/png" },
      { src: `/g/${slug}/icon?size=512`, sizes: "512x512", type: "image/png" },
      { src: `/g/${slug}/icon?size=512`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}