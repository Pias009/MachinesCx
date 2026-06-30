import Link from "next/link";
import { BRAND, categories } from "@/lib/products";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="footer-brand">Ashal<span>·</span>Innomach</div>
          <p className="footer-desc">
            Blown-film, bag-making and recycling machinery for PE and
            biodegradable PBAT film. Lines from benchtop trial units to
            five-layer co-extrusion towers at 400 kg/h.
          </p>
        </div>
        <div>
          <h5>Machinery</h5>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}><Link href={`/products/${c.slug}`}>{c.name}</Link></li>
            ))}
            <li><Link href="/products">Full catalogue</Link></li>
          </ul>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/news">News</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/contact">Request a quote</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bar">
        <p>© {new Date().getFullYear()} {BRAND}. All specifications subject to change without notice.</p>
        <p style={{ color: "var(--ash)", fontSize: "0.65rem" }}>Wenzhou Ashal Innomach Technology Co., Ltd.</p>
      </div>
    </footer>
  );
}
