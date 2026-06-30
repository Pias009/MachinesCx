import type { Metadata } from "next";
import Link from "next/link";
import AetherBtn from "@/components/AetherBtn";

export const metadata: Metadata = {
  title: "About — Wenzhou Ashal Innomach Technology",
  description:
    "Founded in 2008 in Wenzhou, Ashal Innomach designs and builds blown-film lines, bag-making converters and recycling lines shipped to 60+ countries.",
};

const STATS = [
  { value: "2008",  label: "Founded" },
  { value: "60+",   label: "Countries served" },
  { value: "400",   label: "kg/h max output" },
  { value: "18+",   label: "Machine families" },
];

const TIMELINE = [
  { year: "2008", event: "Company founded in Wenzhou, Zhejiang. First single-layer blown-film line rolls off the floor." },
  { year: "2011", event: "ABA three-layer co-extrusion line introduced. First export orders to Southeast Asia." },
  { year: "2014", event: "Bag-making division launched with the F-PRO bottom-seal converter." },
  { year: "2017", event: "ABC multi-layer line certified for PBAT+PLA biodegradable resin. European CE marking achieved." },
  { year: "2019", event: "CX recycling and pelletizing line released. Factory floor expanded to 12,000 m²." },
  { year: "2022", event: "Five-layer ABCDE-2200 enters development. Sales offices opened in Germany and Vietnam." },
  { year: "2025", event: "ABCDE-2200 begins shipping. RGB roll-bag machine updated with motorised width adjustment." },
];

const VALUES = [
  {
    head: "Engineering first",
    body: "Every machine starts on the drawing board, not the sales brochure. We over-engineer where it matters — drive trains, die heads, frame rigidity — and simplify everything else.",
  },
  {
    head: "Long-term support",
    body: "We supply spare parts and provide remote process support for every machine we have ever built. A ten-year-old line deserves the same attention as a new one.",
  },
  {
    head: "Material agnostic",
    body: "Our lines run LDPE, LLDPE, HDPE, PP, PBAT+PLA and blends. We do not design for one resin family and leave the rest as an afterthought.",
  },
  {
    head: "Factory transparency",
    body: "Buyers are welcome on the production floor at any stage of a build. We encourage factory acceptance tests and third-party inspection.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <div style={{
        background: "var(--canvas-bg)",
        borderBottom: "1px solid var(--line)",
        paddingTop: "clamp(6rem,12vw,10rem)",
        paddingBottom: "clamp(4rem,8vw,6rem)",
        backgroundImage:
          "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)" }}>
          <span className="eyebrow" style={{ marginBottom: "1.5rem" }}>About us</span>
          <h1 style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(3.5rem,9vw,8rem)",
            lineHeight: 0.9, color: "var(--slate)",
            letterSpacing: "0.01em", maxWidth: "14ch",
          }}>
            Built in Wenzhou.<br />
            <span style={{ color: "var(--brand-red)" }}>Shipped worldwide.</span>
          </h1>
          <p style={{
            fontFamily: "var(--ff-body)", fontSize: "1.1rem", fontWeight: 400,
            color: "var(--slate-60)", maxWidth: "52ch",
            lineHeight: 1.78, marginTop: "2rem",
          }}>
            Wenzhou Ashal Innomach Technology designs and manufactures blown-film lines,
            bag-making converters, and recycling systems for polymer film processors
            across six continents. We have been doing this since 2008.
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{
        background: "var(--slate)",
        padding: "clamp(2.5rem,5vw,4rem) clamp(1.25rem,4vw,3rem)",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "1px",
          background: "rgba(255,255,255,0.08)",
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              padding: "2rem 1.5rem",
              background: "var(--slate)",
            }}>
              <b style={{
                fontFamily: "var(--ff-display)",
                fontSize: "clamp(2.5rem,5vw,4rem)",
                color: "var(--brand-red)", display: "block", lineHeight: 1,
              }}>{s.value}</b>
              <span style={{
                fontFamily: "var(--ff-mono)", fontSize: "0.65rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)", display: "block", marginTop: "0.5rem",
              }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story ── */}
      <div style={{
        background: "var(--canvas-bg)",
        borderBottom: "1px solid var(--line)",
        padding: "clamp(4rem,8vw,7rem) clamp(1.25rem,4vw,3rem)",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "clamp(3rem,6vw,7rem)", alignItems: "start",
        }}>
          <div>
            <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>Our story</span>
            <h2 style={{
              fontFamily: "var(--ff-display)",
              fontSize: "clamp(2rem,4vw,3.2rem)",
              lineHeight: 0.95, color: "var(--slate)", marginBottom: "1.5rem",
            }}>
              From one line to a full machinery portfolio
            </h2>
            <p style={{
              fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 400,
              color: "var(--slate-60)", lineHeight: 1.8, marginBottom: "1.25rem",
            }}>
              Ashal Innomach started with a single-layer blown-film line and a small team
              of mechanical engineers who had spent the previous decade on the shop floors
              of Wenzhou's established machinery makers. The founding premise was simple:
              build fewer machine types, but build them better.
            </p>
            <p style={{
              fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 400,
              color: "var(--slate-60)", lineHeight: 1.8, marginBottom: "1.25rem",
            }}>
              Today we produce sixteen machine families across blown film, bag making, and
              recycling. Every product is designed in-house, fabricated in our 12,000 m²
              Wenzhou facility, and tested before it ships.
            </p>
            <p style={{
              fontFamily: "var(--ff-body)", fontSize: "1rem", fontWeight: 400,
              color: "var(--slate-60)", lineHeight: 1.8,
            }}>
              Our customers range from single-line converters running one shift a day to
              multi-site groups running 24/7 on four continents. The machine has to work
              the same way for both.
            </p>
          </div>

          {/* Timeline */}
          <div>
            <span className="eyebrow" style={{ marginBottom: "1.5rem" }}>Timeline</span>
            <div style={{ position: "relative", paddingLeft: "1.5rem",
              borderLeft: "1px solid var(--line)" }}>
              {TIMELINE.map((t, i) => (
                <div key={t.year} style={{
                  paddingBottom: i < TIMELINE.length - 1 ? "1.75rem" : 0,
                  position: "relative",
                }}>
                  {/* dot */}
                  <div style={{
                    position: "absolute", left: "-1.75rem", top: "0.3rem",
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: i === TIMELINE.length - 1 ? "var(--brand-red)" : "var(--line)",
                    border: "2px solid var(--canvas-bg)",
                    outline: `1px solid ${i === TIMELINE.length - 1 ? "var(--brand-red)" : "var(--slate-30)"}`,
                  }} />
                  <span style={{
                    fontFamily: "var(--ff-mono)", fontSize: "0.62rem",
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: "var(--brand-red)", display: "block", marginBottom: "0.25rem",
                  }}>{t.year}</span>
                  <p style={{
                    fontFamily: "var(--ff-body)", fontSize: "0.88rem", fontWeight: 400,
                    color: "var(--slate-60)", lineHeight: 1.65, margin: 0,
                  }}>{t.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--line)",
        padding: "clamp(4rem,8vw,7rem) clamp(1.25rem,4vw,3rem)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>How we work</span>
          <h2 style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(2rem,4vw,3.2rem)",
            lineHeight: 0.95, color: "var(--slate)",
            marginBottom: "clamp(2rem,4vw,3.5rem)",
          }}>
            Four things we never compromise on
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: "1px", background: "var(--line)",
            border: "1px solid var(--line)",
          }}>
            {VALUES.map((v) => (
              <div key={v.head} style={{
                background: "var(--surface)",
                padding: "2rem 1.75rem",
              }}>
                <div style={{
                  width: "2rem", height: "2px",
                  background: "var(--brand-red)", marginBottom: "1.25rem",
                }} />
                <h3 style={{
                  fontFamily: "var(--ff-display)",
                  fontSize: "1.3rem", color: "var(--slate)",
                  letterSpacing: "0.01em", marginBottom: "0.75rem",
                }}>{v.head}</h3>
                <p style={{
                  fontFamily: "var(--ff-body)", fontSize: "0.88rem", fontWeight: 400,
                  color: "var(--slate-60)", lineHeight: 1.72,
                }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{
        background: "var(--canvas-bg)",
        padding: "clamp(4rem,8vw,6rem) clamp(1.25rem,4vw,3rem)",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: "2rem", flexWrap: "wrap",
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <h2 style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(2rem,4vw,3.2rem)",
            lineHeight: 0.95, color: "var(--slate)",
          }}>
            Ready to talk about your next line?
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <AetherBtn><Link href="/contact">Request a quote →</Link></AetherBtn>
            <Link href="/products" className="btn btn--ghost">Browse machines</Link>
          </div>
        </div>
      </div>
    </>
  );
}
