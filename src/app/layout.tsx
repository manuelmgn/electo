import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Electo 26 · Predicións eleccións xerais 2026",
  description:
    "Crea e comparte as túas predicicións de escaños para as eleccións xerais de España 2026.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
  const user = await getSessionUser();

  return (
    <html lang="gl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-xl">
          <Header user={user ? { name: user.name } : null} />
          <main className="pb-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
