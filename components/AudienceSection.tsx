"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";

gsap.registerPlugin(useGSAP);

export default function AudienceSection() {
  const t = useTranslations("journeyExtras.audience");

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [pluginReady, setPluginReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      setPluginReady(true);
    }).catch(() => {
      if (cardRef.current) { cardRef.current.style.opacity = "1"; cardRef.current.style.transform = "none"; }
    });
    return () => { cancelled = true; };
  }, []);

  useGSAP(() => {
    if (!pluginReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 32, scale: 0.98 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8, ease: "power3.out", delay: SECTION_ELEMENT_DELAY,
        scrollTrigger: {
          trigger: sectionRef.current, start: "top 82%", end: "bottom top",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, { scope: sectionRef, dependencies: [pluginReady] });

  return (
    <section
      ref={sectionRef}
      aria-label={t("sectionAria")}
      className="bg-[#eef0f4] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div
        ref={cardRef}
        className="mx-auto flex max-w-6xl flex-col items-center gap-10 rounded-[28px] bg-white p-8 shadow-[0_30px_70px_-30px_rgba(30,30,70,0.22)] sm:p-12 lg:flex-row lg:gap-16 lg:p-16"
      >
        <div className="flex-1 text-center lg:text-left">
          <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#6D6FE8]">
            <span aria-hidden className="h-px w-7 bg-[#6D6FE8]" />
            {t("eyebrow")}
          </span>
          <h2 className="mb-4 text-4xl leading-[0.95] tracking-tight text-[#14162B] sm:text-5xl" style={{ fontFamily: "var(--ff-display)" }}>
            {t("title")}{" "}
            <em className="bg-gradient-to-br from-[#6D6FE8] to-[#9C9EF2] bg-clip-text not-italic text-transparent">
              {t("titleEm")}
            </em>
          </h2>
          <p className="mx-auto max-w-md text-base leading-relaxed text-[#14162B]/62 lg:mx-0">
            {t("body")}
          </p>
        </div>

        <div className="relative aspect-[4/3] w-full max-w-md flex-1 overflow-hidden rounded-3xl bg-[#f5f6fa]">
          <Image
            src="/machines/abcde-2200.png"
            alt={t("imageAlt")}
            fill
            sizes="(max-width: 1024px) 90vw, 480px"
            className="object-contain p-6"
          />
        </div>
      </div>
    </section>
  );
}
