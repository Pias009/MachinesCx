import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";

const bebas = { variable: "font-bebas" };
const inter = { variable: "font-inter" };
const jetbrains = { variable: "font-jetbrains" };

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
