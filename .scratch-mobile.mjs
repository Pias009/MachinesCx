import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:3335/products/film-blowing/abcde-2200", { waitUntil: "load", timeout: 45000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 390, height: 1600 } });
await browser.close();
