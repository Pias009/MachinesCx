#!/usr/bin/env node
// Minimal chromium-cli-alike for this project. Reads newline-delimited
// commands from stdin, drives one headless Chromium page via Playwright
// (already a devDependency here), writes screenshots to ./shots/.
//
// Usage:
//   node driver.mjs <<'EOF'
//   nav http://localhost:3333/
//   wait-for text=Ashal
//   screenshot home
//   click text=About
//   wait-for text=Company Profile
//   screenshot about
//   console-errors
//   EOF
//
// Commands:
//   nav <url>                    goto a URL, waits for load
//   wait-for text=<substr>       poll up to 15s for text to appear
//   wait-for sel=<css>           poll up to 15s for a selector to appear
//   click <css-selector>         click, or click text=<substr>
//   fill <css-selector> <value>  fill an input (fires React onChange)
//   press <key>                  press a key (Enter, Escape, ...)
//   screenshot [name]            save shots/<name-or-timestamp>.png
//   eval <js>                    run page.evaluate(js), print result
//   console-errors               print captured console.error calls
//   viewport <w> <h>             resize viewport (e.g. mobile testing)
//   theme <dark|light>           set data-theme on <html>
//   sleep <ms>                   fixed wait (avoid; prefer wait-for)
//   quit                         close browser and exit

import { chromium } from "playwright";
import { createInterface } from "node:readline";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const shotsDir = join(process.cwd(), "shots");
mkdirSync(shotsDir, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

async function waitForText(substr, timeout = 15000) {
  await page.waitForFunction(
    (t) => document.body && document.body.innerText.includes(t),
    substr,
    { timeout }
  );
}

const rl = createInterface({ input: process.stdin, terminal: false });

for await (const raw of rl) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const [cmd, ...rest] = line.split(" ");
  const arg = rest.join(" ");
  try {
    switch (cmd) {
      case "nav": {
        await page.goto(arg, { waitUntil: "networkidle", timeout: 30000 });
        console.log(`OK nav ${arg}`);
        break;
      }
      case "wait-for": {
        if (arg.startsWith("text=")) {
          await waitForText(arg.slice(5));
        } else if (arg.startsWith("sel=")) {
          await page.waitForSelector(arg.slice(4), { timeout: 15000 });
        } else {
          await page.waitForSelector(arg, { timeout: 15000 });
        }
        console.log(`OK wait-for ${arg}`);
        break;
      }
      case "click": {
        if (arg.startsWith("text=")) {
          await page.getByText(arg.slice(5)).first().click();
        } else {
          await page.click(arg);
        }
        console.log(`OK click ${arg}`);
        break;
      }
      case "fill": {
        const sp = arg.indexOf(" ");
        const sel = arg.slice(0, sp);
        const val = arg.slice(sp + 1);
        await page.fill(sel, val);
        console.log(`OK fill ${sel}`);
        break;
      }
      case "press": {
        await page.keyboard.press(arg);
        console.log(`OK press ${arg}`);
        break;
      }
      case "screenshot": {
        const name = arg || String(Date.now());
        const path = join(shotsDir, `${name}.png`);
        await page.screenshot({ path, fullPage: false });
        console.log(`OK screenshot ${path}`);
        break;
      }
      case "eval": {
        const result = await page.evaluate(arg);
        console.log(`OK eval ${JSON.stringify(result)}`);
        break;
      }
      case "console-errors": {
        console.log(
          consoleErrors.length
            ? `ERRORS:\n${consoleErrors.join("\n")}`
            : "OK no console errors"
        );
        break;
      }
      case "viewport": {
        const [w, h] = rest.map(Number);
        await page.setViewportSize({ width: w, height: h });
        console.log(`OK viewport ${w}x${h}`);
        break;
      }
      case "theme": {
        await page.evaluate(
          (t) => document.documentElement.setAttribute("data-theme", t),
          arg
        );
        console.log(`OK theme ${arg}`);
        break;
      }
      case "sleep": {
        await new Promise((r) => setTimeout(r, Number(arg)));
        console.log(`OK sleep ${arg}`);
        break;
      }
      case "quit": {
        await browser.close();
        process.exit(0);
      }
      default:
        console.log(`ERR unknown command: ${cmd}`);
    }
  } catch (err) {
    console.log(`ERR ${cmd}: ${err.message}`);
  }
}

await browser.close();
