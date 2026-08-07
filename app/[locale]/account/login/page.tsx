"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, ArrowLeft } from "lucide-react";

function LoginInner() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const expired = searchParams?.get("error") === "expired";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || !email.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="acc-page">
      <div className="acc-card">
        <Link href="/" className="acc-back">
          <ArrowLeft size={14} /> Back to site
        </Link>

        <div className="acc-icon"><Mail size={22} /></div>
        <h1 className="acc-title">Access your account</h1>

        {status === "sent" ? (
          <p className="acc-sub">
            If <strong>{email}</strong> has any inquiries with us, we&apos;ve sent a login link — check your inbox. The link expires in 20 minutes.
          </p>
        ) : (
          <>
            <p className="acc-sub">
              Enter the email you used when submitting an inquiry, and we&apos;ll send you a link to view its status and any replies — no password needed.
            </p>
            {expired && <p className="acc-error">That login link expired or was invalid — request a new one below.</p>}
            <form onSubmit={submit} className="acc-form">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status === "sending"}
              />
              <button type="submit" disabled={status === "sending" || !email.trim()}>
                {status === "sending" ? "Sending…" : "Send me a login link"}
              </button>
            </form>
            {status === "error" && <p className="acc-error">Something went wrong — try again in a moment.</p>}
          </>
        )}
      </div>

      <style jsx>{`
        .acc-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 130px 1.2rem 2rem; background: var(--bg-base, var(--bg-surface));
        }
        .acc-card {
          width: min(420px, 100%);
          background: var(--bg-surface); border: 1px solid var(--bg-line);
          border-radius: 18px; padding: 2rem 1.8rem;
          font-family: var(--ff-body), system-ui, sans-serif;
        }
        .acc-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; font-weight: 600; color: var(--ink-35);
          text-decoration: none; margin-bottom: 1.6rem;
        }
        .acc-back:hover { color: var(--brand-teal); }
        .acc-icon {
          width: 46px; height: 46px; border-radius: 12px;
          background: rgba(43,191,179,0.13); color: var(--brand-teal);
          display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
        }
        .acc-title {
          font-family: var(--ff-display); font-size: 1.6rem; color: var(--ink); margin: 0 0 0.7rem;
        }
        .acc-sub { font-size: 0.92rem; line-height: 1.6; color: var(--ink-35); margin: 0 0 1.3rem; }
        .acc-sub strong { color: var(--ink); }
        .acc-error { font-size: 0.85rem; color: #e11d48; margin: 0 0 1rem; }
        .acc-form { display: flex; flex-direction: column; gap: 0.7rem; }
        .acc-form input {
          padding: 0.75rem 0.9rem; border-radius: 10px;
          background: var(--bg-raise); border: 1px solid var(--bg-line);
          color: var(--ink); font-family: inherit; font-size: 0.95rem; outline: none;
        }
        .acc-form input::placeholder { color: var(--ink-35); }
        .acc-form button {
          padding: 0.75rem 0.9rem; border-radius: 10px; cursor: pointer;
          background: var(--brand-teal); color: #06110f; border: none;
          font-family: inherit; font-size: 0.92rem; font-weight: 700;
          transition: opacity 0.15s;
        }
        .acc-form button:disabled { opacity: 0.5; cursor: default; }
        .acc-form button:not(:disabled):hover { opacity: 0.88; }
      `}</style>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-surface)" }} />}>
      <LoginInner />
    </Suspense>
  );
}
