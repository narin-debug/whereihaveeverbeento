import { ImageResponse } from "next/og";

export const alt = "Wanderlog — A Travel Log";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#a8b5a2",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-180px",
            top: "-180px",
            width: "620px",
            height: "620px",
            borderRadius: "50%",
            border: "2px solid rgba(28, 29, 26, 0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "60px",
            top: "120px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            border: "2px solid rgba(28, 29, 26, 0.25)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#1c1d1a",
            fontWeight: 700,
          }}
        >
          Wanderlog
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 144,
            fontWeight: 900,
            color: "#1c1d1a",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginTop: 20,
          }}
        >
          Voyager
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#1c1d1a",
            marginTop: 24,
            opacity: 0.8,
          }}
        >
          A Travel Log
        </div>
      </div>
    ),
    { ...size },
  );
}
