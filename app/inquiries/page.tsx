"use client";
import TransitionLink from "@/components/TransitionLink";

const CARDS = [
  {
    type: "talk-to-engineer",
    href: "/inquiries/talk-to-engineer",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4a8 8 0 018 8v2a8 8 0 01-16 0v-2a8 8 0 018-8z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 28h8M16 24v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M10 16h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2"/>
      </svg>
    ),
    title: "Talk to Our Engineer",
    desc: "Select machines, customize specs, add parts — we build a detailed sheet and our engineers review it personally.",
    badge: "Recommended",
  },
  {
    type: "direct",
    href: "/inquiries/direct",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 12h24M10 18h8M10 22h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Send Direct Inquiry",
    desc: "Already know what you need? Send a quick inquiry about any machine with optional customization notes.",
    badge: "Quick",
  },
  {
    type: "parts",
    href: "/inquiries/parts",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    title: "Inquire About Parts",
    desc: "Need spare parts, replacements, or custom components? Tell us what you need and we'll get back to you.",
    badge: "Parts",
  },
];

export default function InquiriesPage() {
  return (
    <>
      <style suppressHydrationWarning>{`
        .inq-page {
          min-height: 100vh; padding-top: 100px;
          background: var(--bg); position: relative;
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
        .inq-header { text-align: center; margin-bottom: clamp(2.5rem, 5vw, 4rem); }
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
          line-height: .93; color: var(--text);
          letter-spacing: -.01em; margin: 0 0 .9rem;
        }
        .inq-h1 em { font-style: normal; color: var(--brand-teal); }
        .inq-sub {
          font-size: clamp(.875rem, 1.1vw, 1rem);
          color: var(--text-muted); line-height: 1.7; max-width: 52ch;
          margin: 0 auto;
        }
        .inq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .inq-card {
          position: relative;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: clamp(1.75rem, 3vw, 2.5rem);
          text-decoration: none;
          display: flex; flex-direction: column; gap: 1.25rem;
          transition: border-color .2s, transform .2s, box-shadow .2s;
          cursor: pointer;
        }
        .inq-card:hover {
          border-color: var(--brand-teal);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(43,191,179,.12);
        }
        .inq-card__badge {
          position: absolute; top: 1.25rem; right: 1.25rem;
          font-family: var(--ff-mono); font-size: .6rem;
          letter-spacing: .12em; text-transform: uppercase;
          padding: .3rem .7rem; border-radius: 999px;
          background: rgba(43,191,179,.12);
          color: var(--brand-teal);
          border: 1px solid rgba(43,191,179,.25);
        }
        .inq-card__icon {
          width: 56px; height: 56px;
          border-radius: .875rem;
          background: rgba(43,191,179,.08);
          border: 1px solid rgba(43,191,179,.15);
          display: flex; align-items: center; justify-content: center;
          color: var(--brand-teal);
        }
        .inq-card__title {
          font-family: var(--ff-display);
          font-size: clamp(1.3rem, 2vw, 1.6rem);
          color: var(--text); line-height: 1.1;
          margin: 0;
        }
        .inq-card__desc {
          font-size: .9rem; color: var(--text-muted);
          line-height: 1.65; margin: 0; flex: 1;
        }
        .inq-card__cta {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-teal); margin-top: .5rem;
        }
        .inq-card__cta svg { transition: transform .2s; }
        .inq-card:hover .inq-card__cta svg { transform: translateX(4px); }
        @media (max-width: 680px) {
          .inq-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="inq-page">
        <div className="inq-wrap">
          <div className="inq-header">
            <div className="inq-eyebrow">Inquiries</div>
            <h1 className="inq-h1">
              How can we <em>help?</em>
            </h1>
            <p className="inq-sub">
              Choose the inquiry type that best fits your needs. Every inquiry is reviewed by our engineering team and answered within 24 hours.
            </p>
          </div>

          <div className="inq-grid">
            {CARDS.map(c => (
              <TransitionLink key={c.type} href={c.href}>
                <div className="inq-card">
                  <span className="inq-card__badge">{c.badge}</span>
                  <div className="inq-card__icon">{c.icon}</div>
                  <h2 className="inq-card__title">{c.title}</h2>
                  <p className="inq-card__desc">{c.desc}</p>
                  <span className="inq-card__cta">
                    Get started
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
