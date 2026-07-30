import { chromium } from "playwright";
const url = process.argv[2];
const out = process.argv[3];
const width = Number(process.argv[4] || 1440);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 1000 } });
await page.goto(url, { waitUntil: "load", timeout: 45000 });
await page.waitForTimeout(1000);
// scroll through the whole page to trigger IntersectionObserver reveals
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 600) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("saved", out);
