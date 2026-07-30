import dynamic from "next/dynamic";

const HeroSplash         = dynamic(() => import("@/components/HeroSplash"),         { ssr: true  });
const AiAgentBanner      = dynamic(() => import("@/components/AiAgentBanner"),      { ssr: false });
const ScrollHome         = dynamic(() => import("@/components/ScrollHome"),         { ssr: false });
const TrustSection       = dynamic(() => import("@/components/TrustSection"),       { ssr: false });
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
      {/* Splash hero */}
      <HeroSplash />

      {/* AI machine assistant marketing strip */}
      <AiAgentBanner />

      {/* Original hero */}
      <ScrollHome />
      <ClientJourney />

      {/* Light periwinkle card block — extends the ClientJourney light theme */}
      <SectionReveal delay={80}><AudienceSection /></SectionReveal>

      {/* Below the fold — all deferred */}
      <SectionReveal delay={80}><TrustSection /></SectionReveal>
      <SectionReveal delay={80}><ParticlePortfolio /></SectionReveal>
      <SectionReveal delay={80}><FlexoStrip /></SectionReveal>
      <SectionReveal delay={80}><PrintingShowcase /></SectionReveal>
      <SectionReveal delay={80}><MachineCatalogSection /></SectionReveal>
      <SectionReveal delay={80}><ConfiguratorCTA /></SectionReveal>
      <SectionReveal delay={80}><NewsStrip /></SectionReveal>

    </>
  );
}
