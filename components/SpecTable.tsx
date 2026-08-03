"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ProductFamily } from "@/lib/products";

export default function SpecTable({ family }: { family: ProductFamily }) {
  const t = useTranslations("specTable");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Wide comparison tables only scroll sideways, which a plain vertical
  // wheel/trackpad gesture won't trigger in any browser by default —
  // redirect vertical wheel input to horizontal scroll while hovering.
  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    el.scrollLeft += e.deltaY;
    e.preventDefault();
  }

  return (
    <div className="spec-wrap" ref={wrapRef} onWheel={handleWheel}>
      <table className="spec-table">
        <thead>
          <tr>
            <th className="spec-label">{t("specification")}</th>
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
      <div className="spec-wrap-fade" aria-hidden="true" />
    </div>
  );
}
