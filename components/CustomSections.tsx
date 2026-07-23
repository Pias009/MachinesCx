import Image from "next/image";
import type { CustomSection } from "@/lib/products";

/* ── Admin-authored custom sections — 4 fixed, pre-styled templates ──
   Admins only ever supply content (title / image / text) through the
   admin panel; they never touch markup or CSS, so a new section can't
   break the page layout. Every template here is defensively styled:
   fixed aspect-ratio media (never intrinsic image sizing), wrapped
   text, and a shared max-width container — long titles, missing
   images, or many gallery photos all degrade gracefully instead of
   overflowing or collapsing the page. */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pdv2-cs-head">
      <span className="pdv2-cs-head__line" />
      <h2>{children}</h2>
    </div>
  );
}

function Banner({ section }: { section: Extract<CustomSection, { kind: "banner" }> }) {
  return (
    <div className="pdv2-cs pdv2-cs--banner" data-reveal="scale">
      <div className="pdv2-wrap">
        <SectionTitle>{section.title}</SectionTitle>
      </div>
      {section.image && (
        <div className="pdv2-cs-banner__media">
          <Image src={section.image} alt={section.title} fill sizes="(max-width: 900px) 100vw, 1200px" />
        </div>
      )}
      {section.text && (
        <div className="pdv2-wrap">
          <p className="pdv2-cs-banner__text">{section.text}</p>
        </div>
      )}
    </div>
  );
}

function TextOnly({ section }: { section: Extract<CustomSection, { kind: "text" }> }) {
  return (
    <div className="pdv2-cs pdv2-cs--text" data-reveal>
      <div className="pdv2-wrap">
        <SectionTitle>{section.title}</SectionTitle>
        <p className="pdv2-cs-text__body">{section.text}</p>
      </div>
    </div>
  );
}

function Split({ section }: { section: Extract<CustomSection, { kind: "split" }> }) {
  const reversed = section.imageSide === "right";
  return (
    <div className="pdv2-cs pdv2-cs--split" data-reveal>
      <div className="pdv2-wrap">
        <SectionTitle>{section.title}</SectionTitle>
        <div className={`pdv2-cs-split__row${reversed ? " pdv2-cs-split__row--rev" : ""}`}>
          <div className="pdv2-cs-split__media">
            {section.image ? (
              <Image src={section.image} alt={section.title} fill sizes="(max-width: 900px) 90vw, 45vw" />
            ) : (
              <span className="pdv2-cs-split__media-empty" aria-hidden="true" />
            )}
          </div>
          <p className="pdv2-cs-split__text">{section.text}</p>
        </div>
      </div>
    </div>
  );
}

function Gallery({ section }: { section: Extract<CustomSection, { kind: "gallery" }> }) {
  const photos = (section.photos ?? []).filter(p => p.src);
  if (photos.length === 0) return null;
  return (
    <div className="pdv2-cs pdv2-cs--gallery" data-reveal="scale">
      <div className="pdv2-wrap">
        <SectionTitle>{section.title}</SectionTitle>
        <div className="pdv2-cs-gallery__grid">
          {photos.map((p, i) => (
            <div key={i} className="pdv2-cs-gallery__cell">
              <div className="pdv2-cs-gallery__img">
                <Image src={p.src} alt={p.caption || section.title} fill sizes="(max-width: 700px) 45vw, 22vw" />
              </div>
              {p.caption && <span className="pdv2-cs-gallery__caption">{p.caption}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomSections({ sections }: { sections?: CustomSection[] }) {
  if (!sections || sections.length === 0) return null;
  return (
    <>
      {sections.map((s, i) => {
        if (!s.title?.trim() && s.kind !== "gallery") return null;
        switch (s.kind) {
          case "banner":  return <Banner  key={i} section={s} />;
          case "text":    return s.text?.trim() ? <TextOnly key={i} section={s} /> : null;
          case "split":   return s.text?.trim() ? <Split key={i} section={s} /> : null;
          case "gallery": return <Gallery key={i} section={s} />;
          default:        return null;
        }
      })}
    </>
  );
}
