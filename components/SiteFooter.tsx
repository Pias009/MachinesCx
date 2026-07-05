"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND, categories } from "@/lib/products";

const PHONE_DISPLAY = "+86 577 8888 8888";
const PHONE_TEL = "+8657788888888";
const WHATSAPP_NUMBER = "8657788888888";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/cx-ops-x7k9q2")) return null;

  return (
    <footer className="footer">
      <div className="wrap footer-grid">

        {/* ── Brand ── */}
        <div className="footer-col footer-col--brand">
          <div className="footer-logo-row">
            <span className="footer-logo">
              <Image src="/logo.jpeg" alt={`${BRAND} logo`} width={64} height={64} />
            </span>
            <div className="footer-brand">Ashal<span>·</span>Innomach</div>
          </div>
          <p className="footer-desc">
            Blown-film, bag-making and recycling machinery for PE and
            biodegradable PBAT film. Lines from benchtop trial units to
            five-layer co-extrusion towers at 400 kg/h.
          </p>
          <div className="footer-founded">
            <span>Founded 2008</span>
            <span className="footer-founded__dot" aria-hidden="true" />
            <span>Wenzhou, Zhejiang, China</span>
          </div>
        </div>

        {/* ── Machinery ── */}
        <div className="footer-col">
          <h5>Machinery</h5>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}><Link href={`/products/${c.slug}`}>{c.name}</Link></li>
            ))}
            <li><Link href="/products">Full catalogue</Link></li>
          </ul>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/news">News</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/contact">Request a quote</Link></li>
          </ul>
        </div>

        {/* ── Contact ── */}
        <div className="footer-col">
          <h5>Contact</h5>
          <ul className="footer-contact">
            <li>
              <a href={`tel:${PHONE_TEL}`} className="footer-contact__link">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="footer-contact__link">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.03.24-3.43-.72-2.9-1.16-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.02-2.4.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.07.66.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.47-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.14.47.12.65-.07.18-.19.75-.88.95-1.18.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.29.14.48.21.55.33.07.12.07.68-.17 1.36Z"/></svg>
                WhatsApp
              </a>
            </li>
            <li className="footer-contact__static">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Wenzhou, China
            </li>
          </ul>
        </div>

      </div>

      <div className="wrap footer-bar">
        <p>© {new Date().getFullYear()} {BRAND}. All specifications subject to change without notice.</p>
        <p style={{ color: "var(--ash)", fontSize: "0.74rem" }}>Wenzhou Ashal Innomach Technology Co., Ltd.</p>
      </div>
    </footer>
  );
}
