import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations Console",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-admin style={{ minHeight: "100vh", background: "#070f0e" }}>
      {children}
    </div>
  );
}
