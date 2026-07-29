"use client";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";

export default function InquiriesPage() {
  const t = useTranslations("inquiriesHub");
  return (
    <>
      <style suppressHydrationWarning>{`
        .inq-page {
          min-height: 100vh; padding-top: 100px;
          background: var(--bg-base); position: relative;
        }
        .inq-page::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background:
            linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }
        .inq-wrap {
          position: relative; z-index: 1;
          max-width: 1100px; margin: 0 auto;
          padding: 0 clamp(1.5rem, 4vw, 3rem) clamp(4rem, 7vw, 7rem);
        }
        .inq-header { text-align: center; margin-bottom: clamp(2.75rem, 6vw, 4.5rem); }
        .inq-eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1rem;
        }
        .inq-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
        .inq-h1 {
          font-family: var(--ff-display);
          font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: .93; color: var(--ink);
          letter-spacing: -.01em; margin: 0 0 .9rem;
        }
        .inq-h1 em { font-style: normal; color: var(--brand-teal); }
        .inq-sub {
          font-size: clamp(.875rem, 1.1vw, 1rem);
          color: var(--ink-60); line-height: 1.7; max-width: 52ch;
          margin: 0 auto;
        }

        /* ── lead option — full-width, unmistakably the default pick ── */
        .inq-lead {
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
          margin-bottom: 1.25rem;
          transition: transform .2s cubic-bezier(0.16,1,0.3,1), box-shadow .2s;
          overflow: hidden;
        }
        .inq-lead::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 480px 260px at 15% 30%, rgba(43,191,179,.14), transparent 70%);
          pointer-events: none;
        }
        .inq-lead:hover { transform: translateY(-3px); box-shadow: 0 20px 60px -20px rgba(43,191,179,.35); }
        .inq-lead:active { transform: translateY(-1px); }
        .inq-lead__icon {
          position: relative; z-index: 1;
          width: clamp(72px, 9vw, 96px); height: clamp(72px, 9vw, 96px);
          border-radius: 1.25rem; flex-shrink: 0;
          background: rgba(43,191,179,.1);
          border: 1px solid rgba(43,191,179,.25);
          display: flex; align-items: center; justify-content: center;
          color: var(--brand-teal);
        }
        .inq-lead__body { position: relative; z-index: 1; min-width: 0; }
        .inq-lead__badge {
          display: inline-flex; align-items: center; gap: .4rem;
          font-family: var(--ff-mono); font-size: .62rem;
          letter-spacing: .16em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .6rem;
        }
        .inq-lead__badge::before { content: "●"; font-size: .5rem; }
        .inq-lead__title {
          font-family: var(--ff-display);
          font-size: clamp(1.6rem, 3.4vw, 2.4rem);
          color: var(--ink); line-height: 1.05; margin: 0 0 .5rem;
        }
        .inq-lead__desc {
          font-size: clamp(.85rem, 1vw, .95rem); color: var(--ink-60);
          line-height: 1.6; margin: 0; max-width: 56ch;
        }
        .inq-lead__cta {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
          background: var(--brand-teal); color: #04211e;
          transition: transform .2s cubic-bezier(0.16,1,0.3,1);
        }
        .inq-lead:hover .inq-lead__cta { transform: translateX(4px) scale(1.06); }
        @media (max-width: 700px) {
          .inq-lead { grid-template-columns: auto 1fr; }
          .inq-lead__cta { display: none; }
        }

        /* ── two quick picks — smaller, side by side ── */
        .inq-quick-label {
          font-family: var(--ff-mono); font-size: .62rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--ink-35); margin: 2rem 0 .9rem;
        }
        .inq-quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .inq-card {
          position: relative;
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          border-radius: 1.125rem;
          padding: clamp(1.5rem, 2.6vw, 2rem);
          text-decoration: none;
          display: flex; align-items: center; gap: 1.1rem;
          transition: border-color .2s, transform .2s, box-shadow .2s;
        }
        .inq-card:hover {
          border-color: var(--brand-teal);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px -14px rgba(43,191,179,.3);
        }
        .inq-card__icon {
          width: 52px; height: 52px; flex-shrink: 0;
          border-radius: .875rem;
          background: rgba(43,191,179,.08);
          border: 1px solid rgba(43,191,179,.15);
          display: flex; align-items: center; justify-content: center;
          color: var(--brand-teal);
        }
        .inq-card__body { min-width: 0; }
        .inq-card__title {
          font-family: var(--ff-display);
          font-size: clamp(1.05rem, 1.6vw, 1.25rem);
          color: var(--ink); line-height: 1.15;
          margin: 0 0 .3rem;
        }
        .inq-card__desc {
          font-size: .82rem; color: var(--ink-60);
          line-height: 1.5; margin: 0;
        }
        .inq-card__arrow {
          margin-left: auto; flex-shrink: 0;
          color: var(--ink-35); transition: transform .2s, color .2s;
        }
        .inq-card:hover .inq-card__arrow { transform: translateX(3px); color: var(--brand-teal); }
        @media (max-width: 680px) {
          .inq-quick-grid { grid-template-columns: 1fr; }
          /* clears the fixed chat bubble (bottom: 24-96px, see ChatWidget.tsx)
             so the last card is never hidden behind it on short screens */
          .inq-wrap { padding-bottom: clamp(6rem, 24vw, 8rem); }
        }
      `}</style>

      <div className="inq-page">
        <div className="inq-wrap">
          <div className="inq-header">
            <div className="inq-eyebrow">{t("eyebrow")}</div>
            <h1 className="inq-h1">
              {t("titlePrefix")} <em>{t("titleEm")}</em>
            </h1>
            <p className="inq-sub">
              {t("sub")}
            </p>
          </div>

          {/* lead option — full width, the obvious default pick */}
          <TransitionLink href="/inquiries/talk-to-engineer">
            <div className="inq-lead">
              <div className="inq-lead__icon">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4a8 8 0 018 8v2a8 8 0 01-16 0v-2a8 8 0 018-8z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 28h8M16 24v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M10 16h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2"/>
                </svg>
              </div>
              <div className="inq-lead__body">
                <div className="inq-lead__badge">{t("lead.badge")}</div>
                <h2 className="inq-lead__title">{t("lead.title")}</h2>
                <p className="inq-lead__desc">
                  {t("lead.desc")}
                </p>
              </div>
              <div className="inq-lead__cta">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12m0 0L9 3m6 6l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </TransitionLink>

          <div className="inq-quick-label">{t("quickLabel")}</div>

          <div className="inq-quick-grid">
            <TransitionLink href="/inquiries/direct">
              <div className="inq-card">
                <div className="inq-card__icon">
                  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 12h24M10 18h8M10 22h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="inq-card__body">
                  <h2 className="inq-card__title">{t("direct.title")}</h2>
                  <p className="inq-card__desc">{t("direct.desc")}</p>
                </div>
                <span className="inq-card__arrow">
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </TransitionLink>

            <TransitionLink href="/inquiries/parts">
              <div className="inq-card">
                <div className="inq-card__icon">
                  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                </div>
                <div className="inq-card__body">
                  <h2 className="inq-card__title">{t("parts.title")}</h2>
                  <p className="inq-card__desc">{t("parts.desc")}</p>
                </div>
                <span className="inq-card__arrow">
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </TransitionLink>
          </div>
        </div>
      </div>
    </>
  );
}
