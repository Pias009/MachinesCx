import type { Metadata } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import "./admin.css";

/* Own root layout — the admin console lives outside app/[locale]/ since
   it's an internal tool, not translated content, so it needs its own
   <html>/<body> shell (fonts, globals.css) rather than sharing the
   locale tree's. */

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Operations Console",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${bebas.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        <div data-admin style={{ minHeight: "100vh", background: "#070f0e" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
