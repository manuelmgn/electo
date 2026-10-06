"use client";

import { useState } from "react";
import { textOn, type Party } from "@/lib/parties";

// Amosa o logo do partido (/public/logos/<logo>). Se o ficheiro non
// existe ou falla ao cargar, volve ao chip de cor coas siglas.
export default function PartyLogo({
  party,
  className = "h-8 w-8 text-[9px]",
}: {
  party: Party;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg font-extrabold ${className}`}
        style={{ background: party.color, color: textOn(party.color) }}
      >
        {party.short}
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${className}`}
      style={{ background: "#EBEBEB" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logos/${party.logo}`}
        alt={party.short}
        className="h-full w-full object-contain"
        onError={() => setError(true)}
      />
    </span>
  );
}
