import { PARTIES, TOTAL_SEATS } from "@/lib/parties";

export default function SeatBar({
  seats,
  height = "h-4",
}: {
  seats: Record<string, number>;
  height?: string;
}) {
  const withSeats = PARTIES.filter((p) => (seats[p.id] ?? 0) > 0).sort(
    (a, b) => (seats[b.id] ?? 0) - (seats[a.id] ?? 0)
  );

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
