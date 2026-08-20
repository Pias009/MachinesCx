"use client";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/useScrollReveal";

type SectionKey = "privacy" | "terms";

function useSectionList(t: (key: string) => string, prefix: SectionKey, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    heading: t(`${prefix}.sections.${i}.heading`),
    body: t(`${prefix}.sections.${i}.body`),
  }));
}

export default function LegalClient() {
  const t = useTranslations("legalPage");
  const [active, setActive] = useState<SectionKey>("privacy");
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  const privacySections = useSectionList(t, "privacy", 7);
  const termsSections = useSectionList(t, "terms", 7);

  return (
    <>
      <style suppressHydrationWarning>{`
        .lg-page {
          min-height: 100vh; padding-top: 100px;
          background: var(--bg-base); position: relative;
        }
        .lg-page::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background:
            linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }
        .lg-wrap {
          position: relative; z-index: 1;
          max-width: 860px; margin: 0 auto;
          padding: 0 clamp(1.5rem, 4vw, 3rem) clamp(4rem, 7vw, 7rem);
        }
        .lg-header { text-align: center; margin-bottom: clamp(2rem, 4vw, 3rem); }
        .lg-eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1rem;
        }
        .lg-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
        .lg-h1 {
          font-family: var(--ff-display);
          font-size: clamp(2.4rem, 5vw, 4rem);
          line-height: .95; color: var(--ink);
          letter-spacing: -.01em; margin: 0 0 .9rem;
        }
        .lg-h1 em { font-style: normal; color: var(--brand-teal); }
        .lg-sub {
          font-size: clamp(.875rem, 1.1vw, 1rem);
          color: var(--ink-60); line-height: 1.7; max-width: 56ch;
          margin: 0 auto;
        }

        /* ── tabs ── */
        .lg-tabs {
          position: sticky; top: 84px; z-index: 5;
          display: flex; gap: .5rem;
          background: var(--bg-base);
          padding: 1rem 0 1.25rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--bg-line);
        }
        .lg-tab {
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .08em; text-transform: uppercase;
          padding: .65rem 1.1rem; border-radius: .7rem;
          border: 1px solid var(--bg-line);
          background: var(--bg-surface);
          color: var(--ink-60);
          cursor: pointer; text-decoration: none;
          transition: border-color .2s, color .2s, background .2s;
        }
        .lg-tab:hover { color: var(--ink); border-color: var(--brand-teal); }
        .lg-tab[data-active="true"] {
          color: #04211e; background: var(--brand-teal); border-color: var(--brand-teal);
        }

        /* ── content ── */
        .lg-section { scroll-margin-top: 150px; margin-bottom: clamp(2.5rem, 5vw, 3.5rem); }
        .lg-section__title {
          font-family: var(--ff-display);
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          color: var(--ink); margin: 0 0 .5rem;
        }
        .lg-section__updated {
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--ink-35); margin: 0 0 1.75rem;
        }
        .lg-block { margin-bottom: 1.5rem; }
        .lg-block__heading {
          font-family: var(--ff-display);
          font-size: 1.05rem; color: var(--ink);
          margin: 0 0 .5rem;
        }
        .lg-block__body {
          font-size: .9rem; color: var(--ink-60);
          line-height: 1.75; margin: 0; white-space: pre-line;
        }
        .lg-divider {
          border: none; border-top: 1px solid var(--bg-line);
          margin: clamp(2.5rem, 5vw, 3.5rem) 0;
        }
      `}</style>

      <div className="lg-page" ref={rootRef}>
        <div className="lg-wrap">
          <div className="lg-header" data-reveal="blur">
            <div className="lg-eyebrow">{t("eyebrow")}</div>
            <h1 className="lg-h1">
              {t("titlePrefix")} <em>{t("titleEm")}</em>
            </h1>
            <p className="lg-sub">{t("sub")}</p>
          </div>

          <nav className="lg-tabs" aria-label={t("tabsAria")}>
            <Link
              href="/legal#privacy"
              className="lg-tab"
              data-active={active === "privacy"}
              onClick={() => setActive("privacy")}
            >
              {t("privacy.tabLabel")}
            </Link>
            <Link
              href="/legal#terms"
              className="lg-tab"
              data-active={active === "terms"}
              onClick={() => setActive("terms")}
            >
              {t("terms.tabLabel")}
            </Link>
          </nav>

          <section id="privacy" className="lg-section" data-reveal>
            <h2 className="lg-section__title">{t("privacy.title")}</h2>
            <p className="lg-section__updated">{t("privacy.updated")}</p>
            {privacySections.map((s, i) => (
              <div key={i} className="lg-block">
                <h3 className="lg-block__heading">{s.heading}</h3>
                <p className="lg-block__body">{s.body}</p>
              </div>
            ))}
          </section>

          <hr className="lg-divider" />

          <section id="terms" className="lg-section" data-reveal>
            <h2 className="lg-section__title">{t("terms.title")}</h2>
            <p className="lg-section__updated">{t("terms.updated")}</p>
            {termsSections.map((s, i) => (
              <div key={i} className="lg-block">
                <h3 className="lg-block__heading">{s.heading}</h3>
                <p className="lg-block__body">{s.body}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
