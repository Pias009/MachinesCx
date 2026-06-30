import { ProductFamily } from "@/lib/products";

export default function SpecTable({ family }: { family: ProductFamily }) {
  return (
    <div className="spec-wrap">
      <table className="spec-table">
        <thead>
          <tr>
            <th className="spec-label">Specification</th>
            {family.models.map((m) => <th key={m}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {family.specs.map((row) => (
            <tr key={row.label}>
              <td className="spec-label">
                <b>{row.label}</b>
              </td>
              {row.values.map((v, i) => <td key={i} className="val">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
