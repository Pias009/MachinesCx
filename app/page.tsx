import dynamic from "next/dynamic";
import HeroSplash from "@/components/HeroSplash";
import AiAgentBanner from "@/components/AiAgentBanner";
import ScrollHome from "@/components/ScrollHome";

/* ── Heavy sections: all loaded lazily, no SSR where not needed ── */
const TrustSection      = dynamic(() => import("@/components/TrustSection"),      { ssr: false });
const ParticlePortfolio = dynamic(() => import("@/components/ParticlePortfolio"), { ssr: false });
const ClientJourney     = dynamic(() => import("@/components/ClientJourney"),     { ssr: false });
const FlexoStrip        = dynamic(() => import("@/components/FlexoStrip"),        { ssr: true  });
const PrintingShowcase  = dynamic(() => import("@/components/PrintingShowcase"),  { ssr: true  });
const MachineCatalogSection = dynamic(() => import("@/components/MachineCatalogSection"), { ssr: true });
const ConfiguratorCTA   = dynamic(() => import("@/components/ConfiguratorCTA"),   { ssr: false });
const NewsStrip         = dynamic(() => import("@/components/NewsStrip"),         { ssr: true  });
const SectionReveal     = dynamic(() => import("@/components/SectionReveal"),     { ssr: false });

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

      {/* Below the fold — all deferred */}
      <TrustSection />
      <ParticlePortfolio />
      <SectionReveal delay={80}><FlexoStrip /></SectionReveal>
      <PrintingShowcase />
      <MachineCatalogSection />
      <ConfiguratorCTA />
      <SectionReveal delay={80}><NewsStrip /></SectionReveal>

    </>
  );
}
