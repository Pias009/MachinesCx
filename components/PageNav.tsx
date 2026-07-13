"use client";
import { useRouter, usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function PageNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on the homepage and on the hidden admin area
  if (!pathname || pathname === "/" || pathname.startsWith("/cx-ops-x7k9q2")) {
    return null;
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .pgnav {
          position: fixed;
          top: 84px; left: clamp(1rem, 4vw, 2.5rem);
          z-index: 150;
          display: flex; align-items: center; gap: .6rem;
        }
        .pgnav__btn {
          display: inline-flex; align-items: center; gap: .5rem;
          height: 40px; padding: 0 1rem;
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .08em; text-transform: uppercase; font-weight: 600;
          color: #f8fafc; text-decoration: none; cursor: pointer;
          background: rgba(15,23,42,0.72);
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          transition: background .2s, border-color .2s, transform .2s, color .2s;
        }
        .pgnav__btn:hover {
          background: rgba(43,191,179,0.14);
          border-color: rgba(43,191,179,0.5);
          color: var(--brand-teal);
          transform: translateY(-1px);
        }
        .pgnav__btn svg { width: 14px; height: 14px; flex-shrink: 0; }

        [data-theme="light"] .pgnav__btn {
          color: var(--slate);
          background: rgba(255,255,255,0.82);
          border-color: rgba(13,34,32,0.12);
        }
        [data-theme="light"] .pgnav__btn:hover { color: var(--brand-teal); }

        @media(max-width:640px){
          .pgnav { top: 80px; left: 1rem; gap: .45rem; }
          .pgnav__btn { height: 36px; padding: 0 .8rem; font-size: .66rem; }
          .pgnav__btn-label { display: none; }
          .pgnav__btn { padding: 0; width: 36px; justify-content: center; }
        }
      `}</style>

      <div className="pgnav" aria-label="Page navigation">
        <button
          type="button"
          className="pgnav__btn"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          <span className="pgnav__btn-label">Back</span>
        </button>

        <TransitionLink href="/" className="pgnav__btn" aria-label="Go to home">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7L8 2.5 13.5 7M4 6v7.5h8V6" />
          </svg>
          <span className="pgnav__btn-label">Home</span>
        </TransitionLink>
      </div>
    </>
  );
}
