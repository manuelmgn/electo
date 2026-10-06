import { PARTIES, TOTAL_SEATS, axisValue } from "@/lib/parties";

// Fronteira exacta entre os asentos 175 e 176 (inicio da maioría
// absoluta), a mesma posición que a liña do hemiciclo.
const MAJORITY_BOUNDARY_PCT = (175 / TOTAL_SEATS) * 100; // = 50%

export default function SeatBar({
  seats,
  height = "h-4",
  majorityLabel = "176",
}: {
  seats: Record<string, number>;
  height?: string;
  majorityLabel?: string;
}) {
  // Orde esquerda → dereita polo eixo; os empates mantén a orde da lista.
  const withSeats = PARTIES.map((p, i) => ({ p, i }))
    .filter(({ p }) => (seats[p.id] ?? 0) > 0)
    .sort((a, b) => axisValue(a.p) - axisValue(b.p) || a.i - b.i)
    .map(({ p }) => p);

  return (
    <div className="relative" role="img" aria-label="Distribución de escaños">
      <div
        className={`flex w-full overflow-hidden rounded-full ${height}`}
        style={{ background: "var(--surface-2)" }}
      >
        {withSeats.length === 0 && (
          <div className="h-full w-full" style={{ background: "var(--surface-2)" }} />
        )}
        {withSeats.map((p) => (
          <div
            key={p.id}
            title={`${p.short}: ${seats[p.id]}`}
            className="h-full"
            style={{
              width: `${((seats[p.id] ?? 0) / TOTAL_SEATS) * 100}%`,
              background: p.color,
              transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        ))}
      </div>
      {/* Liña da maioría absoluta: fronteira asento 175/176. Sobresae da
          barra para que se vexa ben sobre calquera cor de partido. */}
      <div
        className="absolute"
        style={{
          left: `${MAJORITY_BOUNDARY_PCT}%`,
          top: -4,
          bottom: -4,
          width: 3,
          transform: "translateX(-50%)",
          background: "var(--text)",
          opacity: 0.7,
          borderRadius: 2,
        }}
        title={majorityLabel}
      />
    </div>
  );
}
