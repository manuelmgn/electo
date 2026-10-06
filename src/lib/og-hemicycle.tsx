// ============================================================
// IMAXE OPENGRAPH DO HEMICICLO
// ------------------------------------------------------------
// Compoñente React (SVG) que se renderiza con ImageResponse de
// next/og para as imaxes de compartición de /r, /f e /s. Reutiliza
// buildSeats() do hemiciclo co mesmo reparto angular que a web.
// ============================================================

import { buildSeats } from "./hemicycle";

const W = 1200;
const H = 630;
// Escala das coordenadas do hemiciclo (cx 200, cy 210, r 188) ao
// tamaño da imaxe, centrado horizontalmente e coa base cara abaixo.
const SCALE = 2.3;
const OFFSET_X = W / 2 - 200 * SCALE;
const OFFSET_Y = 470 - 210 * SCALE;

export function OgHemicycleImage({
  title,
  summary,
  seatMap,
}: {
  title: string;
  summary: string;
  seatMap: Record<string, number>;
}) {
  const seats = buildSeats(seatMap);
  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        background: "#0b0e15",
        color: "#f4f6fb",
        padding: "48px 56px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#aab3c5" }}>
        {summary}
      </div>
      <svg
        width={W - 112}
        height={H - 220}
        viewBox={`0 0 ${W} ${H}`}
        style={{ marginTop: 8 }}
      >
        {seats.map((s, i) => (
          <circle
            key={i}
            cx={OFFSET_X + s.x * SCALE}
            cy={OFFSET_Y + s.y * SCALE}
            r={5.6 * SCALE}
            fill={s.color}
          />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          fontSize: 24,
          color: "#aab3c5",
        }}
      >
        Electo 26
      </div>
    </div>
  );
}
