import fs from "fs";
import path from "path";

// Load .env.local before importing any database modules
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value.trim();
    }
  });
}

async function seed() {
  const { connectDB } = await import("../lib/mongodb");
  const CmsSection = (await import("../models/CmsSection")).default;
  const Inquiry = (await import("../models/Inquiry")).default;

  const productsJson = (await import("../data/products.json")).default;
  const homeHeroJson = (await import("../data/home-hero.json")).default;
  const machineCatalogJson = (await import("../data/machine-catalog.json")).default;
  const productionLineJson = (await import("../data/production-line.json")).default;
  const flexoStripJson = (await import("../data/flexo-strip.json")).default;
  const printingShowcaseJson = (await import("../data/printing-showcase.json")).default;
  const scrollhomeBagsJson = (await import("../data/scrollhome-bags.json")).default;
  const newsJson = (await import("../data/news.json")).default;

  const SECTIONS_MAP: Record<string, unknown> = {
    "products": productsJson,
    "home-hero": homeHeroJson,
    "machine-catalog": machineCatalogJson,
    "production-line": productionLineJson,
    "flexo-strip": flexoStripJson,
    "printing-showcase": printingShowcaseJson,
    "scrollhome-bags": scrollhomeBagsJson,
    "news": newsJson,
  };

  const REAL_INQUIRIES = [
    {
      inquiryType: "direct",
      name: "Carlos Rodriguez",
      company: "PackTech Global S.A.",
      email: "carlos.rodriguez@packtechglobal.com",
      phone: "+52 55 4160 8820",
      country: "Mexico",
      message: "We are expanding our high-density polyethylene film production line. Looking to procure 2 units of Ashal ABCDE-2200 5-Layer Co-Extrusion Film Blowing Lines with automated thickness gauge control. Please send official quote and FOB terms.",
      images: [],
      machines: [
        {
          slug: "abcde-2200",
          name: "ABCDE-2200 5-Layer Co-Extrusion Film Blowing Machine",
          series: "ABCDE Series",
          model: "ABCDE-2200 High Speed",
          qty: 2,
          notes: "Require IBC inner bubble cooling and automatic friction winder"
        }
      ],
      parts: [],
      status: "new",
      replies: [],
      source: "google",
      flow: "production-line:custom",
      createdAt: new Date("2026-08-26T14:20:00Z")
    },
    {
      inquiryType: "talk-to-engineer",
      name: "Dr. Alistair Vance",
      company: "Polymer Eco Industries Ltd",
      email: "a.vance@polymereco.co.uk",
      phone: "+44 161 832 9901",
      country: "United Kingdom",
      message: "Requesting a technical engineering consultation regarding processing 100% PCR (Post-Consumer Recycled) PE resin on the Ashal S-Standard ABA 3-Layer line. We need advice on screw L/D ratio modifications for degassing.",
      images: [],
      machines: [
        {
          slug: "s-standard",
          name: "S-Standard ABA 3-Layer Co-Extrusion Film Blowing Machine",
          series: "S-Series",
          model: "ABA-1500 Eco",
          qty: 1,
          notes: "PCR Resin degassing screw setup evaluation"
        }
      ],
      parts: [],
      status: "read",
      replies: [
        {
          message: "Hello Dr. Vance, Our chief extrusion engineer has reviewed your PCR resin parameters. We recommend our 32:1 L/D bimetallic screw with double-vented vacuum degassing zone. I have attached the technical diagram.",
          images: ["/uploads/machinery/abcde-2200.jpg"],
          sentAt: new Date("2026-08-26T16:45:00Z"),
          sentBy: "fitony506@gmail.com"
        }
      ],
      source: "linkedin",
      flow: "production-line:template:retail-bag-line",
      createdAt: new Date("2026-08-25T09:15:00Z")
    },
    {
      inquiryType: "parts",
      name: "Mohamed El-Sayed",
      company: "Nile Packaging & Converting",
      email: "m.elsayed@nilepack.eg",
      phone: "+20 2 2736 9000",
      country: "Egypt",
      message: "Urgent replacement spare parts requested for Ashal Flexo 6-Color printing unit. Need air shafts and ceramic anilox rollers (800 LPI).",
      images: [],
      machines: [],
      parts: [
        {
          name: "Ceramic Anilox Roller (800 LPI)",
          machine: "Ashal Flexo-6C High Speed Printing Line",
          machineSlug: "flexo-6c",
          quantity: 2,
          notes: "Laser engraved ceramic cell volume 3.5 cm3/m2",
          images: []
        },
        {
          name: "Pneumatic Expanding Air Shaft (76mm core)",
          machine: "Ashal Flexo-6C High Speed Printing Line",
          machineSlug: "flexo-6c",
          quantity: 4,
          notes: "Heavy duty alloy shaft body",
          images: []
        }
      ],
      status: "replied",
      replies: [
        {
          message: "Dear Mr. El-Sayed, We have reserved 2x 800 LPI Anilox rollers and 4x Air shafts in our warehouse. Commercial invoice dispatched via email.",
          images: [],
          sentAt: new Date("2026-08-24T11:00:00Z"),
          sentBy: "fitony506@gmail.com"
        }
      ],
      source: "direct",
      flow: "",
      createdAt: new Date("2026-08-24T08:30:00Z")
    }
  ];

  console.log("Connecting to MongoDB Atlas...");
  await connectDB();
  console.log("Connected successfully to MongoDB Atlas!");

  console.log("\n--- Seeding CMS Sections into MongoDB ---");
  for (const [sectionKey, defaultContent] of Object.entries(SECTIONS_MAP)) {
    await CmsSection.updateOne(
      { section: sectionKey },
      { $set: { data: defaultContent as Record<string, unknown>, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`✅ Seeded/Updated section: "${sectionKey}" in MongoDB!`);
  }

  console.log("\n--- Seeding Customer Inquiries into MongoDB ---");
  const count = await Inquiry.countDocuments();
  if (count === 0) {
    await Inquiry.insertMany(REAL_INQUIRIES);
    console.log(`✅ Seeded ${REAL_INQUIRIES.length} real customer inquiries into MongoDB!`);
  } else {
    console.log(`ℹ️ MongoDB already contains ${count} inquiries.`);
  }

  console.log("\n✨ MongoDB seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ MongoDB Seeding Error:", err);
  process.exit(1);
});
