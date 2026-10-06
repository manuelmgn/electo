import { PARTIES, TOTAL_SEATS, axisValue } from "@/lib/parties";

export default function SeatBar({
  seats,
  height = "h-4",
}: {
  seats: Record<string, number>;
  height?: string;
}) {
  // Orde esquerda → dereita polo eixo; os empates mantén a orde da lista.
  const withSeats = PARTIES.map((p, i) => ({ p, i }))
    .filter(({ p }) => (seats[p.id] ?? 0) > 0)
    .sort((a, b) => axisValue(a.p) - axisValue(b.p) || a.i - b.i)
    .map(({ p }) => p);

  return (
    <div
      className={`flex w-full overflow-hidden rounded-full ${height}`}
      style={{ background: "var(--surface-2)" }}
      role="img"
      aria-label="Distribución de escaños"
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
  );
}
