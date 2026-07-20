import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:3342/about", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.screenshot({ path: ".scratch19/mobile-current.png" });
await page.screenshot({ path: ".scratch19/mobile-current-full.png", fullPage: true });
await browser.close();
