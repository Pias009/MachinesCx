import dynamic from "next/dynamic";
import { routing } from "@/i18n/routing";
import { PAGE_SEO, staticPageMetadata } from "@/lib/pageSeo";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { SITE_URL, BRAND } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import AllModelsIndex from "@/components/AllModelsIndex";

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  return staticPageMetadata("/", params.locale || "en");
}

// ── Critical above-fold: SSR so first paint has real HTML ──
import HeroSplash from "@/components/HeroSplash";

// ── Below fold: all client-only, loaded after hydration ──
const AiAgentBanner       = dynamic(() => import("@/components/AiAgentBanner"),      { ssr: false });
const ScrollHome          = dynamic(() => import("@/components/ScrollHome"),         { ssr: false });
const ClientJourney       = dynamic(() => import("@/components/ClientJourney"),      { ssr: false });
const AudienceSection     = dynamic(() => import("@/components/AudienceSection"),    { ssr: false });
const LazyTrustSection    = dynamic(() => import("@/components/LazyTrustSection"),   { ssr: false });
const ParticlePortfolio   = dynamic(() => import("@/components/ParticlePortfolio"),  { ssr: false });
const FlexoStrip          = dynamic(() => import("@/components/FlexoStrip"),         { ssr: false });
const PrintingShowcase    = dynamic(() => import("@/components/PrintingShowcase"),   { ssr: false });
const MachineCatalogSection = dynamic(() => import("@/components/MachineCatalogSection"), { ssr: false });
const ConfiguratorCTA     = dynamic(() => import("@/components/ConfiguratorCTA"),    { ssr: false });
const NewsStrip           = dynamic(() => import("@/components/NewsStrip"),          { ssr: false });
const SectionReveal       = dynamic(() => import("@/components/SectionReveal"),      { ssr: false });

export default async function Home() {
  const { categories, families } = await getLiveCatalogue();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: BRAND,
          alternateName: ["Wenzhou Ashal Innomech", "Ashal Innomech Technology"],
          url: SITE_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      {/* LCP: server-rendered so first paint has real HTML immediately */}
      <HeroSplash h1={PAGE_SEO["/"].h1} />

      {/* All below-fold sections deferred — only hydrate after hero is painted */}
      <AiAgentBanner />
      <ScrollHome />
      <ClientJourney />

      <SectionReveal delay={120}><AudienceSection /></SectionReveal>
      <SectionReveal delay={120}><LazyTrustSection /></SectionReveal>
      <SectionReveal delay={120}><ParticlePortfolio /></SectionReveal>
      <SectionReveal delay={120}><FlexoStrip /></SectionReveal>
      {/* PrintingShowcase manages its own scroll-triggered entrance — skip outer push */}
      <SectionReveal skip><PrintingShowcase /></SectionReveal>
      <SectionReveal delay={120}><MachineCatalogSection /></SectionReveal>
      <SectionReveal delay={120}><ConfiguratorCTA /></SectionReveal>
      <SectionReveal delay={120}><NewsStrip /></SectionReveal>

      {/* server-rendered link to every product page — keeps all models one
          click from the homepage (the sections above are client-only) */}
      <AllModelsIndex categories={categories} families={families} />
    </>
  );
}
