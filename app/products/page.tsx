import Link from "next/link";
import { familyImage } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";

export const metadata = { title: "Full Catalogue — Ashal Innomach" };
export const dynamic = "force-dynamic";

export default async function ProductsIndex() {
  const { categories, families } = await getLiveCatalogue();
  const familiesByCategory = (slug: string) => families.filter((f) => f.category === slug);

  return (
    <>
      <header className="cat-hero">
        <div className="cat-hero__media" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/machines/abcde-2200.png" alt="" />
        </div>
        <div className="wrap">
          <p style={{ fontFamily: "var(--ff-mono)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ash)" }}>
            <Link href="/" style={{ color: "var(--ash)" }}>Home</Link> /&nbsp;
            <span style={{ color: "var(--bone)" }}>Catalogue</span>
          </p>
          <h1>Full catalogue.</h1>
          <p style={{ color: "var(--ash)", maxWidth: "52ch", marginTop: "1rem" }}>
            Every machine family, with full bilingual specification tables. Jump
            to a category or browse everything below.
          </p>
          <nav className="cat-nav">
            {categories.map((c) => (
              <Link key={c.slug} href={`/products/${c.slug}`}>{c.name}</Link>
            ))}
          </nav>
        </div>
      </header>

      {categories.map((c) => (
        <section key={c.slug} style={{ background: "var(--void)", padding: "clamp(3.5rem,7vw,6rem) 0", borderTop: "1px solid var(--border)" }}>
          <div className="wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              <div>
                <span className="eyebrow">{c.tagline}</span>
                <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,5vw,3.8rem)", color: "var(--slate)", lineHeight: 0.96, marginTop: "0.75rem" }}>{c.name}</h2>
                <p style={{ color: "var(--ash)", marginTop: "0.75rem", maxWidth: "54ch" }}>{c.blurb}</p>
              </div>
              <Link href={`/products/${c.slug}`} className="btn btn--ghost">Full spec tables →</Link>
            </div>
            <div className="families-scroll">
              {familiesByCategory(c.slug).map((f) => (
                <Link key={f.slug} href={`/products/${f.category}#${f.slug}`} className="fam-card">
                  <div className="machine-stage">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={familyImage(f)} alt={f.name} loading="lazy" />
                  </div>
                  <div className="fam-card__body">
                    <span className="fam-card__series">{f.series}</span>
                    <span className="fam-card__name">{f.name}</span>
                    <span className="fam-card__tag">{f.tagline}</span>
                    <div className="fam-card__models">
                      {f.models.map((m) => <span key={m} className="chip">{m}</span>)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
