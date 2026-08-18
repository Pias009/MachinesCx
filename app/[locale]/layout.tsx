import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import SiteNav from "@/components/SiteNav";
import PageNav from "@/components/PageNav";
import LoadingScreen from "@/components/LoadingScreen";
import { BRAND, SITE_URL } from "@/lib/products";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";

const SiteFooter = dynamic(() => import("@/components/SiteFooter"), { ssr: false });
const AppToaster = dynamic(() => import("@/components/AppToaster"), { ssr: false });
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });
const ProductionLineTeaser = dynamic(() => import("@/components/ProductionLineTeaser"), { ssr: false });
const VisitorTracker = dynamic(() => import("@/components/VisitorTracker"), { ssr: false });
const ProactiveNudge = dynamic(() => import("@/components/ProactiveNudge"), { ssr: false });
const ProductLeadCapture = dynamic(() => import("@/components/ProductLeadCapture"), { ssr: false });

const bebas = { variable: "font-bebas" };
const inter = { variable: "font-inter" };
const jetbrains = { variable: "font-jetbrains" };

const title = `${BRAND} — Blown Film, Bag Making & Recycling Machinery`;
const description = "Multi-layer blown-film lines, bag-making converters and recycling lines. From benchtop trials to 5-layer co-extrusion at 400 kg/h.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: BRAND,
    images: [{ url: "/logo.jpeg", width: 1042, height: 1042, alt: BRAND }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo.jpeg"],
  },
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
            // Auto-reload once if a stale deploy's _next JS/CSS chunk 404s
            // (content-hashed filenames mean this only fires after a
            // real deploy, not on ordinary cached navigation). Scoped to
            // SCRIPT/LINK tags only — /_next/image requests (plain <img>)
            // fail transiently on scroll/slow network and used to trigger
            // a full reload here, which felt like a random page reload
            // mid-scroll (e.g. on the homepage's lazy-loaded product grid).
            var reloaded = sessionStorage.getItem('cr');
            window.addEventListener('error', function(e) {
              var t = e && e.target;
              if (!t || !t.tagName) return;
              var tag = t.tagName.toUpperCase();
              if (tag !== 'SCRIPT' && tag !== 'LINK') return;
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: BRAND,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.jpeg`,
            }),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <LoadingScreen />
          <SiteNav />
          <PageNav />
          <main>{children}</main>
          <SiteFooter />
          <ChatWidget />
          <ProductionLineTeaser />
          <VisitorTracker />
          <ProactiveNudge />
          <ProductLeadCapture />
          <AppToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
