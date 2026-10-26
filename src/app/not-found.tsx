import Link from "next/link";
import type { Metadata } from "next";

// 404 propia (en galego) no lugar da de Next por defecto, que vai en
// inglés. Compoñente estático: non precisa cliente nin dicionario.
export const metadata: Metadata = {
  title: "Páxina non atopada · Electo 26",
};

export default function NotFound() {
  return (
    <div className="card mx-4 my-8 px-6 py-10 text-center">
      <div className="text-5xl font-black mb-2" aria-hidden>
        404
      </div>
      <h1 className="text-xl font-bold mb-1">Esta páxina non ten escaños</h1>
      <p className="text-sm opacity-70 mb-5">
        O enderezo que buscas non existe ou a ligazón caducou.
      </p>
      <Link href="/" className="btn btn-primary inline-block">
        Voltar ao editor
      </Link>
    </div>
  );
}
