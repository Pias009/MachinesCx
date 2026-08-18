import dynamic from "next/dynamic";
import { alternates } from "@/lib/seo";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return { alternates: alternates(params.locale, "") };
}

import MachineSubNav from "@/components/MachineSubNav";
const HeroSplash         = dynamic(() => import("@/components/HeroSplash"),         { ssr: true  });
const AiAgentBanner      = dynamic(() => import("@/components/AiAgentBanner"),      { ssr: false });
const ScrollHome         = dynamic(() => import("@/components/ScrollHome"),         { ssr: false });
const LazyTrustSection   = dynamic(() => import("@/components/LazyTrustSection"),   { ssr: false });
const ParticlePortfolio  = dynamic(() => import("@/components/ParticlePortfolio"),  { ssr: false });
const ClientJourney      = dynamic(() => import("@/components/ClientJourney"),      { ssr: false });
const FlexoStrip         = dynamic(() => import("@/components/FlexoStrip"),         { ssr: true  });
const PrintingShowcase   = dynamic(() => import("@/components/PrintingShowcase"),   { ssr: true  });
const MachineCatalogSection = dynamic(() => import("@/components/MachineCatalogSection"), { ssr: true });
const ConfiguratorCTA    = dynamic(() => import("@/components/ConfiguratorCTA"),    { ssr: false });
const NewsStrip          = dynamic(() => import("@/components/NewsStrip"),          { ssr: true  });
const SectionReveal      = dynamic(() => import("@/components/SectionReveal"),      { ssr: false });
const AudienceSection    = dynamic(() => import("@/components/AudienceSection"),    { ssr: false });

export default function Home() {
  return (
    <>
      {/* Secondary machine category top navbar */}
      <MachineSubNav />

      {/* Splash hero */}
      <HeroSplash />

      {/* AI machine assistant marketing strip */}
      <AiAgentBanner />

      {/* Original hero */}
      <ScrollHome />
      <ClientJourney />

      {/* Light periwinkle card block — extends the ClientJourney light theme */}
      <SectionReveal delay={80}><AudienceSection /></SectionReveal>

      {/* Below the fold — all deferred. LazyTrustSection additionally waits
          until it's near the viewport before its own effect fires the
          import() for TrustSection — the one section pulling in three.js
          (a ~650KB chunk for its particle background). next/dynamic here
          only wraps the tiny LazyTrustSection shell, so *that* chunk being
          referenced eagerly is fine; TrustSection itself is never
          statically referenced from page.tsx's module graph at all, so
          Next.js has nothing to preload for it up front. */}
      <SectionReveal delay={80}><LazyTrustSection /></SectionReveal>
      <SectionReveal delay={80}><ParticlePortfolio /></SectionReveal>
      <SectionReveal delay={80}><FlexoStrip /></SectionReveal>
      {/* skip: this section's own internal reveal (below) is deliberately
          fast/self-contained — stacking the outer section-push (0.7s) on
          top of it made the whole thing feel slow to appear */}
      <SectionReveal skip><PrintingShowcase /></SectionReveal>
      <SectionReveal delay={80}><MachineCatalogSection /></SectionReveal>
      <SectionReveal delay={80}><ConfiguratorCTA /></SectionReveal>
      <SectionReveal delay={80}><NewsStrip /></SectionReveal>

    </>
  );
}
