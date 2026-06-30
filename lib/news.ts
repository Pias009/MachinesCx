export interface NewsArticle {
  slug: string;
  title: string;
  date: string;          // ISO "YYYY-MM-DD"
  category: string;
  excerpt: string;
  body: string;          // HTML string rendered via dangerouslySetInnerHTML
  image: string;         // /machines/... or /news/... path
  tags: string[];
  links?: { label: string; url: string }[];
}

export const articles: NewsArticle[] = [
  {
    slug: "abcde-2200-five-layer-launch",
    title: "ABCDE-2200 Five-Layer Co-extrusion Line Now Shipping",
    date: "2025-11-15",
    category: "Product Launch",
    excerpt:
      "Our flagship ABCDE-2200 reaches a new benchmark: 400 kg/h output, 2,100 mm web width, and a five-layer die head for advanced barrier film.",
    image: "/machines/abcde-2200.png",
    tags: ["Film Blowing", "Co-extrusion", "New Product"],
    links: [
      { label: "Full specification", url: "/products/film-blowing/abcde-2200" },
      { label: "Request a quote", url: "/contact" },
    ],
    body: `
      <p>Wenzhou Ashal Innomach Technology is proud to announce general availability of the <strong>ABCDE-2200</strong>, our most capable blown-film line to date. After 18 months of engineering refinement and customer trials, the machine is now shipping to buyers worldwide.</p>
      <h3>What makes it different</h3>
      <p>The ABCDE-2200 runs five independent extruder screws — each 60 mm diameter at 32:1 L/D — feeding a 500 mm spiral-mandrel die. Internal bubble cooling (IBC) keeps the frost line stable at high throughputs, while an oscillating haul-off distributes gauge variation around the roll to eliminate hard edges.</p>
      <ul>
        <li><strong>Output:</strong> up to 400 kg/h on LDPE</li>
        <li><strong>Web width:</strong> 2,100 mm lay-flat</li>
        <li><strong>Film thickness:</strong> 0.03 – 0.15 mm</li>
        <li><strong>Main motor:</strong> 55 kW × 5 servo drives</li>
        <li><strong>Total installed power:</strong> 500 kW</li>
      </ul>
      <h3>Barrier film capability</h3>
      <p>The five-layer configuration unlocks true barrier structures — PE/tie/EVOH/tie/PE — for food, medical, and agricultural applications. The die accepts temperature profiling per layer, allowing processors to run incompatible resins without cross-contamination.</p>
      <h3>Control system</h3>
      <p>A 15-inch industrial HMI with recipe storage, real-time thickness profiling via rotating sensor, and Ethernet connectivity for remote monitoring rounds out the package.</p>
      <p>Lead time for a standard build is 90 days FOB Wenzhou. Contact our sales team for configurations, pricing, and site-visit scheduling.</p>
    `,
  },
  {
    slug: "pbat-pla-biodegradable-bag-making",
    title: "Running PBAT+PLA on Heat-Seal Converters: What You Need to Know",
    date: "2025-10-03",
    category: "Technical",
    excerpt:
      "Biodegradable PBAT+PLA blends behave differently from standard PE on heat-seal bag machines. Our engineers share the setup tips that matter.",
    image: "/machines/t-pro-heatseal.png",
    tags: ["Bag Making", "Biodegradable", "Technical Guide"],
    links: [
      { label: "T-PRO heat-seal converter", url: "/products/bag-making/t-pro-heatseal" },
      { label: "Contact engineering", url: "/contact" },
    ],
    body: `
      <p>PBAT+PLA blends are increasingly specified for compostable shopping bags, produce bags, and food-service liners. Running these materials on a standard heat-seal converter requires a handful of process adjustments — ignoring them leads to weak seals, film sticking to the bar, or premature blade wear.</p>
      <h3>Sealing temperature</h3>
      <p>PBAT softens at a lower temperature than LDPE. Start with seal-bar temperature 15–20 °C below your LDPE setting and step up in 5 °C increments while watching seal peel strength. Overheating causes the film to drag on the bar and creates burn-through on thin gauges.</p>
      <h3>Dwell time</h3>
      <p>PLA raises the crystallisation temperature of the blend, which means the seal needs slightly longer dwell time to reach full strength. On the T-PRO platform, increase dwell by 10–15 % relative to LDPE at the same gauge.</p>
      <h3>Cooling bar pressure</h3>
      <p>A cooling bar opposite the seal bar is strongly recommended. Without active cooling, the seal remains soft and can peel under the tension of the haul-off. Minimum air-gap cooling: 30 mm, 0.4 bar.</p>
      <h3>Blade setup</h3>
      <p>PBAT+PLA blends are stiffer and slightly more abrasive than LDPE. Use a ceramic-coated blade and expect 15–20 % shorter blade life. Do not use a serrated blade on these materials — it creates micro-tears that propagate during use.</p>
      <h3>Line speed</h3>
      <p>Run 10–15 % slower than your LDPE baseline until you have confirmed seal strength at each station. Once dialled in, the T-PRO can reach 260 pcs/min on a 50-micron PBAT+PLA film without seal compromise.</p>
      <p>Our applications team can provide a process setup sheet specific to your film supplier's resin blend. Get in touch via the contact page.</p>
    `,
  },
  {
    slug: "cx-recycling-pelletizing-line",
    title: "CX Recycling Line: Closing the Loop on Edge Trim",
    date: "2025-09-10",
    category: "Sustainability",
    excerpt:
      "Post-industrial PE edge trim and start-up scrap can be converted back to usable pellets on-site. We look at how the CX pelletizing line fits into a zero-waste extrusion floor.",
    image: "/machines/cx-pelletizing.png",
    tags: ["Recycling", "Sustainability", "Pelletizing"],
    links: [
      { label: "CX pelletizing line specs", url: "/products/recycling/cx-pelletizing" },
    ],
    body: `
      <p>Every blown-film line generates edge trim — the narrow strips of film removed by the slitter before winding. On a 2,000 mm line running 24/7, that trim can add up to 800–1,200 kg per shift. Sending it off-site for recycling costs money and introduces supply-chain risk. The <strong>CX Recycling & Pelletizing Line</strong> brings that loop on-site.</p>
      <h3>Process overview</h3>
      <p>Edge trim and start-up scrap is fed through an agglomerator that compacts and softens the film without fully melting it. The output feeds a single-screw extruder where the material is fully plasticised, filtered through a continuous screen changer, and extruded as strands through a die plate. An underwater pelletiser cuts the strands to 3–4 mm pellets, which are dried and conveyed to a silo.</p>
      <h3>Output quality</h3>
      <p>Properly processed CX pellets are suitable for direct re-use in the inner layers of co-extruded film. MFI deviation from virgin resin is typically less than 8 % when using clean, single-resin trim. Mixed-material or printed scrap will need a compatibiliser.</p>
      <h3>Throughput</h3>
      <p>The CX line is sized at 100 or 120 kg/h, which balances with the trim output of two or three blown-film lines running simultaneously. Power draw is 75–160 kW depending on configuration.</p>
      <h3>Integration</h3>
      <p>The line can be positioned inline (trim conveyed directly from the slitter) or fed from a trim bin. Our engineers recommend a gravimetric dosing unit between the agglomerator and extruder to keep throughput stable when trim volume fluctuates.</p>
    `,
  },
  {
    slug: "abc-multilayer-wide-web",
    title: "ABC Multi-layer Line Now Available to 2,300 mm",
    date: "2025-07-22",
    category: "Product Update",
    excerpt:
      "The ABC line family has been extended to 2,300 mm lay-flat width, making it suitable for agricultural mulch film, geomembrane, and heavy-duty sacks.",
    image: "/machines/abc-multilayer-large.png",
    tags: ["Film Blowing", "Wide Web", "Product Update"],
    links: [
      { label: "ABC 1500/1800/2300 specs", url: "/products/film-blowing/abc-multilayer-large" },
    ],
    body: `
      <p>We have extended the <strong>ABC Multi-layer Line</strong> family to a maximum lay-flat width of 2,300 mm, filling the gap between our mid-range lines and the flagship ABCDE-2200. The ABC-2300 is optimised for agricultural mulch film, geomembrane liner, and industrial sacking applications where width matters more than layer count.</p>
      <h3>New model: ABC-2300</h3>
      <ul>
        <li><strong>Film width:</strong> 1,700 – 2,300 mm lay-flat</li>
        <li><strong>Output:</strong> 400 kg/h</li>
        <li><strong>Screw diameters:</strong> 75/85/75 mm</li>
        <li><strong>Main motors:</strong> 45/55/45 kW AC vector</li>
        <li><strong>Die head:</strong> 600 mm</li>
        <li><strong>Machine footprint:</strong> 10 × 10.5 × 11.5 m / 25 T</li>
      </ul>
      <h3>Oscillating haul-off</h3>
      <p>At 2,300 mm width, gauge variation management is critical. The ABC-2300 ships with a ±90° oscillating haul-off as standard. Combined with the auto-profiled die gap, this reduces cross-direction gauge variation to ± 3 % on most LDPE formulations.</p>
      <h3>Agricultural mulch film</h3>
      <p>Mulch film requires consistent width, uniform thickness, and reliable UV stabiliser distribution. The three-layer structure allows a UV-loaded skin layer over a recycled-content core, reducing material cost while maintaining in-field performance.</p>
    `,
  },
  {
    slug: "canton-fair-2026",
    title: "Meet Us at Canton Fair 2026 — Hall 9.1, Booth A14",
    date: "2025-06-01",
    category: "Events",
    excerpt:
      "Wenzhou Ashal Innomach Technology will exhibit at the 139th Canton Fair in Guangzhou. Visit booth A14 in Hall 9.1 to see live demos and speak with our engineers.",
    image: "/machines/s-wide.png",
    tags: ["Events", "Canton Fair", "Exhibition"],
    links: [
      { label: "Register for Canton Fair", url: "https://www.cantonfair.org.cn" },
      { label: "Book a meeting", url: "/contact" },
    ],
    body: `
      <p>We will be exhibiting at the <strong>139th China Import and Export Fair (Canton Fair)</strong>, held in Guangzhou from April 23 – May 2, 2026. Find us at <strong>Hall 9.1, Booth A14</strong> in the Plastics & Rubber Machinery section.</p>
      <h3>What we'll be showing</h3>
      <p>This year's exhibit focuses on our expanded biodegradable film processing capability. We will have tabletop scale models of the ABCDE-2200 and T-PRO heat-seal converter, along with a full library of film samples produced on our machines.</p>
      <ul>
        <li>ABCDE-2200 five-layer blown-film line</li>
        <li>T-PRO heat-seal converter — PE and PBAT+PLA</li>
        <li>CX Recycling & Pelletizing Line</li>
        <li>ABA Three-layer lines — 1000 to 1500 mm</li>
      </ul>
      <h3>Book a meeting in advance</h3>
      <p>Our engineering and sales team will be available for one-on-one technical consultations throughout the fair. To book a 30-minute slot, use the contact form and mention "Canton Fair 2026" in the message field. Slots are filling quickly — we recommend booking at least three weeks in advance.</p>
      <h3>Getting there</h3>
      <p>Hall 9.1 is in Area B of the Pazhou Complex. The nearest metro station is Pazhou on Line 8. From the station, Hall 9 is a 5-minute walk via the east pedestrian bridge.</p>
    `,
  },
  {
    slug: "roll-bag-machine-rgb-update",
    title: "RGB Roll-Bag Machine: New Motorised Width Adjustment",
    date: "2025-04-18",
    category: "Product Update",
    excerpt:
      "The CX-RGB roll-bag machine now ships with motorised width adjustment and a digital position readout, cutting changeover time from 40 minutes to under 10.",
    image: "/machines/rgb-rollbag.png",
    tags: ["Bag Making", "Roll Bag", "Product Update"],
    links: [
      { label: "RGB roll-bag machine specs", url: "/products/bag-making/rgb-rollbag" },
    ],
    body: `
      <p>Following customer feedback from high-mix production environments, we have upgraded the <strong>CX-RGB Roll Bag Machine</strong> with motorised width adjustment and a digital position readout as standard equipment across all models.</p>
      <h3>The problem with manual adjustment</h3>
      <p>On the previous generation, changing roll width required a spanner, a rule, and a lot of patience. In practice, experienced operators took 35–45 minutes per changeover — time that adds up fast when running multiple roll sizes per shift. Misalignment after changeover was also a common cause of edge-fold defects.</p>
      <h3>The new system</h3>
      <p>A pair of servo-driven ballscrews move the slitter frames symmetrically from the centreline. Width is entered on the HMI touchscreen and the machine positions itself to ± 0.2 mm. A digital linear encoder on each frame provides real-time position feedback. Total changeover time: under 10 minutes including the test run.</p>
      <h3>Recipe storage</h3>
      <p>Up to 50 width recipes can be stored and recalled by product code. When integrated with a production scheduler, this enables fully automated changeover sequencing with no operator intervention on the width setting.</p>
      <h3>Availability</h3>
      <p>Motorised width adjustment is standard on all new RGB-1000 and RGB-1200 builds from Q2 2025. It is available as a retrofit kit for machines built from 2022 onwards. Contact our service team for retrofit pricing.</p>
    `,
  },
];

export const articleBySlug = (slug: string) =>
  articles.find((a) => a.slug === slug);

export const latestArticles = (n = 4) =>
  [...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
