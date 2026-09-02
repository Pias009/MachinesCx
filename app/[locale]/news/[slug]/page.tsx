import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import AetherBtn from "@/components/AetherBtn";
import { articleBySlug, renderNewsBody } from "@/lib/news";
import { getLiveNews } from "@/lib/liveNews";
import { pageMetadata, localePath } from "@/lib/seo";
import { SITE_URL, BRAND } from "@/lib/products";
import JsonLd from "@/components/JsonLd";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const t = await getTranslations("newsArticlePage");
  const { articles } = await getLiveNews();
  const a = articleBySlug({ articles }, params.slug);
  if (!a) return { title: t("metadataFallbackTitle") };

  return pageMetadata({
    locale: params.locale,
    path: `/news/${params.slug}`,
    title: `${a.title} — Ashal Innomech`,
    description: a.excerpt,
    image: a.image,
  });
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function ArticlePage({ params }: { params: { locale: string; slug: string } }) {
  const t = await getTranslations("newsArticlePage");
  const { articles } = await getLiveNews();
  const a = articleBySlug({ articles }, params.slug);
  if (!a) notFound();

  const related = articles
    .filter((r) => r.slug !== a.slug && r.tags.some((t) => a.tags.includes(t)))
    .slice(0, 3);

  const url = `${SITE_URL}${localePath(params.locale, `/news/${params.slug}`)}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: a.title,
          description: a.excerpt,
          image: a.image ? `${SITE_URL}${a.image}` : undefined,
          datePublished: a.date,
          dateModified: a.date,
          author: { "@type": "Organization", name: BRAND, url: SITE_URL },
          publisher: { "@type": "Organization", name: BRAND, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpeg` } },
          mainEntityOfPage: url,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}${localePath(params.locale, "/news")}` },
            { "@type": "ListItem", position: 3, name: a.title, item: url },
          ],
        }}
      />
      <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--bg-line)",
        paddingTop: "clamp(5rem,10vw,8rem)",
        backgroundImage:
          "linear-gradient(var(--bg-line) 1px,transparent 1px),linear-gradient(90deg,var(--bg-line) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)" }}>

          {/* breadcrumb */}
          <p style={{
            fontFamily: "var(--ff-mono)", fontSize: "0.65rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--ink-60)", marginBottom: "2rem",
            display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap",
          }}>
            <Link href="/" style={{ color: "var(--ink-60)" }}>{t("breadcrumbHome")}</Link>
            <span style={{ color: "var(--ink-35)" }}>›</span>
            <Link href="/news" style={{ color: "var(--ink-60)" }}>{t("breadcrumbNews")}</Link>
            <span style={{ color: "var(--ink-35)" }}>›</span>
            <span style={{ color: "var(--ink)" }}>{a.category}</span>
          </p>

          <div className="article-hero-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "clamp(2rem,5vw,5rem)",
            alignItems: "start",
            paddingBottom: "clamp(3rem,6vw,5rem)",
          }}>
            {/* left — meta + title */}
            <div style={{ maxWidth: "64ch" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "#fff", background: "var(--brand-red)",
                  padding: "0.28rem 0.7rem",
                }}>{a.category}</span>
                <span style={{
                  fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                  letterSpacing: "0.1em", color: "var(--ink-35)",
                }}>{fmt(a.date)}</span>
              </div>
              <h1 style={{
                fontFamily: "var(--ff-display)",
                fontSize: "clamp(2.2rem,5vw,4rem)",
                lineHeight: 0.93, color: "var(--ink)",
                letterSpacing: "0.01em", marginBottom: "1.25rem",
              }}>{a.title}</h1>
              <p style={{
                fontFamily: "var(--ff-body)", fontSize: "1.08rem", fontWeight: 400,
                color: "var(--ink-60)", lineHeight: 1.75,
              }}>{a.excerpt}</p>

              {/* tags */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
                {a.tags.map((t) => (
                  <span key={t} style={{
                    fontFamily: "var(--ff-mono)", fontSize: "0.68rem",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "0.3rem 0.65rem",
                    border: "1px solid var(--bg-line)",
                    color: "var(--ink-60)",
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* right — hero image */}
            <div className="article-hero-img" style={{
              width: "clamp(200px,28vw,380px)",
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              aspectRatio: "4/3", position: "relative", overflow: "hidden",
              flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "3px",
                background: "linear-gradient(to right, var(--brand-red), transparent)",
              }} />
              <div style={{ position: "absolute", inset: "10%" }}>
                <Image
                  src={a.image}
                  alt={a.title}
                  fill
                  sizes="(max-width: 768px) 60vw, 380px"
                  priority
                  style={{
                    objectFit: "contain",
                    filter: "drop-shadow(0 16px 40px rgba(15,23,42,0.14))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Article body + sidebar ── */}
      <div className="article-content-grid" style={{
        background: "var(--bg-base)",
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)",
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "clamp(3rem,6vw,5rem)",
        alignItems: "start",
      }}>

        {/* body — no entrance animation; this is a server component so
             it can't use the client-side useScrollReveal hook without a
             bigger restructure, and the content is injected via
             dangerouslySetInnerHTML anyway. */}
        <div className="article-body"
          dangerouslySetInnerHTML={{ __html: renderNewsBody(a.body) }}
        />

        {/* sidebar */}
        <aside>
          {/* links */}
          {a.links && a.links.length > 0 && (
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-line)",
              borderTop: "3px solid var(--brand-red)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}>
              <span style={{
                fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "var(--ink-35)", display: "block", marginBottom: "1rem",
              }}>{t("relatedLinks")}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {a.links.map((l) => (
                  <Link
                    key={l.url}
                    href={l.url}
                    className="article-sidebar-link"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* back to news */}
          <Link href="/news" style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            fontFamily: "var(--ff-mono)", fontSize: "0.65rem",
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--ink-60)", textDecoration: "none",
            marginBottom: "1.5rem",
          }}>
            {t("allNews")}
          </Link>

          {/* tags */}
          <div style={{
            background: "var(--bg-base)",
            border: "1px solid var(--bg-line)",
            padding: "1.25rem",
          }}>
            <span style={{
              fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--ink-35)", display: "block", marginBottom: "0.75rem",
            }}>{t("tags")}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {a.tags.map((t) => (
                <span key={t} style={{
                  fontFamily: "var(--ff-mono)", fontSize: "0.66rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "0.28rem 0.6rem",
                  border: "1px solid var(--bg-line)",
                  color: "var(--ink-60)",
                }}>{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <div style={{
          borderTop: "1px solid var(--bg-line)",
          background: "var(--bg-surface)",
          padding: "clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <span className="eyebrow" style={{ marginBottom: "0.75rem", color: "var(--brand-red)" }}>{t("relatedArticles")}</span>
            {/* no entrance animation — see note on the news index page */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "1.5rem", marginTop: "1.5rem",
            }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/news/${r.slug}`} className="ns-card">
                  <div className="ns-card__img-wrap">
                    <Image src={r.image} alt={r.title} className="ns-card__img" width={600} height={400} loading="lazy" />
                  </div>
                  <div className="ns-card__body">
                    <div className="ns-card__meta">
                      <span className="ns-card__cat">{r.category}</span>
                      <span className="ns-card__date">{fmt(r.date)}</span>
                    </div>
                    <h3 className="ns-card__title">{r.title}</h3>
                    <p className="ns-card__excerpt">{r.excerpt}</p>
                    <span className="ns-card__cta">{t("readArticle")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      </div>

      {/* ── CTA ── */}
      <section style={{
        background: "#0f172a",
        padding: "clamp(3rem,5vw,4rem) clamp(1.25rem,4vw,3rem)",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: "2rem", flexWrap: "wrap",
      }}>
        <h2 style={{
          fontFamily: "var(--ff-display)",
          fontSize: "clamp(1.8rem,4vw,3rem)",
          color: "#fff", lineHeight: 0.95, maxWidth: 1280,
          margin: "0 auto", width: "100%",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "1.5rem",
        }}>
          <span>{t("ctaHeading")}</span>
          <AetherBtn><Link href="/contact">{t("ctaButton")}</Link></AetherBtn>
        </h2>
      </section>

      <style suppressHydrationWarning>{`
        .article-body { line-height: 1.8; color: var(--ink-60); font-family: var(--ff-body); font-size: 1rem; font-weight: 400; }
        .article-body p { margin-bottom: 1.25rem; }
        .article-body h3 { font-family: var(--ff-display); font-size: 1.5rem; color: var(--ink); letter-spacing: 0.01em; line-height: 1; margin: 2.25rem 0 0.75rem; }
        .article-body ul { padding-left: 1.25rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.45rem; }
        .article-body li { position: relative; color: var(--ink-60); }
        .article-body strong { color: var(--ink); font-weight: 600; }

        .article-sidebar-link {
          font-family: var(--ff-mono); font-size: 0.65rem;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--brand-red); text-decoration: none;
          display: block; padding: 0.5rem 0;
          border-bottom: 1px solid var(--bg-line);
          transition: color 0.15s;
        }
        .article-sidebar-link:last-child { border-bottom: none; }
        .article-sidebar-link:hover { color: var(--ink); }

        .ns-card { display: flex; flex-direction: column; background: var(--bg-surface); text-decoration: none; border: 1px solid var(--bg-line); transition: background 0.18s, border-color 0.18s; }
        .ns-card:hover { background: var(--bg-raise); border-color: var(--brand-teal); }
        .ns-card__img-wrap { width: 100%; aspect-ratio: 16/9; background: var(--bg-base); overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--bg-line); padding: 1.1rem; }
        .ns-card__img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 6px 16px rgba(15,23,42,0.12)); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
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

        @media (max-width: 768px) {
          .article-hero-grid { grid-template-columns: 1fr !important; }
          .article-hero-img { width: 100% !important; max-width: 260px; }
          .article-content-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
