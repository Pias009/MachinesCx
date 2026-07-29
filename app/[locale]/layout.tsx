import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import SiteNav from "@/components/SiteNav";
import PageNav from "@/components/PageNav";
import SiteFooter from "@/components/SiteFooter";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import PageMountTrigger from "@/components/PageMountTrigger";
import LoadingScreen from "@/components/LoadingScreen";
import SectionAnimator from "@/components/SectionAnimator";
import AppToaster from "@/components/AppToaster";
import { BRAND } from "@/lib/products";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme="light"
      suppressHydrationWarning
      className={`${bebas.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Apply saved theme before first paint — avoids a flash of the
            wrong theme (and pages "stuck" on light) that a useEffect-only
            correction in ThemeToggle can't prevent on a fresh document load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var saved = localStorage.getItem('theme');
            if (saved === 'dark') {
              document.documentElement.removeAttribute('data-theme');
            } else {
              document.documentElement.setAttribute('data-theme', 'light');
            }
          })();
        ` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // Auto-reload once if a stale deploy's _next chunk 404s
            // (content-hashed filenames mean this only fires after a
            // real deploy, not on ordinary cached navigation)
            var reloaded = sessionStorage.getItem('cr');
            window.addEventListener('error', function(e) {
              var t = e && e.target;
              if (!t) return;
              var src = t.src || t.href || '';
              if (src.indexOf('/_next/') !== -1 && !reloaded) {
                sessionStorage.setItem('cr', '1');
                window.location.reload();
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
        <NextIntlClientProvider messages={messages}>
          <LoadingScreen />
          <SectionAnimator />
          <PageTransitionOverlay />
          <PageMountTrigger />
          <SiteNav />
          <PageNav />
          <main>{children}</main>
          <SiteFooter />
          <ChatWidget />
          <AppToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
