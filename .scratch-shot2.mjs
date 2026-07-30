import { chromium } from "playwright";

const url = process.argv[2];
const out = process.argv[3];
const width = Number(process.argv[4] || 1440);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 1000 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push("PAGEERROR: " + err.message));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: out, fullPage: true });
console.log("errors:", JSON.stringify(errors, null, 2));
await browser.close();
console.log("saved", out);
