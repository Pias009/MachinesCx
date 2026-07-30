import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3335/products/film-blowing/abcde-2200", { waitUntil: "load", timeout: 45000 });
await page.waitForTimeout(1000);
await page.locator('button[aria-label="Switch to dark mode"]').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 1440, height: 1250 } });
await browser.close();
