"use client";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BRAND } from "@/lib/products";

gsap.registerPlugin(useGSAP);

const PHONE_DISPLAY = "+86 577 8888 8888";
const PHONE_TEL = "+8657788888888";
const WHATSAPP_NUMBER = "8657788888888";
const EMAIL = "info@cxmachinery.com";

/* mobile-only accordion — desktop ignores `open` entirely via CSS
   (see .footer-col-toggle / .footer-col-body display rules) so this
   component renders identically to before at desktop widths */
function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="footer-col">
      <button
        type="button"
        className="footer-col-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <h4 className="footer-col-title">{title}</h4>
        <svg className="footer-col-chev" width="12" height="12" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>
      <div className={`footer-col-body${open ? " footer-col-body--open" : ""}`}>
        {links.map((l) => (
          <Link key={l.label} href={l.href} className="footer-col-link">{l.label}</Link>
        ))}
      </div>
    </div>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();
  const t = useTranslations("footer");

  const footerRef = useRef<HTMLElement>(null);
  const [pluginReady, setPluginReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      setPluginReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useGSAP(() => {
    if (!pluginReady || !footerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = gsap.utils.toArray<HTMLElement>(
      footerRef.current.querySelectorAll(".footer-reveal")
    );
    gsap.set(rows, { opacity: 0, y: 24 });
    gsap.to(rows, {
      opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
    });
  }, { scope: footerRef, dependencies: [pluginReady] });

  if (pathname?.startsWith("/cx-ops-x7k9q2")) return null;

  const PRODUCT_LINKS = [
    { label: t("productLinks.filmBlowing"), href: "/products/film-blowing" },
    { label: t("productLinks.bagMaking"), href: "/products/bag-making" },
    { label: t("productLinks.recycling"), href: "/products/recycling" },
    { label: t("productLinks.printing"), href: "/products/printing" },
    { label: t("productLinks.catalogue"), href: "/products" },
  ];

  const COMPANY_LINKS = [
    { label: t("companyLinks.about"), href: "/about" },
    { label: t("companyLinks.factory"), href: "/about" },
    { label: t("companyLinks.news"), href: "/news" },
    { label: t("companyLinks.careers"), href: "/about" },
  ];

  const SUPPORT_LINKS = [
    { label: t("supportLinks.quote"), href: "/inquiries" },
    { label: t("supportLinks.parts"), href: "/inquiries" },
    { label: t("supportLinks.technical"), href: "/inquiries" },
    { label: t("supportLinks.contact"), href: "/inquiries" },
    { label: t("supportLinks.engineer"), href: "/inquiries" },
  ];

  const LEGAL_LINKS = [
    { label: t("legal.privacy"), href: "#" },
    { label: t("legal.terms"), href: "#" },
  ];

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-bg-grid" aria-hidden="true" />
      <div className="footer-bg-glow" aria-hidden="true" />
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>

        {/* ── Main footer grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto", gap: "clamp(2rem,4vw,3.5rem)", paddingBottom: "2.5rem" }} className="footer-main-grid footer-reveal">

          {/* Brand + QR codes */}
          <div className="footer-brand-block" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="footer-brand-text">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="footer-logo">
                  <Image src="/logo.jpeg" alt={`${BRAND} logo`} width={48} height={48} />
                </span>
                <div>
                  <div className="footer-brand">Ashal<span style={{ color: "var(--brand-red)" }}>·</span>Innomach</div>
                  <div className="footer-founded" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: "0.25rem" }}>{t("since")}</div>
                </div>
              </div>

              <p className="footer-blurb" style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", lineHeight: 1.7, maxWidth: "30ch", marginTop: "1.5rem" }}>
                {t("blurb")}
              </p>
            </div>

            {/* QR Codes */}
            <div className="footer-qr-row" style={{ display: "flex", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ background: "#fff", borderRadius: "0.5rem", padding: "0.4rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Image src="/qr-whatsapp.png" alt={t("whatsapp")} width={80} height={80} style={{ display: "block" }} />
                </div>
                <span className="footer-qr-label" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("whatsapp")}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ background: "#fff", borderRadius: "0.5rem", padding: "0.4rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Image src="/qr-website.png" alt={t("website")} width={80} height={80} style={{ display: "block" }} />
                </div>
                <span className="footer-qr-label" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("website")}</span>
              </div>
            </div>
          </div>

          <FooterColumn title={t("columns.products")} links={PRODUCT_LINKS} />
          <FooterColumn title={t("columns.company")} links={COMPANY_LINKS} />
          <FooterColumn title={t("columns.support")} links={SUPPORT_LINKS} />

          {/* Contact + Social */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "180px" }}>
            <h4 className="footer-contact-heading" style={{ fontFamily: "var(--ff-display)", fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{t("contactHeading")}</h4>

            <a href={`tel:${PHONE_TEL}`} className="footer-contact-link">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {PHONE_DISPLAY}
            </a>

            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="footer-contact-link">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.03.24-3.43-.72-2.9-1.16-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.02-2.4.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.07.66.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.47-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.14.47.12.65-.07.18-.19.75-.88.95-1.18.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.29.14.48.21.55.33.07.12.07.68-.17 1.36Z"/></svg>
              {t("whatsapp")}
            </a>

            <a href={`mailto:${EMAIL}`} className="footer-contact-link">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
              {EMAIL}
            </a>

            <span className="footer-contact-static">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {t("location")}
            </span>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <a href="https://www.facebook.com/cxmachinery" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/cxmachinery" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/cxmachinery" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.youtube.com/@cxmachinery" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── Certifications bar ── */}
        <div className="footer-certs footer-reveal" style={{ display: "flex", alignItems: "center", gap: "2rem", paddingBlock: "1.25rem", flexWrap: "wrap" }}>
          <span className="footer-certs__label" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <span className="footer-live-dot" aria-hidden="true" />
            {t("certifications")}
          </span>
          <span className="footer-certs__badges" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[t("certBadges.ce"), t("certBadges.iso"), t("certBadges.sgs")].map((cert) => (
              <span key={cert} className="footer-cert-badge" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.06em", padding: "0.25rem 0.6rem", borderRadius: "2px" }}>{cert}</span>
            ))}
          </span>
          <span className="footer-certs__spacer" style={{ flex: 1 }} />
          <span className="footer-certs__stats" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>{t("stats")}</span>
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bar footer-reveal">
          <p className="footer-copyright" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.72rem" }}>{t("copyright", { year: new Date().getFullYear(), brand: BRAND })}</p>
          <div className="footer-bar__legal" style={{ display: "flex", gap: "1.5rem" }}>
            {LEGAL_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="footer-legal-link" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.68rem", textDecoration: "none", letterSpacing: "0.04em" }}>{l.label}</Link>
            ))}
          </div>
          <p className="footer-bar__company" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.72rem" }}>{t("companyName")}</p>
        </div>
      </div>
    </footer>
  );
}
