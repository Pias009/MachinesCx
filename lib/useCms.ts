"use client";
import { useEffect, useState } from "react";

// Fetches live CMS content (edited from the admin panel) with a hardcoded
// fallback so the site renders instantly and never breaks if the API is down.
export function useCms<T>(section: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    let alive = true;
    fetch(`/api/content/${section}`)
      .then(r => (r.ok ? r.json() : null))
      .then(j => { if (alive && j && !j.error) setData(j as T); })
      .catch(() => { /* keep fallback */ });
    return () => { alive = false; };
  }, [section]);

  return data;
}
