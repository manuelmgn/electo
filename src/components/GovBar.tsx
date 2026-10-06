import {
  PARTIES,
  TOTAL_SEATS,
  MAJORITY_SEATS,
  allyShade,
  governmentShade,
} from "@/lib/parties";

// Fronteira exacta entre os asentos 175 e 176 (inicio da maioría
// absoluta), a mesma posición que a liña do hemiciclo e da SeatBar.
const MAJORITY_BOUNDARY_PCT = ((MAJORITY_SEATS - 1) / TOTAL_SEATS) * 100; // = 50%

// Barra da suma de goberno: primeiro os partidos marcados como goberno
// (o de máis escaños á esquerda) e despois os aliados, tamén ordenados
// polos escaños. Cada un ocupa o seu ancho proporcional aos 350, así a
// liña vertical marca o que fai falla para a maioría (176). Os socios
// levan a tonalidade de verde do seu rango; os aliados, ámbar.
export default function GovBar({
  seats,
  governs,
  allies,
}: {
  seats: Record<string, number>;
  governs: Record<string, boolean>;
  allies: Record<string, boolean>;
}) {
  const bySeatsDesc = (a: (typeof PARTIES)[number], b: (typeof PARTIES)[number]) =>
    (seats[b.id] ?? 0) - (seats[a.id] ?? 0);
  const govParties = PARTIES.filter(
    (p) => governs[p.id] && (seats[p.id] ?? 0) > 0
  ).sort(bySeatsDesc);
  const allyParties = PARTIES.filter(
    (p) => !governs[p.id] && allies[p.id] && (seats[p.id] ?? 0) > 0
  ).sort(bySeatsDesc);
  const ordered = [...govParties, ...allyParties];

  return (
    <div className="relative" role="img" aria-label="Suma de goberno e aliados">
      <div
        className="flex h-5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--surface-2)" }}
      >
        {ordered.map((p) => (
          <div
            key={p.id}
            title={`${p.short}: ${seats[p.id]}`}
            className="h-full"
            style={{
              width: `${((seats[p.id] ?? 0) / TOTAL_SEATS) * 100}%`,
              background: governs[p.id]
                ? governmentShade(govParties.indexOf(p), govParties.length)
                : allyShade(),
              transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        ))}
      </div>
      {/* Liña da maioría absoluta: fronteira asento 175/176. Sobresae da
          barra para que se vexa ben sobre calquera cor. */}
      <div
        className="absolute"
        style={{
          left: `${MAJORITY_BOUNDARY_PCT}%`,
          top: -4,
          bottom: -4,
          width: 2,
          transform: "translateX(-50%)",
          background: "var(--text)",
          opacity: 0.45,
          borderRadius: 2,
        }}
      />
    </div>
  );
}
