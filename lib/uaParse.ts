export interface ParsedUA {
  browser: string;
  os: string;
  device: "mobile" | "tablet" | "desktop";
}

/** Minimal regex-based UA parser — good enough for admin analytics, no dependency. */
export function parseUserAgent(ua: string): ParsedUA {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\//.test(ua) ? "Opera" :
    /Chrome\//.test(ua) && !/Chromium/.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) && /Version\//.test(ua) ? "Safari" :
    "Other";

  const os =
    /Windows/.test(ua) ? "Windows" :
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /Linux/.test(ua) ? "Linux" :
    "Other";

  const device: ParsedUA["device"] =
    /iPad|Tablet/.test(ua) ? "tablet" :
    /Mobile|iPhone|Android/.test(ua) ? "mobile" :
    "desktop";

  return { browser, os, device };
}
