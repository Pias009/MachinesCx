import Link from "next/link";
import { ProductFamily } from "@/lib/products";

export default function FamilyCard({ family }: { family: ProductFamily }) {
  return (
    <Link href={`/products/${family.category}#${family.slug}`} className="card">
      <span className="card__series">{family.series}</span>
      <span className="card__name">{family.name}</span>
      <span className="card__tag">{family.tagline}</span>
      <div className="card__models">
        {family.models.map((m) => (
          <span key={m} className="chip">{m}</span>
        ))}
      </div>
    </Link>
  );
}
