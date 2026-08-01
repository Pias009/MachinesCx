"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import TransitionLink from "@/components/TransitionLink";
import AetherBtn from "@/components/AetherBtn";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";

gsap.registerPlugin(useGSAP);

const ROLE_KEYS = ["plantManagers", "procurement", "factoryOwners"] as const;

export default function AudienceSection() {
  const t = useTranslations("journeyExtras.audience");

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const roleRefs = useRef<(HTMLSpanElement | null)[]>([]);
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

    const roles = roleRefs.current.filter(Boolean);
    gsap.set(roles, { opacity: 0, y: 10 });

    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 32, scale: 0.98 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8, ease: "power3.out", delay: SECTION_ELEMENT_DELAY,
        scrollTrigger: {
          trigger: sectionRef.current, start: "top 82%", end: "bottom top",
          toggleActions: "play reverse play reverse",
        },
        onComplete: () => {
          gsap.to(roles, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.1 });
        },
      }
    );
  }, { scope: sectionRef, dependencies: [pluginReady] });

  return (
    <section
      ref={sectionRef}
      aria-label={t("sectionAria")}
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full blur-[80px]"
        style={{ background: "var(--brand-teal-glow)" }}
      />

      <div
        ref={cardRef}
        className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 rounded-[28px] p-8 sm:p-12 lg:flex-row lg:gap-16 lg:p-16"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-line)",
          boxShadow: "0 30px 70px -30px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex-1 text-center lg:text-left">
          <span
            className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--ff-mono)", color: "var(--brand-teal)" }}
          >
            <span aria-hidden className="h-px w-7" style={{ background: "var(--brand-teal)" }} />
            {t("eyebrow")}
          </span>
          <h2
            className="mb-4 text-4xl leading-[0.95] tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--ff-display)", color: "var(--ink)" }}
          >
            {t("title")}{" "}
            <em className="not-italic" style={{ color: "var(--brand-teal)" }}>
              {t("titleEm")}
            </em>
          </h2>
          <p className="mx-auto max-w-md text-base leading-relaxed lg:mx-0" style={{ color: "var(--ink-60)" }}>
            {t("body")}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {ROLE_KEYS.map((key, i) => (
              <span
                key={key}
                ref={(node) => { roleRefs.current[i] = node; }}
                className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide"
                style={{
                  fontFamily: "var(--ff-mono)",
                  color: "var(--ink)",
                  background: "var(--bg-raise)",
                  border: "1px solid var(--bg-line)",
                }}
              >
                {t(`roles.${key}`)}
              </span>
            ))}
          </div>

          <div className="mt-8 flex justify-center lg:justify-start">
            <AetherBtn>
              <TransitionLink href="/products">
                {t("cta")}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginInlineStart: "0.5rem", display: "inline" }}>
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </TransitionLink>
            </AetherBtn>
          </div>
        </div>

        <div
          className="relative aspect-[4/3] w-full max-w-md flex-1 overflow-hidden rounded-3xl"
          style={{ background: "var(--bg-raise)" }}
        >
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
