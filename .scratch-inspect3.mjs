import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3334/products/film-blowing/abcde-2200", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const sectionBox = await page.locator('section').first().boundingBox();
console.log("first section box:", sectionBox);
const style = await page.locator('section').first().evaluate(el => {
  const cs = getComputedStyle(el);
  return { paddingTop: cs.paddingTop, position: cs.position, top: cs.top };
});
console.log("first section computed style:", style);
