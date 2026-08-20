"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // default theme is light — matches the data-theme="light" set on <html> in layout.tsx
  const [light, setLight] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Read saved preference on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setLight(false);
      document.documentElement.removeAttribute("data-theme");
    } else if (saved === "light") {
      setLight(true);
      document.documentElement.setAttribute("data-theme", "light");
    }
    // no saved value → keep the light default already set on <html>
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  };

  if (!mounted) {
    return (
      <button className="tt-btn" aria-hidden="true" style={{ opacity: 0.5 }}>
        <span className="tt-icon tt-icon--sun" style={{ opacity: 1, transform: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5"/>
          </svg>
        </span>
      </button>
    );
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .tt-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 10px;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative; overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .tt-btn:hover {
          background: rgba(43, 191, 179, 0.22);
          border-color: rgba(43, 191, 179, 0.45);
          box-shadow: 0 0 12px rgba(43, 191, 179, 0.3);
        }
        .tt-icon {
          position: absolute;
          transition: opacity 0.25s ease, transform 0.3s ease;
          color: rgba(255, 255, 255, 0.92);
          display: flex; align-items: center; justify-content: center;
        }
        .tt-icon--sun  { opacity: 0; transform: rotate(-90deg) scale(0.7); }
        .tt-icon--moon { opacity: 1; transform: rotate(0deg) scale(1); }

        /* Light mode */
        [data-theme="light"] .tt-btn {
          background: rgba(13, 34, 32, 0.06);
          border: 1px solid rgba(13, 34, 32, 0.14);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        [data-theme="light"] .tt-btn:hover {
          background: rgba(43, 191, 179, 0.18);
          border-color: rgba(43, 191, 179, 0.45);
        }
        [data-theme="light"] .tt-btn .tt-icon--sun  { opacity: 1; transform: rotate(0deg) scale(1); color: #0d2220; }
        [data-theme="light"] .tt-btn .tt-icon--moon { opacity: 0; transform: rotate(90deg) scale(0.7); }
      `}</style>

      <button
        className={`tt-btn${light ? " tt-btn--light" : ""}`}
        onClick={toggle}
        aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
        title={light ? "Dark mode" : "Light mode"}
      >
        {/* Sun icon */}
        <span className="tt-icon tt-icon--sun">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </span>
        {/* Moon icon */}
        <span className="tt-icon tt-icon--moon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </span>
      </button>
    </>
  );
}
