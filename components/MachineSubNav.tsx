"use client";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { categories } from "@/lib/products";

const CATEGORY_IMAGES: Record<string, string> = {
  "film-blowing": "/machines/abc-cx-series.png",
  "bag-making": "/machines/f-pro-bottomseal.png",
  "recycling": "/machines/cx-pelletizing.png",
  "printing": "/machines/flexo-1.png",
};

export default function MachineSubNav() {
  return (
    <>
      <style suppressHydrationWarning>{`
        .msn {
          position: relative;
          z-index: 100;
          width: 100%;
          padding-top: 98px; /* clears floating main nav header */
          padding-bottom: 0.75rem;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-backdrop-filter: none !important;
                  backdrop-filter: none !important;
        }

        .msn__inner {
          width: 100%;
          max-width: 1100px;
          margin-inline: auto;
          padding: 0.5rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(1.5rem, 4vw, 3.5rem);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .msn__inner::-webkit-scrollbar {
          display: none;
        }

        .msn__item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.25rem 0.5rem;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .msn__item:hover {
          opacity: 1;
          transform: translateY(-2px);
        }

        .msn__img-logo {
          height: 34px;
          width: 46px;
          object-fit: contain;
          flex-shrink: 0;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
          transition: transform 0.2s ease;
        }
        .msn__item:hover .msn__img-logo {
          transform: scale(1.1);
        }

        .msn__name {
          font-family: var(--ff-display);
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          transition: color 0.2s ease;
        }
        .msn__item:hover .msn__name {
          color: var(--brand-teal);
        }

        [data-theme="light"] .msn__name {
          color: rgba(13, 34, 32, 0.88);
        }
        [data-theme="light"] .msn__item:hover .msn__name {
          color: var(--brand-teal);
        }

        @media (max-width: 640px) {
          .msn {
            padding-top: 76px;
          }
          .msn__inner {
            justify-content: flex-start;
            gap: 1.2rem;
            padding: 0.4rem 1rem;
          }
          .msn__img-logo {
            height: 28px;
            width: 38px;
          }
          .msn__name {
            font-size: 0.8rem;
          }
        }
      `}</style>

      <div className="msn" aria-label="Machine Categories Navigation">
        <div className="msn__inner">
          {categories.map((cat) => {
            const img = CATEGORY_IMAGES[cat.slug] ?? `/machines/${cat.slug}.png`;
            return (
              <TransitionLink
                key={cat.slug}
                href={`/products/${cat.slug}`}
                className="msn__item"
              >
                <Image
                  src={img}
                  alt={cat.name}
                  width={46}
                  height={34}
                  className="msn__img-logo"
                  unoptimized
                />
                <span className="msn__name">
                  {cat.name.replace(" Machines", "").replace(" & Lab Lines", "")}
                </span>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </>
  );
}
