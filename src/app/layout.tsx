import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "SecretWish — Wunschlisten & Geheime Geschenk-Koordination",
  description:
    "Moderne, selbst hostbare Open-Source Wunschlisten für Familien und Freundeskreise. Wünsche reservieren, ohne dass der Beschenkte es erfährt.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <ToastProvider>
          <Navbar user={user} />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <MobileNav user={user} />
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
