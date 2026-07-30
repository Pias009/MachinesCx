import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3335/products/film-blowing/abcde-2200", { waitUntil: "load", timeout: 45000 });
await page.evaluate(() => { localStorage.setItem("theme", "dark"); });
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(2000);
await page.screenshot({ path: process.argv[2] });
await browser.close();
