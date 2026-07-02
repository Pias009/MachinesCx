import { notFound } from "next/navigation";
import Link from "next/link";
import AetherBtn from "@/components/AetherBtn";
import { articles, articleBySlug } from "@/lib/news";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const a = articleBySlug(params.slug);
  return {
    title: a ? `${a.title} — Ashal Innomach` : "Article",
    description: a?.excerpt,
  };
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = articleBySlug(params.slug);
  if (!a) notFound();

  const related = articles
    .filter((r) => r.slug !== a.slug && r.tags.some((t) => a.tags.includes(t)))
    .slice(0, 3);

  return (
    <>
      {/* ── Page base reset to light ── */}
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        paddingTop: "clamp(5rem,10vw,8rem)",
        backgroundImage:
          "linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)" }}>

          {/* breadcrumb */}
          <p style={{
            fontFamily: "var(--ff-mono)", fontSize: "0.65rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#475569", marginBottom: "2rem",
            display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap",
          }}>
            <Link href="/" style={{ color: "#475569" }}>Home</Link>
            <span style={{ color: "#b8c5d6" }}>›</span>
            <Link href="/news" style={{ color: "#475569" }}>News</Link>
            <span style={{ color: "#b8c5d6" }}>›</span>
            <span style={{ color: "#0f172a" }}>{a.category}</span>
          </p>

          <div style={{
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
                  letterSpacing: "0.1em", color: "#b8c5d6",
                }}>{fmt(a.date)}</span>
              </div>
              <h1 style={{
                fontFamily: "var(--ff-display)",
                fontSize: "clamp(2.2rem,5vw,4rem)",
                lineHeight: 0.93, color: "#0f172a",
                letterSpacing: "0.01em", marginBottom: "1.25rem",
              }}>{a.title}</h1>
              <p style={{
                fontFamily: "var(--ff-body)", fontSize: "1.08rem", fontWeight: 400,
                color: "#475569", lineHeight: 1.75,
              }}>{a.excerpt}</p>

              {/* tags */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
                {a.tags.map((t) => (
                  <span key={t} style={{
                    fontFamily: "var(--ff-mono)", fontSize: "0.68rem",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "0.3rem 0.65rem",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* right — hero image */}
            <div style={{
              width: "clamp(200px,28vw,380px)",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              aspectRatio: "4/3", position: "relative", overflow: "hidden",
              flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "3px",
                background: "linear-gradient(to right, var(--brand-red), transparent)",
              }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.image}
                alt={a.title}
                style={{
                  width: "80%", height: "80%", objectFit: "contain",
                  filter: "drop-shadow(0 16px 40px rgba(15,23,42,0.14))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Article body + sidebar ── */}
      <div style={{
        background: "#f8fafc",
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)",
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "clamp(3rem,6vw,5rem)",
        alignItems: "start",
      }}>

        {/* body */}
        <div className="article-body"
          dangerouslySetInnerHTML={{ __html: a.body }}
        />

        {/* sidebar */}
        <aside>
          {/* links */}
          {a.links && a.links.length > 0 && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderTop: "3px solid var(--brand-red)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}>
              <span style={{
                fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "#b8c5d6", display: "block", marginBottom: "1rem",
              }}>Related links</span>
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
            color: "#475569", textDecoration: "none",
            marginBottom: "1.5rem",
          }}>
            ← All news
          </Link>

          {/* tags */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: "1.25rem",
          }}>
            <span style={{
              fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#b8c5d6", display: "block", marginBottom: "0.75rem",
            }}>Tags</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {a.tags.map((t) => (
                <span key={t} style={{
                  fontFamily: "var(--ff-mono)", fontSize: "0.66rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "0.28rem 0.6rem",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                }}>{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <div style={{
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: "clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <span className="eyebrow" style={{ marginBottom: "0.75rem", color: "var(--brand-red)" }}>Related articles</span>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: "1px", background: "#e2e8f0",
              border: "1px solid #e2e8f0", marginTop: "1.5rem",
            }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/news/${r.slug}`} className="ns-card">
                  <div className="ns-card__img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image} alt={r.title} className="ns-card__img" />
                  </div>
                  <div className="ns-card__body">
                    <div className="ns-card__meta">
                      <span className="ns-card__cat">{r.category}</span>
                      <span className="ns-card__date">{fmt(r.date)}</span>
                    </div>
                    <h3 className="ns-card__title">{r.title}</h3>
                    <p className="ns-card__excerpt">{r.excerpt}</p>
                    <span className="ns-card__cta">Read article →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      </div>{/* end light wrapper */}

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
          <span>Interested in this machine?</span>
          <AetherBtn><Link href="/contact">Talk to an engineer →</Link></AetherBtn>
        </h2>
      </section>

      <style suppressHydrationWarning>{`
        .article-body { line-height: 1.8; color: #475569; font-family: var(--ff-body); font-size: 1rem; font-weight: 400; }
        .article-body p { margin-bottom: 1.25rem; }
        .article-body h3 { font-family: var(--ff-display); font-size: 1.5rem; color: #0f172a; letter-spacing: 0.01em; line-height: 1; margin: 2.25rem 0 0.75rem; }
        .article-body ul { padding-left: 1.25rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.45rem; }
        .article-body li { position: relative; color: #475569; }
        .article-body strong { color: #0f172a; font-weight: 600; }

        .article-sidebar-link {
          font-family: var(--ff-mono); font-size: 0.65rem;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--brand-red); text-decoration: none;
          display: block; padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
          transition: color 0.15s;
        }
        .article-sidebar-link:last-child { border-bottom: none; }
        .article-sidebar-link:hover { color: #0f172a; }

        .ns-card { display: flex; flex-direction: column; background: #ffffff; text-decoration: none; transition: background 0.18s; }
        .ns-card:hover { background: #fef2f4; }
        .ns-card__img-wrap { width: 100%; aspect-ratio: 16/9; background: #f8fafc; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e2e8f0; }
        .ns-card__img { width: 60%; height: 75%; object-fit: contain; filter: drop-shadow(0 6px 16px rgba(15,23,42,0.12)); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
        .ns-card:hover .ns-card__img { transform: scale(1.06) translateY(-2%); }
        .ns-card__body { padding: 1.1rem 1.1rem 1.4rem; display: flex; flex-direction: column; flex: 1; }
        .ns-card__meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
        .ns-card__cat { font-family: var(--ff-mono); font-size: 0.66rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brand-red); }
        .ns-card__date { font-family: var(--ff-mono); font-size: 0.66rem; letter-spacing: 0.1em; color: #b8c5d6; }
        .ns-card__title { font-family: var(--ff-display); font-size: clamp(1rem,1.8vw,1.2rem); color: #0f172a; line-height: 1.15; letter-spacing: 0.01em; margin-bottom: 0.6rem; }
        .ns-card__excerpt { font-family: var(--ff-body); font-size: 0.82rem; font-weight: 400; color: #475569; line-height: 1.6; flex: 1; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .ns-card__cta { font-family: var(--ff-mono); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brand-red); }

        @media (max-width: 768px) {
          .article-body + aside { display: none; }
        }
      `}</style>
    </>
  );
}
