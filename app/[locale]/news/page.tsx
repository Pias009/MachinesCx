import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getLiveNews } from "@/lib/liveNews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — Wenzhou Ashal Innomach Technology",
  description: "Product launches, technical guides, and company updates from Ashal Innomach.",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function NewsIndexPage() {
  const t = await getTranslations("newsListPage");
  const { articles } = await getLiveNews();
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = sorted;

  if (!featured) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--ff-body)", color: "var(--ink-35)", paddingTop: "6rem",
      }}>
        {t("empty")}
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div style={{
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--bg-line)",
        paddingTop: "clamp(6rem,12vw,10rem)",
        paddingBottom: "clamp(3rem,6vw,5rem)",
        backgroundImage:
          "linear-gradient(var(--bg-line) 1px,transparent 1px),linear-gradient(90deg,var(--bg-line) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)" }}>
          <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>{t("eyebrow")}</span>
          <h1 style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(3rem,8vw,7rem)",
            lineHeight: 0.92, color: "var(--ink)",
          }}>
            {t("heading")}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)" }}>

        {/* ── Featured article ── */}
        <Link href={`/news/${featured.slug}`} className="news-featured">
          <div className="news-featured__img-wrap">
            <Image src={featured.image} alt={featured.title} className="news-featured__img" width={1200} height={800} priority />
          </div>
          <div className="news-featured__body">
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{
                fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "#fff", background: "var(--brand-red)",
                padding: "0.25rem 0.6rem",
              }}>{featured.category}</span>
              <span style={{
                fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                letterSpacing: "0.1em", color: "var(--ink-35)",
              }}>{fmt(featured.date)}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--ff-display)",
              fontSize: "clamp(1.8rem,3.5vw,3rem)",
              color: "var(--ink)", lineHeight: 0.95,
              letterSpacing: "0.01em", marginBottom: "1rem",
            }}>{featured.title}</h2>
            <p style={{
              fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 400,
              color: "var(--ink-35)", lineHeight: 1.72, maxWidth: "52ch",
              marginBottom: "1.5rem",
            }}>{featured.excerpt}</p>
            <span style={{
              fontFamily: "var(--ff-mono)", fontSize: "0.68rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--brand-red)",
            }}>{t("readArticle")}</span>
          </div>
        </Link>

        {/* ── Rest of articles ──
             data-no-anim: the site-wide SectionAnimator auto-fades every
             h1/h2/h3/p on scroll, but these cards render inside the
             initial viewport and its ScrollTrigger doesn't reliably
             reveal already-in-view elements on load — leaves titles and
             excerpts stuck at opacity:0. Opt this grid out rather than
             touch the shared animator every other page depends on. */}
        <div data-no-anim style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(clamp(240px,24vw,300px),1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}>
          {rest.map((a) => (
            <Link key={a.slug} href={`/news/${a.slug}`} className="ns-card">
              <div className="ns-card__img-wrap">
                <Image src={a.image} alt={a.title} className="ns-card__img" width={600} height={400} loading="lazy" />
              </div>
              <div className="ns-card__body">
                <div className="ns-card__meta">
                  <span className="ns-card__cat">{a.category}</span>
                  <span className="ns-card__date">{fmt(a.date)}</span>
                </div>
                <h3 className="ns-card__title">{a.title}</h3>
                <p className="ns-card__excerpt">{a.excerpt}</p>
                <span className="ns-card__cta">Read article →</span>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <style suppressHydrationWarning>{`
        .news-featured {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          text-decoration: none;
          transition: background 0.18s;
          overflow: hidden;
        }
        .news-featured:hover { background: var(--bg-raise); }
        .news-featured__img-wrap {
          background: var(--bg-base);
          display: flex; align-items: center; justify-content: center;
          min-height: 320px;
          border-right: 1px solid var(--bg-line);
          overflow: hidden;
          padding: clamp(1.5rem, 4vw, 3rem);
        }
        .news-featured__img {
          width: 100%; height: 100%; object-fit: contain;
          filter: drop-shadow(0 12px 32px rgba(15,23,42,0.14));
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .news-featured:hover .news-featured__img { transform: scale(1.05); }
        .news-featured__body {
          padding: clamp(2rem,4vw,3.5rem);
          display: flex; flex-direction: column; justify-content: center;
        }
        @media (max-width: 680px) {
          .news-featured { grid-template-columns: 1fr; }
          .news-featured__img-wrap { border-right: none; border-bottom: 1px solid var(--bg-line); min-height: 220px; }
          .news-featured__body { padding: 1.5rem; }
        }

        @media (max-width: 480px) {
          .ns-card__body { padding: 0.9rem 0.9rem 1.2rem; }
        }

        /* reuse ns-card styles from NewsStrip */
        .ns-card {
          display: flex; flex-direction: column;
          background: var(--bg-surface); text-decoration: none;
          border: 1px solid var(--bg-line);
          transition: background 0.18s, border-color 0.18s;
        }
        .ns-card:hover { background: var(--bg-raise); border-color: var(--brand-teal); }
        .ns-card__img-wrap {
          width: 100%; aspect-ratio: 16/9;
          background: var(--bg-base); overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 1px solid var(--bg-line);
          padding: 1.1rem;
        }
        .ns-card__img {
          width: 100%; height: 100%; object-fit: contain;
          filter: drop-shadow(0 6px 16px rgba(15,23,42,0.12));
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .ns-card:hover .ns-card__img { transform: scale(1.06) translateY(-2%); }
        .ns-card__body { padding: 1.1rem 1.1rem 1.4rem; display: flex; flex-direction: column; flex: 1; }
        .ns-card__meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
        .ns-card__cat { font-family: var(--ff-mono); font-size: 0.66rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brand-red); }
        .ns-card__date { font-family: var(--ff-mono); font-size: 0.66rem; letter-spacing: 0.1em; color: var(--ink-35); }
        .ns-card__title { font-family: var(--ff-display); font-size: clamp(1rem,1.8vw,1.2rem); color: var(--ink); line-height: 1.15; letter-spacing: 0.01em; margin-bottom: 0.6rem; }
        .ns-card__excerpt { font-family: var(--ff-body); font-size: 0.82rem; font-weight: 400; color: var(--ink-35); line-height: 1.6; flex: 1; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .ns-card__cta {
          display: inline-block;
          font-family: var(--ff-mono); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--brand-red);
          transition: color 0.18s, transform 0.18s var(--ease-out, ease);
        }
        .ns-card:hover .ns-card__cta { color: var(--brand-teal-dk); transform: translateX(4px); }
        @media (prefers-reduced-motion: reduce) {
          .ns-card:hover .ns-card__cta { transform: none; }
        }
      `}</style>
    </>
  );
}
