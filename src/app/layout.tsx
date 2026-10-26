import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import PWARegister from "@/components/PWARegister";

// URL canónica para as imaxes sociais (/s/, /r/, /f/). Pódese
// sobrescribir con NEXT_PUBLIC_SITE_URL na despregadura.
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://electo.vercel.app"
  ),
  title: "Electo 26 · Predicións eleccións xerais 2026",
  description:
    "Crea e comparte as túas predicicións de escaños para as eleccións xerais de España 2026.",
  openGraph: {
    images: ["/electo-social.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e15" },
  ],
};

// Aplica o tema gardado antes da primeira pintada para evitar parpadeo.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Sen cookies aquí: o Header carga a sesión no cliente (useSessionUser)
  // e así as vistas de só lectura /r e /f pódense prerenderizar.
  return (
    <html lang="gl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen antialiased">
        <Header />
        <PWARegister />
        <div className="mx-auto max-w-xl">
          <main className="pb-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
