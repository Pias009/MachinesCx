"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/track";

/** Mounted once in app/[locale]/layout.tsx. Silently records page visits
 *  (path + time spent) for the admin analytics dashboard — no UI, no
 *  visible effect on the page. */
export default function VisitorTracker() {
  const pathname = usePathname() ?? "/";
  const pathRef = useRef(pathname);
  const enteredAtRef = useRef(Date.now());
  const initedRef = useRef(false);

  // fire-and-forget "session started here" ping — captures landing page,
  // referrer, geo (server-side) without yet knowing how long they'll stay
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    trackPageview(pathname, undefined, {
      referrer: document.referrer || "",
      locale: document.documentElement.lang,
      source: sessionStorage.getItem("cx_source") || "",
    });
  }, [pathname]);

  // client-side route change (App Router doesn't unload the page) — record
  // the duration spent on the page we just left
  useEffect(() => {
    if (pathRef.current === pathname) return;
    const prevPath = pathRef.current;
    const durationMs = Date.now() - enteredAtRef.current;
    trackPageview(prevPath, durationMs);
    pathRef.current = pathname;
    enteredAtRef.current = Date.now();
  }, [pathname]);

  // tab hidden / real navigation away — flush the in-progress page's duration.
  // A real unload typically fires both visibilitychange->hidden AND pagehide
  // back to back; resetting enteredAtRef after every flush (instead of a
  // one-shot guard) means a same-tick second flush measures ~0ms and gets
  // dropped by the threshold below, instead of re-sending the same span twice.
  useEffect(() => {
    function flush() {
      const durationMs = Date.now() - enteredAtRef.current;
      if (durationMs < 200) return;
      trackPageview(pathRef.current, durationMs);
      enteredAtRef.current = Date.now();
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") flush();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
