import dynamic from "next/dynamic";
import { alternates } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  return { alternates: alternates(params.locale, "") };
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

export default function Home() {
  return (
    <>
      {/* LCP: server-rendered so first paint has real HTML immediately */}
      <HeroSplash />

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
    </>
  );
}
