import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000", padding: 64, color: "#fff" }}>
        <div style={{ display: "flex" }}>
          <div style={{ background: "#D4F75C", color: "#000", fontSize: 40, fontWeight: 900, padding: "8px 20px", transform: "rotate(-2deg)" }}>Gainzo</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 110, fontWeight: 900, lineHeight: 0.9 }}>
          <span>YOUR GYM.</span>
          <span style={{ color: "#D4F75C" }}>YOUR APP.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#aaa" }}>
          <span>QR check-in · Smart plans · Dues · Streaks</span>
          <span style={{ color: "#D4F75C" }}>Free early access</span>
        </div>
      </div>
    ),
    size
  );
}