const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Ashal Innomach Full Project Diagnostic...\n');

let errorCount = 0;
let warnCount = 0;

function logPass(msg) { console.log(`  ✅ PASS: ${msg}`); }
function logFail(msg) { console.error(`  ❌ FAIL: ${msg}`); errorCount++; }
function logWarn(msg) { console.warn(`  ⚠️ WARN: ${msg}`); warnCount++; }

// 1. Validate machines.json
const machinesPath = path.join(process.cwd(), 'app/data/machines.json');
if (!fs.existsSync(machinesPath)) {
  logFail('app/data/machines.json does not exist');
} else {
  try {
    const data = JSON.parse(fs.readFileSync(machinesPath, 'utf8'));
    logPass(`Loaded machines.json with ${data.products ? data.products.length : 0} products and ${data.categories ? data.categories.length : 0} categories`);

    if (!data.siteMetadata || !data.siteMetadata.siteUrl) {
      logFail('siteMetadata.siteUrl missing in machines.json');
    }

    const categorySlugs = new Set((data.categories || []).map(c => c.slug));
    const productSlugs = new Set();

    (data.products || []).forEach((prod, i) => {
      if (!prod.slug) logFail(`Product #${i} missing slug`);
      if (productSlugs.has(prod.slug)) logFail(`Duplicate product slug: ${prod.slug}`);
      productSlugs.add(prod.slug);

      if (!prod.category || !categorySlugs.has(prod.category)) {
        logFail(`Product ${prod.slug} references invalid category: "${prod.category}"`);
      }
      if (!prod.specs || Object.keys(prod.specs).length === 0) {
        logWarn(`Product ${prod.slug} has no technical specs`);
      }
      if (!prod.seoTitle || !prod.metaDescription) {
        logFail(`Product ${prod.slug} missing seoTitle or metaDescription`);
      }
      if (prod.faqs && !Array.isArray(prod.faqs)) {
        logFail(`Product ${prod.slug} faqs must be an array`);
      }
    });
  } catch (err) {
    logFail(`JSON Syntax Error in machines.json: ${err.message}`);
  }
}

// 2. Validate news/articles data
let newsPath = path.join(process.cwd(), 'app/data/news.json');
if (!fs.existsSync(newsPath)) newsPath = path.join(process.cwd(), 'data/news.json');
if (!fs.existsSync(newsPath)) newsPath = path.join(process.cwd(), 'app/data/articles.json');

if (!fs.existsSync(newsPath)) {
  logWarn('No news.json or articles.json found');
} else {
  try {
    const rawNews = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
    const articles = Array.isArray(rawNews) ? rawNews : (rawNews.articles || []);
    logPass(`Loaded news data with ${articles.length} articles`);

    const machinesData = JSON.parse(fs.readFileSync(machinesPath, 'utf8'));
    const validProductSlugs = new Set((machinesData.products || []).map(p => p.slug));

    articles.forEach((art) => {
      if (!art.slug || !art.title) logFail(`Article missing slug or title: ${art.slug || 'unknown'}`);
      if (Array.isArray(art.relatedMachineSlugs)) {
        art.relatedMachineSlugs.forEach((slug) => {
          if (!validProductSlugs.has(slug)) {
            logFail(`Article "${art.slug}" references non-existent machine slug: "${slug}"`);
          }
        });
      }
    });
  } catch (err) {
    logFail(`JSON Syntax Error in news data: ${err.message}`);
  }
}

// 3. Validate sitemap & robots files
const sitemapPath = path.join(process.cwd(), 'app/sitemap.ts');
if (fs.existsSync(sitemapPath)) {
  logPass('app/sitemap.ts exists');
} else {
  logFail('app/sitemap.ts missing');
}

const robotsPath = path.join(process.cwd(), 'app/robots.ts');
if (fs.existsSync(robotsPath)) {
  logPass('app/robots.ts exists');
} else {
  logFail('app/robots.ts missing');
}

// 4. Validate Calculator Route
const calcPath = path.join(process.cwd(), 'app/tools/extrusion-calculator/page.tsx');
const calcLocalePath = path.join(process.cwd(), 'app/[locale]/tools/extrusion-calculator/page.tsx');
if (fs.existsSync(calcPath) || fs.existsSync(calcLocalePath)) {
  logPass('Extrusion calculator route page exists');
} else {
  logFail('Extrusion calculator route missing at /tools/extrusion-calculator');
}

console.log('\n----------------------------------------');
if (errorCount === 0) {
  console.log(`🎉 ALL CHECKS PASSED with ${warnCount} warnings. Ready for build verification!`);
} else {
  console.error(`💥 FOUND ${errorCount} ERRORS that need immediate fixing.`);
  process.exit(1);
}
