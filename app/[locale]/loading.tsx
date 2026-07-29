export default function Loading() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg-base)",
      fontFamily: "var(--ff-mono)", fontSize: "0.75rem",
      letterSpacing: "0.12em", textTransform: "uppercase",
      color: "var(--ink-35)",
    }}>
      Loading…
    </div>
  );
}
