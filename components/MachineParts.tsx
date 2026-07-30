"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionHead } from "@/components/EditorialKit";
import type { MachinePart } from "@/lib/products";

/* ── real, admin-added machine parts — separate from the older
   hardcoded "Part N" photo-crop breakdown (which zooms into regions of
   the main product shot since no per-part photography exists for those
   categories). This section only renders parts an admin has actually
   added, with real uploaded photos, and shows a numbered install-step
   guide inside a part's card only when that part actually has steps. */

function PartPhotos({ images, name }: { images: string[]; name: string }) {
  const t = useTranslations("machineParts");
  const [active, setActive] = useState(0);
  const photos = images.filter(Boolean);
  if (photos.length === 0) {
    return <div className="pdv2-mp-card__media pdv2-mp-card__media--empty" aria-hidden="true" />;
  }
  return (
    <div className="pdv2-mp-card__media">
      <Image src={photos[Math.min(active, photos.length - 1)]} alt={name} fill sizes="(max-width: 700px) 90vw, 380px" />
      {photos.length > 1 && (
        <div className="pdv2-mp-thumbs" role="tablist" aria-label={t("photosAria", { name })}>
          {photos.map((p, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={active === i}
              aria-label={t("photoOfAria", { num: i + 1, total: photos.length })}
              className={`pdv2-mp-thumb${active === i ? " pdv2-mp-thumb--on" : ""}`}
              onClick={() => setActive(i)}
            >
              <Image src={p} alt="" fill sizes="44px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PartCard({ part }: { part: MachinePart }) {
  const t = useTranslations("machineParts");
  const steps = (part.installation ?? []).filter(s => s.title?.trim() || s.detail?.trim());
  return (
    <div className="pdv2-mp-card" data-reveal="scale">
      <PartPhotos images={part.images ?? []} name={part.name} />
      <div className="pdv2-mp-card__body">
        <h3 className="pdv2-mp-card__name">{part.name}</h3>
        {part.detail && <p className="pdv2-mp-card__detail">{part.detail}</p>}

        {steps.length > 0 && (
          <div className="pdv2-mp-steps">
            <span className="pdv2-mp-steps__label">{t("installationSteps")}</span>
            <ol className="pdv2-mp-steps__list">
              {steps.map((s, i) => (
                <li key={i} className="pdv2-mp-step">
                  <span className="pdv2-mp-step__num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="pdv2-mp-step__body">
                    {s.image && (
                      <div className="pdv2-mp-step__img">
                        <Image src={s.image!} alt={s.title} width={64} height={64} />
                      </div>
                    )}
                    <div>
                      {s.title && <span className="pdv2-mp-step__title">{s.title}</span>}
                      {s.detail && <p className="pdv2-mp-step__detail">{s.detail}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MachineParts({ parts }: { parts?: MachinePart[] }) {
  const t = useTranslations("machineParts");
  const valid = (parts ?? []).filter(p => p.name?.trim());
  if (valid.length === 0) return null;

  return (
    <section className="pdv2-mp" aria-label={t("sectionAria")}>
      <div className="pdv2-wrap">
        <SectionHead
          eyebrow={t("sectionAria")}
          title={<>{t("titlePrefix")} <em className="text-[var(--brand-teal)] not-italic">{t("titleEm")}</em></>}
        />
        <div className="pdv2-mp-grid" data-reveal>
          {valid.map((part, i) => <PartCard key={i} part={part} />)}
        </div>
      </div>
    </section>
  );
}
