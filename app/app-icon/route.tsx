import { ImageResponse } from "next/og";

export async function GET(req: Request) {
  const size = Math.min(1024, Math.max(64, Number(new URL(req.url).searchParams.get("size")) || 512));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0B0B" }}>
        <div style={{
          width: size * 0.72, height: size * 0.72, borderRadius: size * 0.2, background: "#D4F75C",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#0B0B0B", fontSize: size * 0.3, fontWeight: 900,
        }}>
          GP
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}