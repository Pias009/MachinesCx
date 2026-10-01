import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import SiteNav from "@/components/SiteNav";
import { CatalogueProvider } from "@/components/CatalogueProvider";
import LoadingScreen from "@/components/LoadingScreen";
import { BRAND, LEGAL_NAME, SITE_URL } from "@/lib/products";
import { ORG_ID, CONTACT_EMAIL, CONTACT_PHONE, socialProfileEntries } from "@/lib/siteConfig";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getNavCatalogue } from "@/lib/liveCatalogue";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";

const SiteFooter = nextDynamic(() => import("@/components/SiteFooter"), { ssr: false });
const AppToaster = nextDynamic(() => import("@/components/AppToaster"), { ssr: false });
const ChatWidget = nextDynamic(() => import("@/components/ChatWidget"), { ssr: false });
const ProductionLineTeaser = nextDynamic(() => import("@/components/ProductionLineTeaser"), { ssr: false });
const VisitorTracker = nextDynamic(() => import("@/components/VisitorTracker"), { ssr: false });
const ProactiveNudge = nextDynamic(() => import("@/components/ProactiveNudge"), { ssr: false });
const ProductLeadCapture = nextDynamic(() => import("@/components/ProductLeadCapture"), { ssr: false });

// Self-hosted (app/fonts, latin subsets from Google Fonts) via
// next/font/local: no render-blocking request to fonts.googleapis.com,
// no build-time network fetch, size-adjusted fallbacks to limit CLS.
// globals.css reads these --nf-* variables.
const bebas = localFont({ src: "../fonts/bebas-neue-latin.woff2", weight: "400", display: "swap", variable: "--nf-bebas", fallback: ["Arial Narrow", "sans-serif"] });
const inter = localFont({ src: "../fonts/inter-latin-var.woff2", weight: "300 800", display: "swap", variable: "--nf-inter", fallback: ["system-ui", "sans-serif"] });
const jakarta = localFont({ src: "../fonts/plus-jakarta-sans-latin-var.woff2", weight: "400 800", display: "swap", variable: "--nf-jakarta", fallback: ["sans-serif"] });
const jetbrains = localFont({ src: "../fonts/jetbrains-mono-latin-var.woff2", weight: "400 600", display: "swap", variable: "--nf-jetbrains", fallback: ["Courier New", "monospace"], preload: false });

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
    images: [DEFAULT_OG_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export const revalidate = 3600;

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

  const [allMessages, navCatalogue] = await Promise.all([getMessages(), getNavCatalogue()]);
  // "about" (~7 KB, incl. its capability table) is only used by /about,
  // which adds it back with its own provider — keep it out of every
  // other page's HTML payload
  const { about: _about, ...messages } = allMessages;
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme="light"
      suppressHydrationWarning
      className={`${bebas.variable} ${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Apply saved theme before first paint — avoids a flash of the
            wrong theme (and pages "stuck" on light) that a useEffect-only
            correction in ThemeToggle can't prevent on a fresh document load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try { if (sessionStorage.getItem('cx_splash') === '1') document.documentElement.setAttribute('data-splash-seen', ''); } catch (e) {}
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
              "@id": ORG_ID,
              name: BRAND,
              legalName: LEGAL_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.jpeg`,
              foundingDate: "2016",
              // TODO_OWNER: confirm ashal@ashalinnomech.com receives mail; otherwise switch to a working address.
              email: CONTACT_EMAIL,
              telephone: CONTACT_PHONE,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Wenzhou",
                addressRegion: "Zhejiang",
                addressCountry: "CN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: CONTACT_PHONE,
                contactType: "sales",
                email: CONTACT_EMAIL,
                availableLanguage: ["English", "Arabic", "Hindi", "Chinese"],
              },
              ...(socialProfileEntries().length > 0 && { sameAs: socialProfileEntries().map(([, url]) => url) }),
            }),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CatalogueProvider catalogue={navCatalogue}>
          <LoadingScreen />
          <SiteNav catalogue={navCatalogue} />
          <main>{children}</main>
          <SiteFooter />
          <ChatWidget />
          <ProductionLineTeaser />
          <VisitorTracker />
          <ProactiveNudge />
          <ProductLeadCapture />
          <AppToaster />
          </CatalogueProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
