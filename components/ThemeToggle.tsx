"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read saved preference on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setLight(true);
      document.documentElement.setAttribute("data-theme", "light");
    }
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

  if (!mounted) return null;

  return (
    <>
      <style suppressHydrationWarning>{`
        .tt-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer; flex-shrink: 0;
          transition: background .18s, border-color .18s;
          position: relative; overflow: hidden;
        }
        .tt-btn:hover {
          background: rgba(43,191,179,0.12);
          border-color: var(--brand-teal);
        }
        .tt-icon {
          position: absolute;
          transition: opacity .25s ease, transform .3s ease;
          color: rgba(255,255,255,0.75);
          display: flex; align-items: center; justify-content: center;
        }
        .tt-icon--sun  { opacity: 0; transform: rotate(-90deg) scale(0.7); }
        .tt-icon--moon { opacity: 1; transform: rotate(0deg) scale(1); }
        .tt-btn--light .tt-icon--sun  { opacity: 1; transform: rotate(0deg) scale(1); color: #0d2220; }
        .tt-btn--light .tt-icon--moon { opacity: 0; transform: rotate(90deg) scale(0.7); }
        .tt-btn--light {
          background: rgba(43,191,179,0.12);
          border-color: rgba(43,191,179,0.4);
        }
        .tt-btn--light:hover { background: rgba(43,191,179,0.2); }
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
