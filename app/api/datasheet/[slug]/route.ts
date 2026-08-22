import { NextRequest, NextResponse } from "next/server";
import { getMachineProductBySlug, getSiteMetadata } from "@/lib/machinesData";
import { families } from "@/lib/products";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const mProduct = getMachineProductBySlug(slug);
  const family = families.find((f) => f.slug === slug);
  const site = getSiteMetadata();

  if (!mProduct && !family) {
    return NextResponse.json({ error: "Product datasheet not found" }, { status: 404 });
  }

  const name = mProduct?.name || family?.name || "Industrial Machine";
  const model = mProduct?.model || family?.series || slug;
  const description = mProduct?.metaDescription || family?.tagline || "";
  const specs = mProduct?.specs || (family?.specs ? Object.fromEntries(family.specs.map(s => [s.label, s.values[0]])) : {});
  const features = mProduct?.features || family?.seoData?.keyInnovations?.map(i => i.description) || [];
  const faqs = mProduct?.faqs || family?.seoData?.faqs || [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name} - Technical Datasheet (PDF) | Ashal Innomach</title>
  <meta name="description" content="Official Engineering Specifications & Technical Datasheet for ${name} (Model: ${model}). Wenzhou Ashal Innomach Technology Co., Ltd.">
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 11pt;
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #0d9488;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 9pt;
      color: #0d9488;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .doc-badge {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 4px 10px;
      font-size: 8pt;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .title-block {
      margin-bottom: 20px;
      background: #f8fafc;
      padding: 16px;
      border-left: 4px solid #0d9488;
      border-radius: 4px;
    }
    .model-tag {
      font-size: 9pt;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .product-name {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0;
    }
    .product-desc {
      font-size: 10pt;
      color: #475569;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin: 20px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .specs-table th, .specs-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
      font-size: 9.5pt;
    }
    .specs-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      width: 35%;
    }
    .specs-table td {
      color: #0f172a;
      font-weight: 600;
    }
    .features-list {
      list-style: none;
      margin-bottom: 20px;
    }
    .features-list li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 6px;
      font-size: 9.5pt;
      color: #334155;
    }
    .features-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #0d9488;
      font-weight: bold;
    }
    .faq-block {
      margin-bottom: 12px;
    }
    .faq-q {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
    }
    .faq-a {
      font-size: 9pt;
      color: #475569;
      margin-top: 2px;
    }
    .footer {
      margin-top: 30px;
      border-top: 2px solid #0d9488;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #64748b;
    }
    .actions {
      margin-bottom: 20px;
      text-align: right;
    }
    .print-btn {
      background: #0d9488;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 10pt;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      .actions { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>

  <div class="actions">
    <button onclick="window.print()" class="print-btn">🖨️ Save / Print PDF Datasheet</button>
  </div>

  <div class="header">
    <div>
      <div class="brand-title">${site.siteName}</div>
      <div class="brand-sub">Factory Technical Specification Datasheet</div>
    </div>
    <div class="doc-badge">Official Specification Sheet</div>
  </div>

  <div class="title-block">
    <div class="model-tag">Model Series: ${model}</div>
    <h1 class="product-name">${name}</h1>
    <p class="product-desc">${description}</p>
  </div>

  <div class="section-title">Technical Specifications</div>
  <table class="specs-table">
    <tbody>
      ${Object.entries(specs)
        .map(
          ([k, v]) => `
        <tr>
          <th>${k}</th>
          <td>${v}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  ${
    features.length > 0
      ? `
  <div class="section-title">Key Engineering Features</div>
  <ul class="features-list">
    ${features.map((f) => `<li>${f}</li>`).join("")}
  </ul>
  `
      : ""
  }

  ${
    faqs.length > 0
      ? `
  <div class="section-title">Engineering Q&A & Performance Guidance</div>
  ${faqs
    .map(
      (faq) => `
    <div class="faq-block">
      <div class="faq-q">Q: ${faq.question}</div>
      <div class="faq-a">A: ${faq.answer}</div>
    </div>
  `
    )
    .join("")}
  `
      : ""
  }

  <div class="footer">
    <div>
      <strong>${site.siteName}</strong><br>
      Location: ${site.location}<br>
      Website: <a href="${site.siteUrl}" style="color:#0d9488;">${site.siteUrl}</a>
    </div>
    <div style="text-align: right;">
      Direct Sales & Engineering:<br>
      Phone: ${site.phone}<br>
      Email: ${site.contactEmail}
    </div>
  </div>

  <script>
    // Auto-trigger print dialog if requested with ?print=1
    if (new URLSearchParams(window.location.search).get('print') === '1') {
      window.addEventListener('load', function() { window.print(); });
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
