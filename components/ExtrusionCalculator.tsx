"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface DensityPreset {
  name: string;
  density: number; // g/cm3
  desc: string;
}

const DENSITY_PRESETS: DensityPreset[] = [
  { name: "LDPE", density: 0.922, desc: "Low Density Polyethylene (General Packaging)" },
  { name: "LLDPE", density: 0.92, desc: "Linear Low Density (Stretch / Garbage Bags)" },
  { name: "HDPE", density: 0.955, desc: "High Density (High Strength / T-Shirt Bags)" },
  { name: "PBAT + PLA", density: 1.25, desc: "Compostable & Biodegradable Bioplastics" },
  { name: "PP", density: 0.905, desc: "Polypropylene (High Clarity Packaging)" },
];

export default function ExtrusionCalculator() {
  // Input states
  const [flatWidth, setFlatWidth] = useState<number>(1000); // mm
  const [thickness, setThickness] = useState<number>(40); // microns
  const [lineSpeed, setLineSpeed] = useState<number>(50); // m/min
  const [selectedDensityIdx, setSelectedDensityIdx] = useState<number>(0);
  const [customDensity, setCustomDensity] = useState<number>(0.922);

  // ABA Cost states
  const [monthlyTons, setMonthlyTons] = useState<number>(50); // Tons/month
  const [virginPrice, setVirginPrice] = useState<number>(1.4); // $/kg
  const [corePrice, setCorePrice] = useState<number>(0.65); // $/kg
  const [coreRatio, setCoreRatio] = useState<number>(50); // % of B layer

  // Machine payback state
  const [estimatedMachineCost, setEstimatedMachineCost] = useState<number>(45000); // USD

  const density = selectedDensityIdx === -1 ? customDensity : DENSITY_PRESETS[selectedDensityIdx].density;

  // Calculated Results
  const outputKgH = useMemo(() => {
    // Formula: Output (kg/h) = Flat Width (mm) * Thickness (micron) * Speed (m/min) * Density (g/cm3) * 0.00012
    const res = flatWidth * thickness * lineSpeed * density * 0.00012;
    return Math.round(res * 10) / 10;
  }, [flatWidth, thickness, lineSpeed, density]);

  const outputTonsDay = useMemo(() => {
    return Math.round(((outputKgH * 24) / 1000) * 100) / 100;
  }, [outputKgH]);

  const filmWeightPerMeter = useMemo(() => {
    // Grams per linear meter = Circumference (m) * Thickness (m) * Density (g/cm3) * 1,000,000
    // = (FlatWidth * 2 / 1000) * (Thickness / 1000000) * (Density * 1000000)
    const grams = (flatWidth * 2 / 1000) * (thickness / 1000) * density * 1000;
    return Math.round(grams * 100) / 100;
  }, [flatWidth, thickness, density]);

  // ABA Cost Calculations
  const virginLayerPct = (100 - coreRatio) / 2; // Split evenly between 2 outer A layers
  const avgAbablendPriceKg = useMemo(() => {
    const vPortion = (virginLayerPct * 2) / 100;
    const cPortion = coreRatio / 100;
    return vPortion * virginPrice + cPortion * corePrice;
  }, [virginLayerPct, coreRatio, virginPrice, corePrice]);

  const singleLayerMonthlyCost = useMemo(() => {
    return monthlyTons * 1000 * virginPrice;
  }, [monthlyTons, virginPrice]);

  const abaMonthlyCost = useMemo(() => {
    return monthlyTons * 1000 * avgAbablendPriceKg;
  }, [monthlyTons, avgAbablendPriceKg]);

  const monthlySavings = singleLayerMonthlyCost - abaMonthlyCost;
  const annualSavings = monthlySavings * 12;
  const percentageSavings = ((virginPrice - avgAbablendPriceKg) / virginPrice) * 100;

  const paybackMonths = useMemo(() => {
    if (monthlySavings <= 0) return 0;
    return Math.round((estimatedMachineCost / monthlySavings) * 10) / 10;
  }, [estimatedMachineCost, monthlySavings]);

  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const reportText = `--- ASHAL INNOMACH EXTRUSION CALCULATOR REPORT ---
Width: ${flatWidth} mm | Thickness: ${thickness} microns | Speed: ${lineSpeed} m/min
Polymer: ${DENSITY_PRESETS[selectedDensityIdx]?.name || "Custom"} (${density} g/cm³)
--------------------------------------------------
Extrusion Output Rate: ${outputKgH} kg/h (${outputTonsDay} Tons/24h)
Linear Film Weight: ${filmWeightPerMeter} g/m
--------------------------------------------------
ABA 3-Layer Savings (${coreRatio}% Core B-Layer):
Single-Layer Monthly Resin Cost: $${singleLayerMonthlyCost.toLocaleString()}
ABA 3-Layer Monthly Resin Cost:  $${abaMonthlyCost.toLocaleString()}
ESTIMATED MONTHLY SAVINGS:       $${Math.round(monthlySavings).toLocaleString()}
ESTIMATED ANNUAL SAVINGS:        $${Math.round(annualSavings).toLocaleString()} (${Math.round(percentageSavings)}% Reduction)
--------------------------------------------------
Calculated at https://www.wzashal.com/tools/extrusion-calculator`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[var(--brand-teal)]/30 bg-gradient-to-r from-[#0a1b18] via-[var(--bg-surface)] to-[var(--bg-surface)] p-8 sm:p-12" data-reveal>
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-teal)]/40 bg-[var(--brand-teal)]/15 px-3.5 py-1 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--brand-teal)]">
            <span>⚙️ Industrial Engineering Tool</span>
            <span>•</span>
            <span>Free B2B Cost Estimator</span>
          </div>
          <h1 className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-tight text-white" style={{ fontFamily: "var(--ff-display)" }}>
            Blown Film Extrusion & <em className="text-[var(--brand-teal)] not-italic">ABA Resin Cost</em> Calculator
          </h1>
          <p className="text-[1rem] leading-relaxed text-[var(--ink-60)]">
            Calculate your hourly extrusion throughput rate (kg/h), linear film gauge weight, and precise polymer savings when upgrading from monolayer to 3-Layer ABA co-extrusion technology.
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs vs Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Input Controls */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Film Specifications */}
          <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-teal)]/20 text-[var(--brand-teal)] text-sm">1</span>
              Film & Line Parameters
            </h2>

            {/* Flat Lay Width */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-white">Flat Lay Film Width ($W$):</label>
                <span className="font-mono text-[var(--brand-teal)] text-base font-bold">{flatWidth} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="10"
                value={flatWidth}
                onChange={(e) => setFlatWidth(Number(e.target.value))}
                className="w-full accent-[var(--brand-teal)] bg-black/40 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[0.68rem] text-[var(--ink-35)]">
                <span>200 mm (Bag/Pouch)</span>
                <span>1500 mm (Standard)</span>
                <span>3000 mm (Agricultural)</span>
              </div>
            </div>

            {/* Thickness / Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-white">Single Wall Film Thickness ($T$):</label>
                <span className="font-mono text-[var(--brand-teal)] text-base font-bold">{thickness} Microns ({Math.round(thickness * 4)} Gauge)</span>
              </div>
              <input
                type="range"
                min="8"
                max="200"
                step="1"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full accent-[var(--brand-teal)] bg-black/40 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[0.68rem] text-[var(--ink-35)]">
                <span>8 µm (Thin T-Shirt)</span>
                <span>50 µm (Heavy Sack)</span>
                <span>200 µm (Liner Film)</span>
              </div>
            </div>

            {/* Line Speed */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-white">Extrusion Line Speed ($S$):</label>
                <span className="font-mono text-[var(--brand-teal)] text-base font-bold">{lineSpeed} m/min</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={lineSpeed}
                onChange={(e) => setLineSpeed(Number(e.target.value))}
                className="w-full accent-[var(--brand-teal)] bg-black/40 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[0.68rem] text-[var(--ink-35)]">
                <span>10 m/min</span>
                <span>100 m/min</span>
                <span>250 m/min (High Speed)</span>
              </div>
            </div>

            {/* Polymer Type Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Polymer Resin Material & Density ($\rho$):</label>
              <select
                value={selectedDensityIdx}
                onChange={(e) => setSelectedDensityIdx(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] px-4 py-3 text-sm text-white focus:border-[var(--brand-teal)] outline-none"
              >
                {DENSITY_PRESETS.map((p, idx) => (
                  <option key={p.name} value={idx}>
                    {p.name} — {p.density} g/cm³ ({p.desc})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: ABA Resin Cost Parameters */}
          <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-teal)]/20 text-[var(--brand-teal)] text-sm">2</span>
              ABA 3-Layer Co-Extrusion Cost Inputs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Production Volume */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--ink-60)]">Monthly Production (Tons):</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={monthlyTons}
                  onChange={(e) => setMonthlyTons(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] px-4 py-2.5 font-mono text-sm text-white focus:border-[var(--brand-teal)] outline-none"
                />
              </div>

              {/* Virgin Resin Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--ink-60)]">Virgin Polymer Price ($/kg):</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="10"
                  value={virginPrice}
                  onChange={(e) => setVirginPrice(Math.max(0.1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] px-4 py-2.5 font-mono text-sm text-white focus:border-[var(--brand-teal)] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Core Layer B Material Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--ink-60)]">Middle B-Layer Material Price ($/kg):</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="10"
                  value={corePrice}
                  onChange={(e) => setCorePrice(Math.max(0.05, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] px-4 py-2.5 font-mono text-sm text-white focus:border-[var(--brand-teal)] outline-none"
                />
                <span className="text-[0.68rem] text-[var(--ink-35)]">Recycled PE ($0.65/kg) or CaCO3 Masterbatch ($0.40/kg)</span>
              </div>

              {/* Machine Price for Payback */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--ink-60)]">Estimated ABA Line Price ($ USD):</label>
                <input
                  type="number"
                  step="1000"
                  min="10000"
                  value={estimatedMachineCost}
                  onChange={(e) => setEstimatedMachineCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] px-4 py-2.5 font-mono text-sm text-white focus:border-[var(--brand-teal)] outline-none"
                />
              </div>
            </div>

            {/* Core Layer B Percentage Slider */}
            <div className="space-y-2 pt-2 border-t border-[var(--bg-line)]">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-white">Core Layer B Volume Ratio:</label>
                <span className="font-mono text-[var(--brand-teal)] text-base font-bold">{coreRatio}% B-Layer ({virginLayerPct}% Outer A / {coreRatio}% B / {virginLayerPct}% Outer A)</span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                step="5"
                value={coreRatio}
                onChange={(e) => setCoreRatio(Number(e.target.value))}
                className="w-full accent-[var(--brand-teal)] bg-black/40 h-2 rounded-lg cursor-pointer"
              />

              {/* Visual Co-Extrusion Layer Bar */}
              <div className="mt-4 rounded-xl border border-[var(--bg-line)] p-4 bg-[var(--bg-base)] space-y-2">
                <span className="text-xs font-mono uppercase tracking-[0.12em] text-[var(--ink-35)]">Film Cross-Section Layers:</span>
                <div className="flex h-10 w-full overflow-hidden rounded-lg font-mono text-xs font-bold text-black text-center leading-10">
                  <div style={{ width: `${virginLayerPct}%` }} className="bg-[var(--brand-teal)] transition-all">
                    A ({virginLayerPct}%)
                  </div>
                  <div style={{ width: `${coreRatio}%` }} className="bg-amber-400 transition-all">
                    B - Core Recycled/CaCO3 ({coreRatio}%)
                  </div>
                  <div style={{ width: `${virginLayerPct}%` }} className="bg-[var(--brand-teal)] transition-all">
                    A ({virginLayerPct}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Real-Time Results & ROI Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Key Throughput Outputs */}
          <div className="rounded-2xl border border-[var(--brand-teal)]/40 bg-[#071311] p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--brand-teal)]">
              Calculated Extrusion Performance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="block text-[0.7rem] uppercase tracking-[0.1em] text-[var(--ink-35)] font-mono">Hourly Output</span>
                <span className="text-3xl font-bold font-mono text-white">{outputKgH}</span>
                <span className="text-xs font-mono text-[var(--brand-teal)] ml-1">kg / hour</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <span className="block text-[0.7rem] uppercase tracking-[0.1em] text-[var(--ink-35)] font-mono">24h Capacity</span>
                <span className="text-3xl font-bold font-mono text-white">{outputTonsDay}</span>
                <span className="text-xs font-mono text-[var(--brand-teal)] ml-1">Tons / day</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex justify-between items-center">
              <span className="text-xs font-mono text-[var(--ink-60)]">Linear Film Weight:</span>
              <span className="text-lg font-bold font-mono text-[var(--brand-teal)]">{filmWeightPerMeter} g / meter</span>
            </div>
          </div>

          {/* Card 2: ABA Cost & ROI Summary */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#061e18] via-[var(--bg-surface)] to-[var(--bg-surface)] p-6 sm:p-8 space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">
              ABA 3-Layer Financial Savings
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--bg-line)] pb-3">
                <span className="text-sm text-[var(--ink-60)]">Monolayer Monthly Resin Cost:</span>
                <span className="font-mono text-base font-semibold text-red-400">${singleLayerMonthlyCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center border-b border-[var(--bg-line)] pb-3">
                <span className="text-sm text-[var(--ink-60)]">ABA 3-Layer Monthly Resin Cost:</span>
                <span className="font-mono text-base font-semibold text-emerald-400">${abaMonthlyCost.toLocaleString()}</span>
              </div>

              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-5 space-y-1">
                <span className="block text-xs font-mono uppercase tracking-[0.12em] text-emerald-400">Net Estimated Monthly Savings</span>
                <div className="text-4xl font-bold font-mono text-white">
                  ${Math.round(monthlySavings).toLocaleString()}
                  <span className="text-sm font-normal text-emerald-300 ml-2">/ month</span>
                </div>
                <span className="text-xs text-emerald-300/80 block pt-1">
                  Annual Savings: <strong className="text-white">${Math.round(annualSavings).toLocaleString()}</strong> ({Math.round(percentageSavings)}% material cost reduction)
                </span>
              </div>

              {paybackMonths > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex justify-between items-center font-mono">
                  <span className="text-xs text-[var(--ink-60)]">Machine Payback Period:</span>
                  <span className="text-sm font-bold text-[var(--brand-teal)]">{paybackMonths} Months</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--brand-teal)]/40 bg-[var(--brand-teal)]/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-[var(--brand-teal)] font-bold hover:bg-[var(--brand-teal)] hover:text-black transition-all"
              >
                {copied ? "✓ Calculation Report Copied!" : "📋 Copy Calculation Summary"}
              </button>

              <Link
                href={`/inquiries/talk-to-engineer?machine=aba-three-layer-blown-film-line&output=${outputKgH}&width=${flatWidth}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-teal)] px-4 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-black font-bold hover:brightness-110 transition-all shadow-lg shadow-[var(--brand-teal)]/20"
              >
                <span>Request Custom Machine Quote ({outputKgH} kg/h) →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Equipment Recommendations */}
      <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-8 space-y-6" data-reveal>
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--brand-teal)]">Recommended Machinery</span>
          <h2 className="text-2xl font-bold text-white">Recommended Ashal Extrusion & Converting Lines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Link
            href="/products/film-blowing-machines/aba-three-layer-blown-film-line"
            className="group flex flex-col rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] p-5 hover:border-[var(--brand-teal)]/50 transition-all"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--brand-teal)] mb-2 font-semibold">ABA 3-Layer Series</span>
            <h3 className="font-bold text-white text-lg group-hover:text-[var(--brand-teal)] transition-colors mb-2">
              ABA Three-Layer Co-Extrusion Blown Film Line
            </h3>
            <p className="text-xs text-[var(--ink-60)] leading-relaxed mb-4 flex-1">
              Ideal for processing up to 70% recycled resin or CaCO3 in core layer B while keeping virgin outer surfaces.
            </p>
            <div className="font-mono text-xs text-[var(--brand-teal)] font-semibold flex items-center gap-1">
              <span>View Machine Specs</span>
              <span>→</span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            href="/products/film-blowing-machines/abcde-2200-five-layer-co-extrusion-line"
            className="group flex flex-col rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] p-5 hover:border-[var(--brand-teal)]/50 transition-all"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--brand-teal)] mb-2 font-semibold">High Barrier 5-Layer</span>
            <h3 className="font-bold text-white text-lg group-hover:text-[var(--brand-teal)] transition-colors mb-2">
              ABCDE-2200 Five-Layer Co-Extrusion Line
            </h3>
            <p className="text-xs text-[var(--ink-60)] leading-relaxed mb-4 flex-1">
              Designed for high-output barrier film (EVOH/Nylon) applications up to 400 kg/h with automatic gauge control.
            </p>
            <div className="font-mono text-xs text-[var(--brand-teal)] font-semibold flex items-center gap-1">
              <span>View Machine Specs</span>
              <span>→</span>
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            href="/products/bag-making-machines/t-pro-multi-lane-heat-seal-bag-machine"
            className="group flex flex-col rounded-xl border border-[var(--bg-line)] bg-[var(--bg-base)] p-5 hover:border-[var(--brand-teal)]/50 transition-all"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--brand-teal)] mb-2 font-semibold">Converting & Bag Making</span>
            <h3 className="font-bold text-white text-lg group-hover:text-[var(--brand-teal)] transition-colors mb-2">
              T-PRO Multi-Lane Heat-Seal Bag Machine
            </h3>
            <p className="text-xs text-[var(--ink-60)] leading-relaxed mb-4 flex-1">
              High-speed converter operating up to 600 pcs/min with 100% support for compostable PBAT+PLA bioplastic films.
            </p>
            <div className="font-mono text-xs text-[var(--brand-teal)] font-semibold flex items-center gap-1">
              <span>View Machine Specs</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
