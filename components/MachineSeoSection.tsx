"use client";

import { useState } from "react";
import type { MachineSeoData } from "@/lib/products";

export default function MachineSeoSection({ seoData, machineName }: { seoData?: MachineSeoData; machineName: string }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!seoData) return null;

  return (
    <div className="mt-14 space-y-12 border-t border-[var(--bg-line)] pt-12" data-reveal>
      {/* Header Badge & Title */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-teal)]/30 bg-[var(--brand-teal)]/10 px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--brand-teal)]">
          <span>SEO & AEO Technical Report</span>
          <span>•</span>
          <span>{seoData.wordCount} Words Comprehensive Analysis</span>
        </div>
        <h2 className="mt-4 text-[clamp(1.5rem,3vw,2.2rem)] font-bold leading-tight text-white" style={{ fontFamily: "var(--ff-display)" }}>
          {seoData.overviewHeading || `Engineered Overview & Technical Deep-Dive — ${machineName}`}
        </h2>
      </div>

      {/* 1. Technical Architecture */}
      <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-semibold text-[var(--brand-teal)] flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--brand-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Technical Architecture & Mechanical Design
        </h3>
        <p className="text-[0.98rem] leading-relaxed text-[var(--ink-60)]">
          {seoData.technicalArchitecture}
        </p>
      </div>

      {/* 2. Applications & Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-semibold text-[var(--brand-teal)] flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--brand-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Industrial Applications & Resin Processing
          </h3>
          <p className="text-[0.95rem] leading-relaxed text-[var(--ink-60)]">
            {seoData.applicationsAndMaterials}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-semibold text-[var(--brand-teal)] flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--brand-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V7m0 0V3m0 4h5" />
            </svg>
            Target Manufacturing Sectors
          </h3>
          <ul className="space-y-2.5">
            {seoData.targetIndustries?.map((ind, idx) => (
              <li key={idx} className="flex items-center gap-3 text-[0.9rem] text-[var(--ink-60)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-teal)]/15 text-[var(--brand-teal)] text-[0.7rem] font-bold">✓</span>
                <span>{ind}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Engineering Innovations */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Key Engineering Innovations & Quality Assurance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {seoData.keyInnovations?.map((inn, idx) => (
            <div key={idx} className="rounded-xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-5 hover:border-[var(--brand-teal)]/40 transition-colors">
              <h4 className="font-bold text-[1rem] mb-2 text-[var(--brand-teal)]">{inn.title}</h4>
              <p className="text-[0.88rem] text-[var(--ink-60)] leading-relaxed">{inn.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Utility Requirements & Maintenance Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 space-y-3">
          <h4 className="font-bold text-white text-[1rem] flex items-center gap-2">
            <span className="text-[var(--brand-teal)]">⚡</span> Installation & Utility Requirements
          </h4>
          <p className="text-[0.88rem] text-[var(--ink-60)] leading-relaxed">{seoData.utilityRequirements}</p>
        </div>

        <div className="rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 space-y-3">
          <h4 className="font-bold text-white text-[1rem] flex items-center gap-2">
            <span className="text-[var(--brand-teal)]">🛠️</span> Preventative Maintenance Protocol
          </h4>
          <p className="text-[0.88rem] text-[var(--ink-60)] leading-relaxed">{seoData.maintenanceProtocol}</p>
        </div>
      </div>

      {/* 5. GEO / AEO Frequently Asked Questions */}
      {seoData.faqs && seoData.faqs.length > 0 && (
        <div className="space-y-6 rounded-2xl border border-[var(--bg-line)] bg-[var(--bg-surface)] p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--brand-teal)]">
              Search Engine & AI Direct Answer Panel (AEO / GEO)
            </span>
            <h3 className="text-xl font-bold text-white">Frequently Asked Questions & Technical Guidance</h3>
          </div>

          <div className="divide-y divide-[var(--bg-line)]">
            {seoData.faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left font-semibold text-white text-[1rem] py-2 hover:text-[var(--brand-teal)] transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="pr-4">{faq.question}</span>
                  <span className="text-[var(--brand-teal)] text-xl font-mono shrink-0">
                    {openFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-60)] pl-3 border-l-2 border-[var(--brand-teal)]">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Commercial Buying Guide */}
      <div className="rounded-2xl border border-[var(--brand-teal)]/30 bg-gradient-to-br from-[var(--brand-teal)]/10 via-[var(--bg-surface)] to-[var(--bg-surface)] p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🏆</span> Commercial Buying Guide & Global Quality Guarantee
        </h3>
        <p className="text-[0.92rem] leading-relaxed text-[var(--ink-60)]">
          {seoData.commercialGuide}
        </p>

        <div className="flex flex-wrap gap-3 pt-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--brand-teal)]">
          <span className="rounded-md border border-[var(--brand-teal)]/30 px-3 py-1.5 bg-black/30">✓ ISO 9001:2015 Certified</span>
          <span className="rounded-md border border-[var(--brand-teal)]/30 px-3 py-1.5 bg-black/30">✓ CE Quality Standard</span>
          <span className="rounded-md border border-[var(--brand-teal)]/30 px-3 py-1.5 bg-black/30">✓ Pre-Shipment FAT Video</span>
          <span className="rounded-md border border-[var(--brand-teal)]/30 px-3 py-1.5 bg-black/30">✓ 12-Month Guarantee</span>
        </div>
      </div>
    </div>
  );
}
