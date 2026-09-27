import Link from "next/link";
import type { Category, ProductFamily } from "@/lib/products";
import { CATEGORY_ORDER } from "@/lib/productSeo";

const GROUP_LABEL: Record<string, string> = {
  "film-blowing": "Film Blowing",
  "bag-making": "Bag Making",
  "recycling": "Recycling",
  "printing": "Flexographic Printing",
};

/* Homepage "All machine models" index — every product page, grouped by
   category, as plain server-rendered links (link text = the product H1). */
export default function AllModelsIndex({ categories, families }: { categories: Category[]; families: ProductFamily[] }) {
  const order = [...CATEGORY_ORDER, ...categories.map((c) => c.slug).filter((s) => !(CATEGORY_ORDER as readonly string[]).includes(s))];
  const groups = order
    .map((slug) => ({ slug, fams: families.filter((f) => f.category === slug) }))
    .filter((g) => g.fams.length > 0);

  return (
    <section className="ami" aria-labelledby="ami-heading">
      <style>{`
        .ami { background: var(--bg-surface); border-top: 1px solid var(--bg-line); }
        .ami__wrap { max-width: 1280px; margin: 0 auto; padding: clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem); }
        .ami h2 { font-family: var(--ff-display); font-size: clamp(1.8rem,3.5vw,2.8rem); color: var(--ink); line-height: 1; margin: 0 0 clamp(1.5rem,3vw,2.5rem); }
        .ami__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: clamp(1.5rem,3vw,2.5rem); }
        .ami h3 { font-family: var(--ff-mono); font-size: .7rem; letter-spacing: .16em; text-transform: uppercase; color: var(--brand-teal); margin: 0 0 .75rem; font-weight: 500; }
        .ami h3 a { color: inherit; text-decoration: none; }
        .ami h3 a:hover { text-decoration: underline; }
        .ami ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .ami li a { display: block; padding: .5rem 0; border-bottom: 1px solid var(--bg-line); color: var(--ink-60); font-family: var(--ff-body); font-size: .9rem; line-height: 1.4; text-decoration: none; transition: color .15s; }
        .ami li a:hover { color: var(--ink); }
      `}</style>
      <div className="ami__wrap">
        <h2 id="ami-heading">All machine models</h2>
        <div className="ami__grid">
          {groups.map((g) => (
            <div key={g.slug}>
              <h3><Link href={`/products/${g.slug}`}>{GROUP_LABEL[g.slug] ?? categories.find((c) => c.slug === g.slug)?.name ?? g.slug}</Link></h3>
              <ul>
                {g.fams.map((f) => (
                  <li key={f.slug}>
                    <Link href={`/products/${f.category}/${f.slug}`} prefetch={false}>{f.seo?.h1 ?? f.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
