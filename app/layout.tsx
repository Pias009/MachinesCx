import type { Metadata } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import PageMountTrigger from "@/components/PageMountTrigger";
import LoadingScreen from "@/components/LoadingScreen";
import SectionAnimator from "@/components/SectionAnimator";
import ChatWidget from "@/components/ChatWidget";
import { BRAND } from "@/lib/products";

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
  title: `${BRAND} — Blown Film, Bag Making & Recycling Machinery`,
  description: "Multi-layer blown-film lines, bag-making converters and recycling lines. From benchtop trials to 5-layer co-extrusion at 400 kg/h.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${inter.variable} ${jetbrains.variable}`}>
      <head>
        {/* Prevent browser caching of chunks */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // Unregister ALL service workers and clear ALL caches immediately
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(regs) {
                regs.forEach(function(r) { r.unregister(); });
              });
            }
            if ('caches' in window) {
              caches.keys().then(function(keys) {
                keys.forEach(function(k) { caches.delete(k); });
              });
            }

            // Auto-reload once if any _next chunk 404s
            var reloaded = sessionStorage.getItem('cr');
            window.addEventListener('error', function(e) {
              var t = e && e.target;
              if (!t) return;
              var src = t.src || t.href || '';
              if (src.indexOf('/_next/') !== -1 && !reloaded) {
                sessionStorage.setItem('cr', '1');
                window.location.reload(true);
              }
            }, true);

            window.addEventListener('load', function() {
              sessionStorage.removeItem('cr');
            });

            // ── referrer source tracking ──
            if (!sessionStorage.getItem('cx_source')) {
              var ref = document.referrer || '';
              var src = 'direct';
              if (ref.indexOf('google.') !== -1) src = 'google';
              else if (ref.indexOf('facebook.') !== -1 || ref.indexOf('fb.') !== -1) src = 'facebook';
              else if (ref.indexOf('instagram.') !== -1) src = 'instagram';
              else if (ref.indexOf('linkedin.') !== -1) src = 'linkedin';
              else if (ref.indexOf('twitter.') !== -1 || ref.indexOf('x.com') !== -1) src = 'twitter';
              else if (ref) src = 'other';
              sessionStorage.setItem('cx_source', src);
            }
          })();
        ` }} />
      </head>
      <body>
        <LoadingScreen />
        <SectionAnimator />
        <PageTransitionOverlay />
        <PageMountTrigger />
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
        <ChatWidget />
      </body>
    </html>
  );
}
