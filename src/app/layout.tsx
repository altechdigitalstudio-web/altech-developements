import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const SITE = "https://qr.altech.hub";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Altech Hub QR Studio — Dynamic QR Codes with Analytics",
    template: "%s · Altech Hub QR Studio",
  },
  description:
    "Generate custom static and dynamic QR codes with live scanner location analytics, editable destinations, bulk generation, brand frames and vector SVG exports.",
  keywords: [
    "QR code generator",
    "dynamic QR code",
    "QR code analytics",
    "vCard QR",
    "WiFi QR code",
    "bulk QR codes",
    "Altech Hub",
  ],
  openGraph: {
    title: "Altech Hub QR Studio",
    description:
      "Professional QR code generator: dynamic codes, scan location analytics, brand frames, vector exports and bulk creation.",
    type: "website",
    url: SITE,
    siteName: "Altech Hub",
  },
  twitter: { card: "summary_large_image", title: "Altech Hub QR Studio" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#06070a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230f172a'/%3E%3Cg fill='%232563eb'%3E%3Crect x='6' y='6' width='8' height='8' rx='2'/%3E%3Crect x='18' y='6' width='8' height='8' rx='2'/%3E%3Crect x='6' y='18' width='8' height='8' rx='2'/%3E%3Crect x='19' y='19' width='3' height='3'/%3E%3Crect x='24' y='24' width='3' height='3'/%3E%3Crect x='19' y='24' width='3' height='3'/%3E%3C/g%3E%3C/svg%3E"
        />
        {/* Anti-flash inline script to match device/saved theme immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('altech_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=s==='dark'||(!s&&d)||(s==='system'&&d);var t=isDark?'dark':'light';document.documentElement.setAttribute('data-theme',t);if(isDark){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-page text-main antialiased selection:bg-blue-600 selection:text-white font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
