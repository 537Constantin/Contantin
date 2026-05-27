import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} – Zeitlose Schönheit. Natürlich definiert.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(120% 120% at 50% 0%, #f6efe4 0%, #fbf8f3 55%, #f1e7d6 100%)",
          padding: 80,
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#b28c56",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#1c1714",
          }}
        >
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 600 }}>
            Zeitlose Schönheit.
          </div>
          <div style={{ fontSize: 76, lineHeight: 1.05, color: "#b28c56" }}>
            Natürlich definiert.
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#8a7f73" }}>
          Premium Skincare · Vegan · Cruelty-free
        </div>
      </div>
    ),
    { ...size },
  );
}
