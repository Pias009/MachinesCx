"use client";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";

const PHONE_DISPLAY = "+86 159 8877 5831";
const PHONE_TEL = "+8615988775831";
const WHATSAPP_NUMBER = "8615988775831";
const EMAIL = "ashal@ashalinnomech.com";

const METHOD_ICONS = {
  call: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.03.24-3.43-.72-2.9-1.16-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.02-2.4.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.07.66.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.47-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.14.47.12.65-.07.18-.19.75-.88.95-1.18.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  ),
  address: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

export default function ContactPage() {
  const t = useTranslations("contact");

  const CONTACT_METHODS = [
    { key: "call", label: t("methods.call"), value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}`, icon: METHOD_ICONS.call },
    { key: "whatsapp", label: t("methods.whatsapp"), value: PHONE_DISPLAY, href: `https://wa.me/${WHATSAPP_NUMBER}`, external: true, icon: METHOD_ICONS.whatsapp },
    { key: "email", label: t("methods.email"), value: EMAIL, href: `mailto:${EMAIL}`, icon: METHOD_ICONS.email },
    { key: "address", label: t("methods.address"), value: t("methods.addressValue"), icon: METHOD_ICONS.address },
  ];

  return (
    <>
      <style suppressHydrationWarning>{`
        .ct-page {
          min-height: 100vh; padding-top: 100px;
          background: var(--bg-base); position: relative;
        }
        .ct-page::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background:
            linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }
        .ct-wrap {
          position: relative; z-index: 1;
          max-width: 1000px; margin: 0 auto;
          padding: 0 clamp(1.5rem, 4vw, 3rem) clamp(4rem, 7vw, 7rem);
        }
        .ct-header { text-align: center; margin-bottom: clamp(2.75rem, 6vw, 4.5rem); }
        .ct-eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1rem;
        }
        .ct-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
        .ct-h1 {
          font-family: var(--ff-display);
          font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: .93; color: var(--ink);
          letter-spacing: -.01em; margin: 0 0 .9rem;
        }
        .ct-h1 em { font-style: normal; color: var(--brand-teal); }
        .ct-sub {
          font-size: clamp(.875rem, 1.1vw, 1rem);
          color: var(--ink-60); line-height: 1.7; max-width: 52ch;
          margin: 0 auto;
        }

        /* ── contact info grid ── */
        .ct-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .ct-card {
          position: relative;
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          border-radius: 1.125rem;
          padding: clamp(1.4rem, 2.4vw, 1.85rem);
          text-decoration: none;
          display: flex; align-items: center; gap: 1.1rem;
          transition: border-color .2s, transform .2s, box-shadow .2s;
        }
        a.ct-card:hover {
          border-color: var(--brand-teal);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px -14px rgba(43,191,179,.3);
        }
        .ct-card__icon {
          width: 52px; height: 52px; flex-shrink: 0;
          border-radius: .875rem;
          background: rgba(43,191,179,.08);
          border: 1px solid rgba(43,191,179,.15);
          display: flex; align-items: center; justify-content: center;
          color: var(--brand-teal);
        }
        .ct-card__body { min-width: 0; }
        .ct-card__label {
          font-family: var(--ff-mono); font-size: .62rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: var(--ink-35); margin: 0 0 .3rem;
        }
        .ct-card__value {
          font-family: var(--ff-display);
          font-size: clamp(1rem, 1.4vw, 1.15rem);
          color: var(--ink); line-height: 1.2;
          margin: 0; overflow-wrap: anywhere;
        }
        @media (max-width: 620px) {
          .ct-grid { grid-template-columns: 1fr; }
        }

        /* ── send inquiry CTA — full width ── */
        .ct-cta {
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: clamp(1.25rem, 3vw, 2.5rem);
          background: var(--bg-surface);
          border: 1px solid var(--brand-teal);
          border-radius: 1.5rem;
          padding: clamp(1.75rem, 4vw, 3rem);
          text-decoration: none;
          margin-top: 2rem;
          transition: transform .2s cubic-bezier(0.16,1,0.3,1), box-shadow .2s;
          overflow: hidden;
        }
        .ct-cta::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 480px 260px at 15% 30%, rgba(43,191,179,.14), transparent 70%);
          pointer-events: none;
        }
        .ct-cta:hover { transform: translateY(-3px); box-shadow: 0 20px 60px -20px rgba(43,191,179,.35); }
        .ct-cta:active { transform: translateY(-1px); }
        .ct-cta__icon {
          position: relative; z-index: 1;
          width: clamp(72px, 9vw, 96px); height: clamp(72px, 9vw, 96px);
          border-radius: 1.25rem; flex-shrink: 0;
          background: rgba(43,191,179,.1);
          border: 1px solid rgba(43,191,179,.25);
          display: flex; align-items: center; justify-content: center;
          color: var(--brand-teal);
        }
        .ct-cta__body { position: relative; z-index: 1; min-width: 0; }
        .ct-cta__title {
          font-family: var(--ff-display);
          font-size: clamp(1.6rem, 3.4vw, 2.4rem);
          color: var(--ink); line-height: 1.05; margin: 0 0 .5rem;
        }
        .ct-cta__desc {
          font-size: clamp(.85rem, 1vw, .95rem); color: var(--ink-60);
          line-height: 1.6; margin: 0; max-width: 56ch;
        }
        .ct-cta__arrow {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
          background: var(--brand-teal); color: #04211e;
          transition: transform .2s cubic-bezier(0.16,1,0.3,1);
        }
        .ct-cta:hover .ct-cta__arrow { transform: translateX(4px) scale(1.06); }
        @media (max-width: 700px) {
          .ct-cta { grid-template-columns: auto 1fr; }
          .ct-cta__arrow { display: none; }
        }
      `}</style>

      <div className="ct-page">
        <div className="ct-wrap">
          <div className="ct-header">
            <div className="ct-eyebrow">{t("eyebrow")}</div>
            <h1 className="ct-h1">
              {t("titlePrefix")} <em>{t("titleEm")}</em>
            </h1>
            <p className="ct-sub">
              {t("sub")}
            </p>
          </div>

          <div className="ct-grid">
            {CONTACT_METHODS.map((m) =>
              m.href ? (
                <a
                  key={m.key}
                  href={m.href}
                  target={m.external ? "_blank" : undefined}
                  rel={m.external ? "noopener noreferrer" : undefined}
                  className="ct-card"
                >
                  <span className="ct-card__icon">{m.icon}</span>
                  <span className="ct-card__body">
                    <span className="ct-card__label">{m.label}</span>
                    <p className="ct-card__value">{m.value}</p>
                  </span>
                </a>
              ) : (
                <div key={m.key} className="ct-card">
                  <span className="ct-card__icon">{m.icon}</span>
                  <span className="ct-card__body">
                    <span className="ct-card__label">{m.label}</span>
                    <p className="ct-card__value">{m.value}</p>
                  </span>
                </div>
              )
            )}
          </div>

          <TransitionLink href="/inquiries">
            <div className="ct-cta">
              <div className="ct-cta__icon">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <path d="M6 8h20v14a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M6 8l10 8 10-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ct-cta__body">
                <h2 className="ct-cta__title">{t("cta.title")}</h2>
                <p className="ct-cta__desc">
                  {t("cta.desc")}
                </p>
              </div>
              <div className="ct-cta__arrow">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12m0 0L9 3m6 6l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </TransitionLink>
        </div>
      </div>
    </>
  );
}
