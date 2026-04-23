import { ImageResponse } from "next/og";

export const alt = "ENEX Fahrzeugpflege – Mobile Fahrzeugpflege";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 45%, #0f172a 100%)",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: "-0.04em",
          }}
        >
          ENEX
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 34,
            fontWeight: 600,
            color: "#94a3b8",
          }}
        >
          Mobile Fahrzeugpflege
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#64748b",
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          Professionell · Vor Ort · Online buchen
        </div>
      </div>
    ),
    { ...size }
  );
}
