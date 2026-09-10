This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where comments have been removed, empty lines have been removed, content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: data/products*.json, messages/*.json, data/news*.json, app/data/news*.json, .agents/**, .claude/**, .impeccable/**, *.zip, *.pdf, *.jpeg, *.jpg, *.png, *.svg, *.ico, *.mp4, *.webp, .next/**, package-lock.json, tsconfig.tsbuildinfo, shots/**, .scratch*, node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Code comments have been removed from supported file types
- Empty lines have been removed from all files
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
.scratch19/
  check-mobile-current.mjs
  mobile-current-full.png
  mobile-current.png
app/
  [locale]/
    about/
      AboutClient.tsx
      page.tsx
    account/
      login/
        page.tsx
      page.tsx
    contact/
      ContactClient.tsx
      page.tsx
    faq/
      FaqClient.tsx
      page.tsx
    inquiries/
      direct/
        page.tsx
      parts/
        page.tsx
      talk-to-engineer/
        page.tsx
      page.tsx
    legal/
      LegalClient.tsx
      page.tsx
    news/
      [slug]/
        page.tsx
      page.tsx
    production-line/
      page.tsx
      ProductionLineClient.tsx
    products/
      [category]/
        [slug]/
          page.tsx
          ProductDetail.tsx
        CategoryPageClient.tsx
        page.tsx
      CatalogueClient.tsx
      page.tsx
    tools/
      extrusion-calculator/
        page.tsx
    layout.tsx
    loading.tsx
    page.tsx
  api/
    account/
      login/
        route.ts
      logout/
        route.ts
      me/
        route.ts
      verify/
        route.ts
    admin/
      analytics/
        session/
          [sessionId]/
            hook-email/
              route.ts
            insight/
              route.ts
            route.ts
        route.ts
      data/
        [section]/
          route.ts
      inquiries/
        [id]/
          reply/
            route.ts
          roadmap/
            route.ts
          route.ts
        route.ts
      invite/
        verify/
          route.ts
      login/
        route.ts
      logout/
        route.ts
      me/
        route.ts
      roles/
        route.ts
      settings/
        email/
          confirm/
            route.ts
          route.ts
        password/
          route.ts
      upload/
        route.ts
    chat/
      machines/
        route.ts
      route.ts
    content/
      [section]/
        route.ts
    datasheet/
      [slug]/
        route.ts
    images/
      route.ts
    inquiries/
      route.ts
    inquiry-replies/
      [id]/
        route.ts
      route.ts
    inquiry-review/
      route.ts
    lead-capture/
      route.ts
    track/
      route.ts
    upload/
      route.ts
  cx-ops-x7k9q2/
    analytics/
      page.tsx
      SessionDetailPanel.tsx
    inquiries/
      CustomerRoadmap.tsx
      page.tsx
    invite/
      page.tsx
    login/
      page.tsx
    s/
      [section]/
        page.tsx
    settings/
      page.tsx
    admin.css
    adminIcons.tsx
    AdminShell.tsx
    Editor.tsx
    layout.tsx
    page.tsx
  data/
    machines.json
  apple-icon.png
  globals.css
  icon.png
  robots.ts
  sitemap.ts
components/
  AboutAtmosphere.tsx
  AetherBtn.tsx
  AiAgentBanner.tsx
  AiReviewChat.tsx
  AppToaster.tsx
  AudienceSection.tsx
  ChatInquiry.tsx
  ChatWidget.tsx
  ClientJourney.tsx
  ConfiguratorCTA.tsx
  CustomSections.tsx
  DeliveryStageIcon.tsx
  EditorialKit.tsx
  ExtrusionCalculator.tsx
  FlexoPrintingPage.tsx
  FlexoStrip.tsx
  FooterWaterReflection.tsx
  HeroSplash.tsx
  JsonLd.tsx
  LanguageSwitcher.tsx
  LazyMount.tsx
  LazyTrustSection.tsx
  LineTemplateShowcase.tsx
  LoadingScreen.tsx
  MachineCatalogSection.tsx
  MachineDiagram.tsx
  MachineParts.tsx
  MachineSeoSection.tsx
  MachineSubNav.tsx
  NewsStrip.tsx
  PageNav.tsx
  ParticlePortfolio.tsx
  PrintingShowcase.tsx
  ProactiveNudge.tsx
  ProcessIcon.tsx
  ProductionLineTeaser.tsx
  ProductLeadCapture.tsx
  ProductStage3D.tsx
  RollingNavMenu.tsx
  ScrollHome.tsx
  SectionReveal.tsx
  SiteFooter.tsx
  SiteNav.tsx
  SpecTable.tsx
  ThemeToggle.tsx
  TransitionLink.tsx
  TrustSection.tsx
  VideoFacade.tsx
  VisitorTracker.tsx
  WaveBackground.tsx
  WispBackground.tsx
data/
  admin-users.json
  flexo-strip.json
  home-hero.ar.json
  home-hero.hi.json
  home-hero.json
  machine-catalog.json
  printing-showcase.json
  production-line-templates.json
  production-line.json
  scrollhome-bags.json
  site-seo-matrix.json
docs/
  B2B_DIRECTORY_OUTREACH_STRATEGY.md
i18n/
  navigation.ts
  request.ts
  routing.ts
lib/
  adminAuth.ts
  adminCredentials.ts
  adminRoles.ts
  aiBrain.ts
  clientSession.ts
  cloudinary.ts
  cmsSchemas.ts
  cmsStore.ts
  customerAuth.ts
  emailTemplate.ts
  faqData.ts
  format.ts
  gemini.ts
  groq.ts
  inquiries.ts
  leadDrafts.ts
  leadNotify.ts
  lineStatus.ts
  liveCatalogue.ts
  liveNews.ts
  localAgent.ts
  machinesData.ts
  mongodb.ts
  news.ts
  openrouter.ts
  productionLineTemplates.ts
  products.ts
  resend.ts
  seo-matrix.ts
  seo.ts
  track.ts
  uaParse.ts
  useCms.ts
  useScrollReveal.ts
models/
  AdminCredentials.ts
  AdminUser.ts
  AiBrain.ts
  ChatSession.ts
  CmsSection.ts
  Inquiry.ts
  MachineImage.ts
  SystemState.ts
  VisitorSession.ts
public/
  about-photos/
    company-logo.jpeg
    hq-building-generated.png
    warehouse-building-1.jpeg
    warehouse-building-2.jpeg
  machines/
    aba-1000-1500.png
    aba-800-1200.png
    aba-cx-series.png
    abc-cx-series.png
    abc-multilayer-large.png
    abc-multilayer-small.png
    abcde-2200.png
    bag-samples.png
    cx-25-lab.png
    cx-260.png
    cx-pelletizing.png
    f-pro-bottomseal.png
    flexo-1-nobg.png
    flexo-1.png
    flexo-2-nobg.png
    flexo-2.png
    flexo-3.png
    flexo-4-nobg.png
    flexo-4.png
    flexo-5-nobg.png
    flexo-5.png
    flexo-6c-nobg.png
    gb-garbage.png
    heatseal-750-1150-hd.png
    heatseal-750-1150.png
    heatseal-narrow.png
    rb-vegetable.png
    rgb-rollbag.png
    rollbag-continuous.png
    s-mini-double.png
    s-standard.png
    s-wide.png
    sb-pe-pbat.png
    sb-printing-line.png
    t-pro-heatseal.png
    tb-320.png
    tg-pro.png
  uploads/
    a245fa26-9f2f-4ec2-8c5d-1fd90552256c-mr6inpf0.jpg
    maxim-berg-3E2xgrlNXq4-unsplash-mr6kyw88.jpg
    WhatsApp-Image-2026-06-25-at-10-30-52-PM-mr6inxcy.jpg
  favicon.ico
  google6f1fb08fd726e855.html
  logo.jpeg
  qr-website.png
  qr-whatsapp.png
scripts/
  generate20kNewsSeoData.js
  generateSeoData.js
  seed-mongodb.ts
  seed.mjs
  verify-all.js
SEO-GEO-AEO-Skill-main/
  SKILL.md
.eslintrc.json
.gitignore
AI-CHATBOT.md
atlas-credentials.env
CLAUDE.md
install-extra-skills.sh
middleware.ts
next-env.d.ts
next.config.mjs
package.json
postcss.config.mjs
PRODUCT.md
README.md
repomix.config.json
skills-lock.json
tailwind.config.js
tsconfig.json
````

# Files

## File: .scratch19/check-mobile-current.mjs
````javascript

````

## File: app/api/admin/inquiries/[id]/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
⋮----
export async function GET(_req: NextRequest,
⋮----
export async function PATCH(req: NextRequest,
````

## File: app/api/admin/logout/route.ts
````typescript
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/adminAuth";
⋮----
export async function POST()
````

## File: app/api/admin/upload/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
⋮----
export async function POST(req: NextRequest)
````

## File: app/api/chat/machines/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { familyBySlug, familyImage, categoryBySlug } from "@/lib/products";
⋮----
export async function GET(req: NextRequest)
````

## File: app/api/images/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB }   from "@/lib/mongodb";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { verifySessionToken } from "@/lib/adminAuth";
import MachineImage    from "@/models/MachineImage";
⋮----
async function requireAdmin(request: NextRequest): Promise<boolean>
⋮----
export async function GET(req: NextRequest)
⋮----
export async function POST(req: NextRequest)
⋮----
export async function DELETE(req: NextRequest)
````

## File: app/api/inquiries/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { createInquiry, type CreateInquiryInput } from "@/lib/inquiries";
⋮----
export async function POST(req: NextRequest)
````

## File: app/api/inquiry-replies/[id]/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
⋮----
export async function GET(req: NextRequest,
````

## File: app/api/inquiry-replies/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import type { InquiryReply } from "@/models/Inquiry";
⋮----
export async function GET(req: NextRequest)
````

## File: app/api/upload/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
⋮----
export async function POST(req: NextRequest)
````

## File: app/cx-ops-x7k9q2/s/[section]/page.tsx
````typescript
import { notFound } from "next/navigation";
import AdminShell from "../../AdminShell";
import Editor from "../../Editor";
import { schemaBySlug } from "@/lib/cmsSchemas";
⋮----
export default function SectionPage(
````

## File: components/AetherBtn.tsx
````typescript
import type { ReactNode, CSSProperties } from "react";
⋮----
interface Props {
  children: ReactNode;
  style?: CSSProperties;
}
⋮----
export default function AetherBtn(
````

## File: components/CustomSections.tsx
````typescript
import Image from "next/image";
import type { CustomSection } from "@/lib/products";
⋮----
function SectionTitle(
````

## File: components/DeliveryStageIcon.tsx
````typescript
export type DeliveryStageKey = "confirm" | "production" | "test" | "shipping" | "install";
````

## File: data/flexo-strip.json
````json
{
  "items": [
    { "slug": "flexo-2c", "label": "AI-2C", "colours": 2, "speed": "120", "reg": "±0.2mm", "img": "/machines/flexo-1.png", "tag": "Entry CI Press", "hot": false, "flagship": false },
    { "slug": "flexo-4c", "label": "AI-4C", "colours": 4, "speed": "200", "reg": "±0.15mm", "img": "/machines/flexo-2.png", "tag": "Mid-range · Hot Model", "hot": true, "flagship": false },
    { "slug": "flexo-6c", "label": "AI-6C", "colours": 6, "speed": "260", "reg": "±0.1mm", "img": "/machines/flexo-6c-nobg.png", "tag": "High-speed CI Press", "hot": false, "flagship": false },
    { "slug": "flexo-8c", "label": "AI-8C", "colours": 8, "speed": "350", "reg": "±0.1mm", "img": "/machines/flexo-4.png", "tag": "Flagship · Max Output", "hot": false, "flagship": true }
  ]
}
````

## File: data/machine-catalog.json
````json
{
  "headline1": "Every machine.",
  "headline2": "Find your perfect fit.",
  "items": [
    {
      "slug": "abcde-2200",
      "stat": "400 kg/h",
      "label": "Max output"
    },
    {
      "slug": "abc-multilayer-small",
      "stat": "3-layer",
      "label": "Co-extrusion"
    },
    {
      "slug": "abc-multilayer-large",
      "stat": "5-layer",
      "label": "Co-extrusion"
    },
    {
      "slug": "abc-cx-series",
      "stat": "3-layer",
      "label": "Multi-layer"
    },
    {
      "slug": "aba-1000-1500",
      "stat": "3-layer",
      "label": "ABA"
    },
    {
      "slug": "aba-800-1200",
      "stat": "4-screw",
      "label": "ABA"
    },
    {
      "slug": "aba-cx-series",
      "stat": "3-layer",
      "label": "CX Series"
    },
    {
      "slug": "s-mini-double",
      "stat": "×2 heads",
      "label": "Double-head"
    },
    {
      "slug": "s-wide",
      "stat": "2100 mm",
      "label": "Roller width"
    },
    {
      "slug": "s-standard",
      "stat": "1000 mm",
      "label": "Max width"
    },
    {
      "slug": "sb-printing-line",
      "stat": "6-colour",
      "label": "Blow + print"
    },
    {
      "slug": "cx-25-lab",
      "stat": "25 mm",
      "label": "Benchtop"
    },
    {
      "slug": "t-pro-heatseal",
      "stat": "300 pcs/min",
      "label": "Throughput"
    },
    {
      "slug": "tg-pro",
      "stat": "500 mm",
      "label": "Bag width"
    },
    {
      "slug": "tb-320",
      "stat": "×6 lanes",
      "label": "Multi-lane"
    },
    {
      "slug": "f-pro-bottomseal",
      "stat": "1600 mm",
      "label": "Max width"
    },
    {
      "slug": "heatseal-750-1150",
      "stat": "1150 mm",
      "label": "Max width"
    },
    {
      "slug": "heatseal-750-1150-hd",
      "stat": "Heavy",
      "label": "Duty grade"
    },
    {
      "slug": "heatseal-narrow",
      "stat": "450 mm",
      "label": "Max width"
    },
    {
      "slug": "rb-vegetable",
      "stat": "×2 lanes",
      "label": "Vest & veg"
    },
    {
      "slug": "rgb-rollbag",
      "stat": "1200 mm",
      "label": "Roll bag"
    },
    {
      "slug": "rollbag-continuous",
      "stat": "Continuous",
      "label": "Roll bag"
    },
    {
      "slug": "sb-pe-pbat",
      "stat": "PE/PBAT",
      "label": "Material"
    },
    {
      "slug": "cx-260",
      "stat": "260 mm",
      "label": "Width"
    },
    {
      "slug": "gb-garbage",
      "stat": "1200 mm",
      "label": "Roll bag"
    },
    {
      "slug": "cx-pelletizing",
      "stat": "99%",
      "label": "Resin recovery"
    },
    {
      "slug": "flexo-2c",
      "stat": "2-colour",
      "label": "CI flexo"
    },
    {
      "slug": "flexo-4c",
      "stat": "4-colour",
      "label": "CI flexo"
    },
    {
      "slug": "flexo-6c",
      "stat": "260 m/min",
      "label": "Print speed"
    },
    {
      "slug": "flexo-8c",
      "stat": "8-colour",
      "label": "CI flexo"
    }
  ]
}
````

## File: data/production-line.json
````json
{
  "items": [
    {
      "slug": "abcde-2200",
      "img": "/machines/abcde-2200.png",
      "cat": "film-blowing",
      "stage": "Film Extrusion",
      "name": "ABCDE-2200 Five-Layer",
      "role": "The line starts here — resin is melted and blown into a 5-layer co-extruded film, 2100 mm wide.",
      "quality": [
        ["Thickness tolerance", "±2%"],
        ["Output", "400 kg/h"],
        ["Layers", "5"]
      ]
    },
    {
      "slug": "flexo-6c",
      "img": "/machines/flexo-6c-nobg.png",
      "cat": "printing",
      "stage": "Flexo Printing",
      "name": "AI-6C CI Flexo Press",
      "role": "The blown film is printed in up to 6 colours on the central-impression drum at 260 m/min.",
      "quality": [
        ["Registration", "±0.1 mm"],
        ["Print speed", "260 m/min"],
        ["Colours", "6"]
      ]
    },
    {
      "slug": "t-pro-heatseal",
      "img": "/machines/t-pro-heatseal.png",
      "cat": "bag-making",
      "stage": "Bag Converting",
      "name": "T-PRO Heat-Seal Machine",
      "role": "Printed film is sealed and cut into finished bags across multiple lanes at production speed.",
      "quality": [
        ["Seal speed", "300 pcs/min"],
        ["Lanes", "2–3"],
        ["Bag width", "500–600 mm"]
      ]
    },
    {
      "slug": "rgb-rollbag",
      "img": "/machines/rgb-rollbag.png",
      "cat": "bag-making",
      "stage": "Roll Winding",
      "name": "CX-RGB Roll Bag Machine",
      "role": "Bags are perforated and wound onto rolls with automatic core cutting for retail-ready packs.",
      "quality": [
        ["Roll width", "1000–1200 mm"],
        ["Perforation", "Inline"],
        ["Core", "Auto-cut"]
      ]
    },
    {
      "slug": "cx-pelletizing",
      "img": "/machines/cx-pelletizing.png",
      "cat": "recycling",
      "stage": "Closed-Loop Recycling",
      "name": "CX Pelletizing Line",
      "role": "Edge trim and scrap from every stage return here — recovered into resin and fed back to step 01.",
      "quality": [
        ["Resin recovery", "99%"],
        ["Output", "100–120 kg/h"],
        ["Screen", "Auto-changer"]
      ]
    }
  ]
}
````

## File: data/scrollhome-bags.json
````json
{
  "items": [
    {
      "slug": "t-pro-heatseal",
      "specs": [
        {
          "label": "Series",
          "value": "T-PRO"
        },
        {
          "label": "Type",
          "value": "Heat-seal converter"
        },
        {
          "label": "Film width",
          "value": "750 – 1150 mm"
        },
        {
          "label": "Speed",
          "value": "600 pcs / min"
        },
        {
          "label": "Lanes",
          "value": "Up to 6"
        },
        {
          "label": "Material",
          "value": "PE · PBAT+PLA"
        },
        {
          "label": "Drive",
          "value": "Servo + frequency"
        }
      ],
      "features": [
        {
          "head": "Multi-lane",
          "body": "Up to 6 lanes for high-volume simultaneous output."
        },
        {
          "head": "Biodegradable ready",
          "body": "Compatible with PBAT+PLA blends out of the box."
        },
        {
          "head": "Servo precision",
          "body": "±0.5 mm sealing repeat accuracy across all lanes."
        },
        {
          "head": "Fast changeover",
          "body": "Tool-free width adjustment in under 15 minutes."
        }
      ]
    },
    {
      "slug": "f-pro-bottomseal",
      "specs": [
        {
          "label": "Series",
          "value": "F-PRO"
        },
        {
          "label": "Type",
          "value": "Bottom-seal converter"
        },
        {
          "label": "Film width",
          "value": "600 – 1000 mm"
        },
        {
          "label": "Speed",
          "value": "280 pcs / min"
        },
        {
          "label": "Lanes",
          "value": "Up to 4"
        },
        {
          "label": "Material",
          "value": "PE · PP"
        },
        {
          "label": "Drive",
          "value": "Servo driven"
        }
      ],
      "features": [
        {
          "head": "Bottom seal",
          "body": "Continuous bottom-seal for flat bags with precision tension control."
        },
        {
          "head": "Compact footprint",
          "body": "Space-saving design for medium-volume production lines."
        },
        {
          "head": "Easy operation",
          "body": "Touchscreen HMI with recipe memory for quick batch switching."
        },
        {
          "head": "Low maintenance",
          "body": "Fewer moving parts with sealed bearing assemblies throughout."
        }
      ]
    },
    {
      "slug": "rgb-rollbag",
      "specs": [
        {
          "label": "Series",
          "value": "RGB"
        },
        {
          "label": "Type",
          "value": "Roll-bag machine"
        },
        {
          "label": "Film width",
          "value": "500 – 900 mm"
        },
        {
          "label": "Speed",
          "value": "200 pcs / min"
        },
        {
          "label": "Lanes",
          "value": "Up to 3"
        },
        {
          "label": "Material",
          "value": "PE · LDPE"
        },
        {
          "label": "Drive",
          "value": "Inverter + servo"
        }
      ],
      "features": [
        {
          "head": "Roll format",
          "body": "Produces perforated roll bags for automatic dispensing systems."
        },
        {
          "head": "Perforation unit",
          "body": "Integrated blade perforation with adjustable pitch and depth."
        },
        {
          "head": "Winding system",
          "body": "Automatic roll winding with tension control for uniform rolls."
        },
        {
          "head": "Quick sizing",
          "body": "Motorized width adjustment with digital position readout."
        }
      ]
    },
    {
      "slug": "rb-vegetable",
      "specs": [
        {
          "label": "Series",
          "value": "RB"
        },
        {
          "label": "Type",
          "value": "Vest-bag machine"
        },
        {
          "label": "Film width",
          "value": "800 – 1200 mm"
        },
        {
          "label": "Speed",
          "value": "250 pcs / min"
        },
        {
          "label": "Lanes",
          "value": "Up to 4"
        },
        {
          "label": "Material",
          "value": "HDPE · MDPE"
        },
        {
          "label": "Drive",
          "value": "Full servo"
        }
      ],
      "features": [
        {
          "head": "T-shirt bags",
          "body": "Designed for vest/T-shirt bags with reinforced die-cut handles."
        },
        {
          "head": "Die-cut unit",
          "body": "Integrated punch module for consistent handle cutouts."
        },
        {
          "head": "Stacking conveyor",
          "body": "Automated counting and stacking for pack-ready output."
        },
        {
          "head": "High throughput",
          "body": "Up to 250 bags per minute with multi-lane parallel processing."
        }
      ]
    },
    {
      "slug": "abcde-2200",
      "specs": [
        {
          "label": "Series",
          "value": "ABCDE-2200"
        },
        {
          "label": "Type",
          "value": "5-layer co-ex line"
        },
        {
          "label": "Film width",
          "value": "2200 mm max"
        },
        {
          "label": "Output",
          "value": "350 kg / h"
        },
        {
          "label": "Layers",
          "value": "5"
        },
        {
          "label": "Material",
          "value": "PE · PP · PA · EVOH"
        },
        {
          "label": "Drive",
          "value": "AC vector"
        }
      ],
      "features": [
        {
          "head": "Multi-layer",
          "body": "5-layer co-extrusion for advanced barrier and seal properties."
        },
        {
          "head": "High output",
          "body": "350 kg/h throughput with internal bubble cooling system."
        },
        {
          "head": "Web width",
          "body": "2200 mm lay-flat for large-format film applications."
        },
        {
          "head": "Precision gauging",
          "body": "Online thickness measurement with closed-loop auto adjustment."
        }
      ]
    },
    {
      "slug": "abc-multilayer-large",
      "specs": [
        {
          "label": "Series",
          "value": "ABC"
        },
        {
          "label": "Type",
          "value": "Multi-layer blown film"
        },
        {
          "label": "Film width",
          "value": "1800 mm max"
        },
        {
          "label": "Output",
          "value": "280 kg / h"
        },
        {
          "label": "Layers",
          "value": "3"
        },
        {
          "label": "Material",
          "value": "PE · PP"
        },
        {
          "label": "Drive",
          "value": "AC vector"
        }
      ],
      "features": [
        {
          "head": "3-layer co-ex",
          "body": "High-performance 3-layer blown film for general packaging."
        },
        {
          "head": "Energy efficient",
          "body": "Low-energy IBC design with optimized air ring technology."
        },
        {
          "head": "Consistent gauge",
          "body": "Auto-profiled die gap for uniform film thickness across the web."
        },
        {
          "head": "User-friendly",
          "body": "Recipe-based controls with touch panel and data logging."
        }
      ]
    },
    {
      "slug": "s-wide",
      "specs": [
        {
          "label": "Series",
          "value": "S"
        },
        {
          "label": "Type",
          "value": "Single-layer wide"
        },
        {
          "label": "Film width",
          "value": "2500 mm max"
        },
        {
          "label": "Output",
          "value": "200 kg / h"
        },
        {
          "label": "Layers",
          "value": "1"
        },
        {
          "label": "Material",
          "value": "LDPE · LLDPE"
        },
        {
          "label": "Drive",
          "value": "AC inverter"
        }
      ],
      "features": [
        {
          "head": "Ultra-wide",
          "body": "2500 mm lay-flat width for industrial film applications."
        },
        {
          "head": "Simple operation",
          "body": "Single-layer extrusion with minimal operator training required."
        },
        {
          "head": "Low investment",
          "body": "Cost-effective solution for high-volume commodity film production."
        },
        {
          "head": "Flexible output",
          "body": "Runs LDPE and LLDPE with quick resin changeover."
        }
      ]
    },
    {
      "slug": "cx-pelletizing",
      "specs": [
        {
          "label": "Series",
          "value": "CX"
        },
        {
          "label": "Type",
          "value": "Recycling pelletizer"
        },
        {
          "label": "Output",
          "value": "150 – 300 kg / h"
        },
        {
          "label": "Material",
          "value": "PE · PP · Pet"
        },
        {
          "label": "Pellet size",
          "value": "3 – 4 mm"
        },
        {
          "label": "Power",
          "value": "75 – 160 kW"
        },
        {
          "label": "Drive",
          "value": "AC vector + servo"
        }
      ],
      "features": [
        {
          "head": "Closed-loop",
          "body": "Converts post-industrial waste into high-quality reusable pellets."
        },
        {
          "head": "Integrated cutter",
          "body": "Hot-face die-face cutting with underwater pelletizing system."
        },
        {
          "head": "Filtration",
          "body": "Continuous melt filtration with automatic screen changer."
        },
        {
          "head": "Energy recovery",
          "body": "Integrated heat recovery system reduces total power consumption."
        }
      ]
    }
  ]
}
````

## File: lib/cloudinary.ts
````typescript
import { v2 as cloudinary } from "cloudinary";
⋮----
export async function uploadImage(
  source: string,
  folder: string = "cx-machinery",
  publicId?: string,
): Promise<
⋮----
export async function deleteImage(publicId: string): Promise<void>
````

## File: lib/cmsStore.ts
````typescript
import { connectDB } from "@/lib/mongodb";
import CmsSection from "@/models/CmsSection";
⋮----
import productsJson from "@/data/products.json";
import homeHeroJson from "@/data/home-hero.json";
import machineCatalogJson from "@/data/machine-catalog.json";
import productionLineJson from "@/data/production-line.json";
import flexoStripJson from "@/data/flexo-strip.json";
import printingShowcaseJson from "@/data/printing-showcase.json";
import scrollhomeBagsJson from "@/data/scrollhome-bags.json";
import newsJson from "@/data/news.json";
⋮----
export type CmsSection = (typeof CMS_SECTIONS)[number];
⋮----
export function isCmsSection(s: string): s is CmsSection
⋮----
export async function readSection(section: CmsSection): Promise<unknown>
⋮----
export async function writeSection(section: CmsSection, data: unknown): Promise<void>
````

## File: lib/liveCatalogue.ts
````typescript
import { readSection } from "@/lib/cmsStore";
import { categories, families, type Catalogue } from "@/lib/products";
⋮----
export async function getLiveCatalogue(): Promise<Catalogue>
````

## File: lib/liveNews.ts
````typescript
import { readSection } from "@/lib/cmsStore";
import type { NewsData } from "@/lib/news";
⋮----
export async function getLiveNews(): Promise<NewsData>
````

## File: lib/mongodb.ts
````typescript
import mongoose from "mongoose";
⋮----
export async function connectDB(): Promise<typeof mongoose>
````

## File: lib/useCms.ts
````typescript
import { useEffect, useState } from "react";
⋮----
export function useCms<T>(section: string, fallback: T): T
````

## File: models/CmsSection.ts
````typescript
import mongoose, { Schema, model, models } from "mongoose";
⋮----
export interface ICmsSection {
  section: string;
  data: Record<string, unknown>;
  updatedAt: Date;
}
````

## File: models/MachineImage.ts
````typescript
import mongoose, { Schema, model, models } from "mongoose";
⋮----
export interface IMachineImage {
  machineSlug: string;
  category:    string;
  publicId:    string;
  url:         string;
  alt:         string;
  order:       number;
  createdAt:   Date;
}
⋮----
// Prevent model recompilation in Next.js hot-reload
````

## File: scripts/seed.mjs
````javascript
async function main()
````

## File: .eslintrc.json
````json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "@next/next/no-img-element": "off",
    "react/no-unescaped-entities": "off"
  }
}
````

## File: AI-CHATBOT.md
````markdown
# ASHA — AI Sales Helper Agent

## Overview

ASHA (AI Sales Helper Agent) is a dual-engine chatbot embedded on every page. It answers questions about the machine catalogue, compares products, and runs a guided inquiry flow — all without a separate training step.

```
User → ChatWidget → POST /api/chat → isBasicQuery()?
  → YES → answerLocally()   (rule-based, instant, zero cost)
  → NO  → answerWithOpenRouter() with 10s timeout
            → fails/timeout → falls back to answerLocally()
  → Save to MongoDB → NDJSON stream → ChatWidget renders it
```

---

## Architecture (3 tiers)

### 1. Frontend — `components/ChatWidget.tsx`

Floating chat panel (hard-hat launcher button, bottom-right). Features:
- Persistent session via `sessionId` in `localStorage` (UUID)
- Message history loaded from `GET /api/chat?sessionId=` on open
- Renders rich actions inline:
  - **Machine cards** (`show_machines`) — thumbnails + name + "Inquire" button
  - **Comparison charts** (`compare`) — grouped bar charts + spec table
  - **Quick-reply chips** (`quick_replies`) — clickable category options
  - **Navigate** (`navigate`) — auto-redirects to product page
- Expandable panel (small ↔ large mode)
- Tooltip promo on first visit
- Global open API: `window.dispatchEvent(new CustomEvent("asha:open", { detail: { prefillMessage } }))`

### 2. API Route — `app/api/chat/route.ts`

**`POST /api/chat`** — accepts `{ sessionId, message }`, returns NDJSON:
```json
{"type":"delta","text":"..."}
{"type":"final","text":"...","actions":[...]}
```

Flow:
1. Connect to MongoDB, find or create session by `sessionId`
2. Push user message to session history
3. If `isBasicQuery()` → skip LLM, use `answerLocally()`
4. Else → `Promise.race([answerWithOpenRouter(), 10s timeout])`
   - LLM succeeds → use parsed reply
   - LLM fails/timeout → fallback to `answerLocally()`
5. Push assistant reply to session, save to MongoDB
6. If `completedInquiry` returned → call `createInquiry()` (saves to MongoDB + emails admin)
7. Return NDJSON stream

**`GET /api/chat?sessionId=`** — returns `{ messages: [...] }` for history.

**`GET /api/chat/machines?slugs=a,b,c`** — returns machine summaries for card rendering.

### 3. Answer Engines

#### Primary: OpenRouter LLM — `lib/openrouter.ts`

| Config | Value |
|---|---|
| Base URL | `https://openrouter.ai/api/v1` |
| Primary model | `liquid/lfm-2.5-1.2b-instruct:free` (or `OPENROUTER_MODEL` env) |
| Fallback models | `meta-llama/llama-3.3-70b-instruct:free`, `llama-3.2-3b-instruct:free`, `gemma-4-26b-a4b-it:free`, `qwen/qwen3-coder:free` |
| Retry strategy | Try primary + 1 fallback (max 2 total) |
| Timeout per model | 7s (AbortController) |
| Temperature | 0.3 |
| Max tokens | 2048 |

System prompt includes:
- Full product catalogue as context (built live from `lib/products.ts`)
- JSON-only response format instruction
- Available actions (`quick_replies`, `show_machines`, `compare`)
- Guided inquiry flow protocol

All replies must be valid JSON: `{"text":"...","actions":[],"pendingInquiry":null,"completedInquiry":null}`

#### Fallback: Rule-Based Engine — `lib/localAgent.ts`

Zero-cost, zero-hallucination engine. Reads live catalogue data directly.

Triggers (checked in order):
1. **Active inquiry flow** — continues name/email/qty collection
2. **Greetings** — welcome message + category quick-replies
3. **Identity questions** — "who are you" → brand intro
4. **Buy intent** — starts guided inquiry flow
5. **Compare** (≥2 machines named) — inline comparison + chart action
6. **Multiple machines matched** — card grid
7. **Single machine matched** — full spec summary + card
8. **Category match** — lists all machines in category
9. **Recommend** with qualifier — filters by output/capacity/colors
10. **List/show** — category quick-replies
11. **Fallback** — "I'm not sure" + category quick-replies

Fuzzy matching: normalizes input, checks series/slug/model numbers (strong), then distinguishing name words (weak). Ignores generic words like "machine", "film", "bag".

#### Available (not wired): Grok — `lib/grok.ts`

xAI Grok API client (`grok-4-fast`). Supports streaming and non-streaming. OpenAI-compatible. Not currently connected to the chat route but available for future use.

---

## Knowledge / Context

### `lib/chatKnowledge.ts`
Builds a compact text block from the live product catalogue (`data/products.json` via `lib/products.ts`). Grouped by category, includes model names, specs per model, installation steps, delivery timelines. No separate ingestion/training — data is live every request.

### `data/products.json`
Full catalogue with typed structure: categories, families, models, specs, images, installation steps, delivery guide. Editable via admin panel at `/cx-ops-x7k9q2/`.

---

## Database

### `models/ChatSession.ts` — MongoDB
```typescript
{
  sessionId: string;          // UUID, unique indexed
  messages: { role, content, at }[];
  pendingInquiry: {           // guided flow state
    stage: "name"|"email"|"qty"|"done";
    slug?: string;
    machineName?: string;
    name?: string;
    email?: string;
    qty?: number;
  } | null;
  createdAt: Date;            // TTL index: auto-deletes after 7 days
}
```

### `models/Inquiry.ts` — MongoDB
Created by both the contact form and ASHA's guided inquiry flow. Source-tracked (`"direct"` vs chat).

### `lib/inquiries.ts`
Shared logic: validates input, saves to MongoDB, sends admin notification email via Resend. Used by both the contact form route and the chat route.

---

## Key Files

| File | Purpose |
|---|---|
| `components/ChatWidget.tsx` | Chat UI — panel, messages, cards, charts, quick replies |
| `app/api/chat/route.ts` | POST/GET endpoints for chat messages |
| `app/api/chat/machines/route.ts` | GET machine summaries for card/chart rendering |
| `lib/openrouter.ts` | OpenRouter LLM client with retry + timeout |
| `lib/localAgent.ts` | Rule-based fallback engine (no API key needed) |
| `lib/chatKnowledge.ts` | Catalogue context builder for LLM system prompt |
| `lib/grok.ts` | xAI Grok client (available, not wired) |
| `lib/inquiries.ts` | Shared inquiry creation (form + chat) |
| `models/ChatSession.ts` | Chat session Mongoose schema |
| `data/products.json` | Full machine catalogue |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM |
| `OPENROUTER_MODEL` | Model override (default: `liquid/lfm-2.5-1.2b-instruct:free`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `RESEND_API_KEY` | Email sending (inquiry notifications) |
| `ADMIN_EMAIL` / `INQUIRY_NOTIFY_EMAIL` | Where inquiry notifications go |
| `GROK_API_KEY` | xAI key (optional, for Grok) |
| `GROK_MODEL` | Grok model (default: `grok-4-fast`) |

---

## Extending / Modifying

- **Add a new machine** → edit `data/products.json`. Available to ASHA immediately — no ingestion step.
- **Add a new intent pattern** → edit `lib/localAgent.ts` (add keyword lists + handler).
- **Change LLM model** → set `OPENROUTER_MODEL` env var, or edit the `FALLBACK_MODELS` array.
- **Wire up Grok** → update `app/api/chat/route.ts` to call `grokChat()` or `streamGrokChat()`.
- **Change chat UI** → `components/ChatWidget.tsx` — all styles are co-located `<style jsx>`.
````

## File: CLAUDE.md
````markdown
n# Project Context

This is a design- and frontend-focused project.

## Available skills

Skills live in `.claude/skills/`. Prefer them when relevant:

- Building or restyling UI → `frontend-design`, `canvas-design`
- Working with a design system → `design-system`
- Reviewing a design → `design-critique`, `accessibility-review`
- Shipping to engineering → `design-handoff`
- Writing interface text → `ux-copy`
- Understanding users → `user-research`, `research-synthesis`
- Authoring new skills → `skill-creator`

## Conventions

(Add your stack, coding standards, and project-specific notes here.)
````

## File: install-extra-skills.sh
````bash
set -euo pipefail
echo "Installing extra skills via claude-code-templates..."
SKILLS=(
  "development/senior-prompt-engineer"
  "development/react-best-practices"
  "development/nextjs-best-practices"
  "scientific/generate-image"
)
for s in "${SKILLS[@]}"; do
  echo ">>> $s"
  npx claude-code-templates@latest --skill "$s"
done
echo "Done. Verify with: ls .claude/skills"
````

## File: next-env.d.ts
````typescript

````

## File: PRODUCT.md
````markdown
# Product

## Register

brand

## Users

Factory owners, production managers, and international importers who buy plastic film blowing machines, bag making machines, and recycling/lab lines. They are B2B buyers doing serious procurement research — evaluating specs, lead times, and after-sale support before committing to large capital equipment purchases. Context: desktop-first, often comparing multiple suppliers, trust-sensitive.

## Product Purpose

CX Machinery is a Chinese manufacturer of industrial plastic processing equipment (film blowing lines, bag making machines, recycling lines). The site exists to convert procurement researchers into qualified leads. Success = a filled contact/inquiry form or a direct email/call.

## Brand Personality

Precise, reliable, industrial authority. Three words: **Engineered. Proven. Supported.** The engineering grid, Bebas Neue display type, and crimson red accent already carry this identity — the site should feel like a serious manufacturer's catalogue, not a startup or a generic importer site.

## Anti-references

- Generic AliExpress/made-in-china.com style: cluttered, low contrast, badge-heavy
- Soft SaaS "warm cream + rounded cards" aesthetic
- Flashy consumer-electronics dark mode for the sake of it

## Design Principles

1. **Trust through precision** — every detail (specs, tolerances, service steps) should feel exact and verifiable, not marketing-fluffy.
2. **Engineering grid as DNA** — the 80px grid, mono type, and crimson accent are the visual language; don't dilute them.
3. **Hierarchy earns attention** — big headings are a promise; the body text under them must deliver substance.
4. **Spaciousness signals quality** — cramped layouts read as cheap; generous whitespace signals a manufacturer confident in their product.
5. **Service is a differentiator** — the inquiry-to-lifetime-support flow is a genuine competitive advantage; present it with the weight it deserves.

## Accessibility & Inclusion

WCAG 2.1 AA minimum. Reduced motion support required (existing `prefers-reduced-motion` rules in globals.css). Primary audience may include non-native English speakers — keep copy clear and direct.
````

## File: README.md
````markdown
# CX Machinery — product website

A data-driven **Next.js (App Router)** site for a plastic film & bag-making
machinery manufacturer. Every model and spec table from the source deck is
typed in `lib/products.ts` and rendered consistently across the catalogue.

## Run it

```bash
npm install     # needs internet (pulls Next, React, three.js, fonts)
npm run dev     # http://localhost:3000
```

> The build was assembled offline, so dependencies aren't installed yet —
> `npm install` is required on first run.

## What's inside

| Route | Page |
|-------|------|
| `/` | Home — 3D blown-film hero, production-pipeline overview, flagship line, full family index |
| `/products` | Catalogue index grouped by production stage |
| `/products/[category]` | Category page with every family's full bilingual spec table |
| `/contact` | Quote-request form (front-end only — wire up to your mail/form service) |

Categories: `film-blowing`, `bag-making`, `recycling`.

## Design

- **Palette:** graphite + steel with a single molten-orange accent (extrusion heat)
- **Type:** Saira (display) · Inter (body) · IBM Plex Mono (spec data & model codes)
- **Signature:** a procedural blown-film "bubble" rendered in react-three-fiber,
  plus a dimension-tick motif. It's decorative and code-generated — swap in real
  GLB exports from your SketchUp/CAD models for a true product viewer later.

## Editing the catalogue

All product data lives in **`lib/products.ts`**. Add or edit a `ProductFamily`
object (series, name, models, specs) and every page updates automatically.

## Before launch — replace placeholders

- `BRAND` constant in `lib/products.ts` (currently "CX Machinery")
- Contact email / phone in `app/contact/page.tsx` and the footer
- Some bag-making families had no model code in the source deck; they're
  labelled by bag width — confirm the real model numbers.
- Wire the contact form to a real handler (e.g. Formspree, Resend, an API route).

## .claude/

The `.claude/skills/` folder carries the design skills bundled earlier and is
unrelated to the running app. `install-extra-skills.sh` fetches the remaining
community skills on a machine with internet + Node.


## Machine images

Real product renders were extracted from your source deck into
`public/machines/` — one per family, named to match its slug
(`public/machines/<family-slug>.png`). They appear in:

- the **hero** (flagship tower, bag line, recycling line — crossfading on scroll)
- the **gallery** band and **spec callouts** on the home page
- every **family card** and beside every **spec table** on the catalogue pages

For production, consider converting them to **WebP** (~60% smaller) and updating
the `/machines/*.png` references, or swap to `next/image` for automatic optimization.
````

## File: repomix.config.json
````json
{
  "output": {
    "filePath": ".agents/context/repomix-output.md",
    "style": "markdown",
    "compress": true,
    "removeComments": true,
    "removeEmptyLines": true,
    "topFilesLen": 10,
    "showLineNumbers": false
  },
  "ignore": {
    "useGitignore": true,
    "customPatterns": [
      "data/products*.json",
      "messages/*.json",
      "data/news*.json",
      "app/data/news*.json",
      ".agents/**",
      ".claude/**",
      ".impeccable/**",
      "*.zip",
      "*.pdf",
      "*.jpeg",
      "*.jpg",
      "*.png",
      "*.svg",
      "*.ico",
      "*.mp4",
      "*.webp",
      ".next/**",
      "package-lock.json",
      "tsconfig.tsbuildinfo",
      "shots/**",
      ".scratch*",
      "node_modules/**"
    ]
  },
  "security": {
    "enableSecurityCheck": true
  }
}
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "vectrol-twisting-tower", "vectrol-twisting-tower (2)"]
}
````

## File: app/[locale]/account/login/page.tsx
````typescript
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, ArrowLeft } from "lucide-react";
⋮----
async function submit(e: React.FormEvent)
⋮----
onChange=
````

## File: app/[locale]/inquiries/page.tsx
````typescript
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
````

## File: app/[locale]/legal/LegalClient.tsx
````typescript
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/useScrollReveal";
⋮----
type SectionKey = "privacy" | "terms";
⋮----
function useSectionList(t: (key: string) => string, prefix: SectionKey, count: number)
````

## File: app/[locale]/production-line/ProductionLineClient.tsx
````typescript
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { families, familiesByCategory, familyImage, categories, type ProductFamily, type CategorySlug } from "@/lib/products";
import { getVisitorSessionId } from "@/lib/clientSession";
import { lineTemplates, lineTemplateById, type LineTemplate } from "@/lib/productionLineTemplates";
import { evaluateLineStatus, type LineStatus } from "@/lib/lineStatus";
import LineTemplateShowcase from "@/components/LineTemplateShowcase";
import TransitionLink from "@/components/TransitionLink";
import {
  Field, Section, EntryRow, AddAnotherButton,
  InsightPanel, ReviewCard, ImageGallery, LineSummaryCard, chatStyles, type ReviewRow, type SummaryMachine,
} from "@/components/ChatInquiry";
import AiReviewChat from "@/components/AiReviewChat";
⋮----
interface MachineEntry {
  family: ProductFamily;
  modelIdx: number;
  qty: number;
  notes: string;
  stage?: string;
}
interface PartEntry {
  name: string;
  machine: string;
  machineSlug: string;
  quantity: number;
  notes: string;
  images: string[];
}
interface FormData {
  name: string; company: string; email: string; phone: string; country: string; message: string;
}
⋮----
type View = "hub" | "template" | "custom";
type CustomStep = "process" | "machine" | "ai-review" | "summary" | "details";
⋮----
function goTo(next: View, tpl?: LineTemplate)
⋮----
function addMachine()
⋮----
// move to the next chosen process stage automatically, or on to AI
// review once every stage the visitor picked in step 1 has a machine
⋮----
function removeMachine(i: number)
⋮----
function categoryLabel(slug: CategorySlug): string
⋮----
function toggleProcessCategory(slug: CategorySlug)
⋮----
function startMachineWizard()
⋮----
function wizardBack()
⋮----
async function uploadPartImage(file: File)
function addPart()
function removePart(i: number)
⋮----
// ── AI review chat callbacks ──────────────────────────────────────────
function aiAddMachine(slug: string)
function aiEditMachineQty(index: number, qty: number)
function aiEditMachineNotes(index: number, notes: string)
function aiAddPart(name: string)
⋮----
async function uploadImage(file: File)
⋮----
function applyTemplate(tpl: LineTemplate)
⋮----
async function send()
⋮----
function backToHub()
⋮----
<Image src=
⋮----
<Field label=
⋮----
<Section title=
⋮----
meta=
⋮----
<button type="button" className="ci-submit-bar__btn" disabled=
⋮----
<input type="text" value=
⋮----
<input type="email" value=
⋮----
onRemove=
⋮----
onClick=
⋮----
title=
⋮----
machines.length === 0 ?
canReview ?
````

## File: app/[locale]/tools/extrusion-calculator/page.tsx
````typescript
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ExtrusionCalculator from "@/components/ExtrusionCalculator";
import { pageMetadata } from "@/lib/seo";
⋮----
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata>
⋮----
export default function ExtrusionCalculatorPage()
````

## File: app/[locale]/loading.tsx
````typescript
export default function Loading()
````

## File: app/api/account/logout/route.ts
````typescript
import { NextResponse } from "next/server";
import { CUSTOMER_SESSION_COOKIE } from "@/lib/customerAuth";
⋮----
export async function POST()
````

## File: app/api/account/me/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { verifyCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/customerAuth";
⋮----
export async function GET(req: NextRequest)
````

## File: app/api/account/verify/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyLoginToken, createCustomerSessionToken, CUSTOMER_SESSION_COOKIE, customerSessionCookieOptions } from "@/lib/customerAuth";
⋮----
function localePath(locale: string, path: string): string
⋮----
export async function GET(req: NextRequest)
````

## File: app/api/admin/analytics/session/[sessionId]/hook-email/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/emailTemplate";
⋮----
function escapeHtml(s: string)
⋮----
// Auth is enforced by middleware for all /api/admin/* routes.
export async function POST(req: NextRequest,
````

## File: app/api/admin/analytics/session/[sessionId]/insight/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession, { type PageViewEntry } from "@/models/VisitorSession";
import ChatSession, { type ChatMessageDoc } from "@/models/ChatSession";
import { groqJsonCompletion } from "@/lib/groq";
import { formatDuration } from "@/lib/format";
⋮----
export async function POST(req: NextRequest,
````

## File: app/api/admin/analytics/session/[sessionId]/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession from "@/models/VisitorSession";
import ChatSession from "@/models/ChatSession";
⋮----
export async function GET(_req: NextRequest,
````

## File: app/api/admin/data/[section]/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { isCmsSection, readSection, writeSection } from "@/lib/cmsStore";
⋮----
export async function GET(_req: NextRequest,
⋮----
import { parseSessionToken, SESSION_COOKIE, MACHINE_MANAGER_SCHEMAS } from "@/lib/adminAuth";
⋮----
export async function PUT(req: NextRequest,
````

## File: app/api/admin/me/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/adminAuth";
⋮----
export async function GET(req: NextRequest)
````

## File: app/api/admin/settings/email/confirm/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { confirmEmailChange } from "@/lib/adminCredentials";
import { ADMIN_PATH } from "@/lib/adminAuth";
⋮----
function page(title: string, message: string, ok: boolean)
⋮----
export async function GET(req: NextRequest)
````

## File: app/api/admin/settings/password/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/lib/adminCredentials";
⋮----
export async function POST(req: NextRequest)
````

## File: app/api/content/[section]/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { isCmsSection, readSection } from "@/lib/cmsStore";
⋮----
export async function GET(_req: NextRequest,
````

## File: app/api/datasheet/[slug]/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { getMachineProductBySlug, getSiteMetadata } from "@/lib/machinesData";
import { families } from "@/lib/products";
⋮----
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
)
````

## File: app/api/inquiry-review/route.ts
````typescript
import { NextRequest } from "next/server";
import { families, type ProductFamily } from "@/lib/products";
import { groqJsonCompletion } from "@/lib/groq";
⋮----
interface OrderMachine { slug: string; name: string; series: string; model: string; qty: number; notes: string }
interface OrderPart { name: string; machine: string; quantity: number; notes: string }
interface ReviewMsg { role: "user" | "assistant"; content: string }
⋮----
interface Suggestion {
  type: "add_machine" | "edit_machine_qty" | "edit_machine_notes" | "add_part";
  slug?: string;
  index?: number;
  qty?: number;
  notes?: string;
  name?: string;
  reason: string;
}
⋮----
interface ReviewAnswer {
  text: string;
  suggestions: Suggestion[];
}
⋮----
function getApiKey(): string
⋮----
function buildOrderBlock(machines: OrderMachine[], parts: OrderPart[]): string
⋮----
function buildCatalogBlock(machines: OrderMachine[]): string
⋮----
const SYSTEM_PROMPT = (orderBlock: string, catalogBlock: string)
⋮----
function parseReviewJson(raw: string): ReviewAnswer | null
⋮----
async function callGroq(messages:
⋮----
async function callOpenRouter(messages:
⋮----
// 404 means this specific model id is gone/renamed — try the next model
// instead of aborting, since a retired free-tier model shouldn't take
// down the whole fallback chain. Only bail early on auth failures.
⋮----
export async function POST(req: NextRequest)
````

## File: app/api/lead-capture/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import { notifyLeadCaptured } from "@/lib/leadNotify";
⋮----
interface Body {
  sessionId?: string;
  email?: string;
  machineName?: string;
}
⋮----
export async function POST(req: NextRequest)
````

## File: app/robots.ts
````typescript
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/products";
⋮----
export default function robots(): MetadataRoute.Robots
````

## File: components/AiReviewChat.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { familyBySlug } from "@/lib/products";
⋮----
interface OrderMachine { slug: string; name: string; series: string; model: string; qty: number; notes: string }
interface OrderPart { name: string; machine: string; quantity: number; notes: string }
⋮----
interface Suggestion {
  type: "add_machine" | "edit_machine_qty" | "edit_machine_notes" | "add_part";
  slug?: string;
  index?: number;
  qty?: number;
  notes?: string;
  name?: string;
  reason: string;
}
⋮----
interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
  appliedKeys?: Set<number>;
}
⋮----
function suggestionLabel(s: Suggestion, t: ReturnType<typeof useTranslations>): string
⋮----
async function ask(history: ChatMsg[])
⋮----
function startReview()
⋮----
function send()
⋮----
function applySuggestion(msgIdx: number, sugIdx: number, s: Suggestion)
⋮----
onChange=
````

## File: components/AppToaster.tsx
````typescript
import { Toaster } from "sonner";
````

## File: components/ExtrusionCalculator.tsx
````typescript
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
⋮----
interface DensityPreset {
  name: string;
  density: number;
  desc: string;
}
⋮----
const handleCopyReport = () =>
````

## File: components/FooterWaterReflection.tsx
````typescript
import { useEffect, useRef } from "react";
⋮----
export default function FooterWaterReflection()
⋮----
function resize()
⋮----
function compile(type: number, src: string)
⋮----
function draw(t: number)
⋮----
function frame(t: number)
````

## File: components/JsonLd.tsx
````typescript
export default function JsonLd(
````

## File: components/LazyMount.tsx
````typescript
import { useEffect, useRef, useState, type ComponentType } from "react";
⋮----
interface Props<P extends object> {
  loader: () => Promise<{ default: ComponentType<P> }>;
  props?: P;
  rootMargin?: string;
}
⋮----
export default function LazyMount<P extends object>(
````

## File: components/LazyTrustSection.tsx
````typescript
import LazyMount from "@/components/LazyMount";
⋮----
export default function LazyTrustSection()
````

## File: components/MachineParts.tsx
````typescript
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionHead } from "@/components/EditorialKit";
import type { MachinePart } from "@/lib/products";
⋮----
<div className="pdv2-mp-thumbs" role="tablist" aria-label=
````

## File: components/MachineSeoSection.tsx
````typescript
import { useState } from "react";
import type { MachineSeoData } from "@/lib/products";
````

## File: components/ProcessIcon.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import {
  Building2, Zap, Wrench, Gauge, GraduationCap,
  ClipboardCheck, Factory, SearchCheck, Truck, Hammer, Ship,
  type LucideIcon,
} from "lucide-react";
⋮----
export type IconName =
  | "foundation" | "power" | "assembly" | "calibration" | "training"
  | "confirm" | "factory" | "inspect" | "shipping" | "install" | "freight"
  | "generic";
⋮----
export function resolveIcon(text: string): IconName
⋮----
export default function ProcessIcon(
````

## File: components/RollingNavMenu.tsx
````typescript
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import TransitionLink from "@/components/TransitionLink";
import { Info, Newspaper, Factory, Mail } from "lucide-react";
⋮----
interface NavItem {
  id: string;
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}
⋮----
const check = ()
⋮----
const updatePos = () =>
⋮----
const handleMouseEnter = () =>
⋮----
const handleMouseLeave = () =>
⋮----
const formatLabel = (key: string) =>
⋮----
onClick=
````

## File: components/TransitionLink.tsx
````typescript
import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";
⋮----
type Props = ComponentProps<typeof Link>;
⋮----
export default function TransitionLink(
````

## File: components/VideoFacade.tsx
````typescript
import { useState } from "react";
import Image from "next/image";
import type { MachineVideo } from "@/lib/machinesData";
⋮----
src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
````

## File: components/VisitorTracker.tsx
````typescript
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/track";
⋮----
export default function VisitorTracker()
⋮----
// client-side route change (App Router doesn't unload the page) — record
// the duration spent on the page we just left
⋮----
// tab hidden / real navigation away — flush the in-progress page's duration.
// A real unload typically fires both visibilitychange->hidden AND pagehide
// back to back; resetting enteredAtRef after every flush (instead of a
// one-shot guard) means a same-tick second flush measures ~0ms and gets
// dropped by the threshold below, instead of re-sending the same span twice.
⋮----
function flush()
function onVisibility()
````

## File: components/WispBackground.tsx
````typescript
import { useEffect, useRef } from "react";
⋮----
export default function WispBackground()
⋮----
function resize()
⋮----
function compile(type: number, src: string)
⋮----
function draw(t: number)
⋮----
function frame(t: number)
````

## File: data/printing-showcase.json
````json
{
  "items": [
    { "src": "/machines/flexo-2-nobg.png", "model": "AI-4C", "series": "4-Colour Press", "speed": "200 m/min", "reg": "±0.15 mm", "accent": "#e11d48", "hot": true },
    { "src": "/machines/flexo-1-nobg.png", "model": "AI-2C", "series": "2-Colour Press", "speed": "120 m/min", "reg": "±0.20 mm", "accent": "#e11d48" },
    { "src": "/machines/flexo-6c-nobg.png", "model": "AI-6C", "series": "6-Colour Press", "speed": "260 m/min", "reg": "±0.10 mm", "accent": "#e11d48" },
    { "src": "/machines/flexo-5-nobg.png", "model": "AI-8C", "series": "8-Colour Press", "speed": "350 m/min", "reg": "±0.10 mm", "accent": "#e11d48" }
  ]
}
````

## File: data/production-line-templates.json
````json
{
  "templates": [
    {
      "id": "retail-bag-line",
      "name": "Printed Retail Bag Line",
      "tagline": "Resin in, branded bags out — full-colour printing built into the line.",
      "heroImage": "/machines/flexo-6c-nobg.png",
      "bestFor": "Brands and retailers who need their logo, colours, or barcode printed directly on the bag.",
      "whyBest": [
        "6-colour flexo printing at 260 m/min keeps branding in-house instead of outsourcing to a print shop.",
        "±0.1 mm registration means small text and fine barcodes stay sharp at full production speed.",
        "Closed-loop pelletizing recovers edge trim and reject film back into resin, cutting material waste across the whole line.",
        "One continuous line from film to finished bag — fewer handoffs, less work-in-progress sitting between machines."
      ],
      "steps": [
        { "slug": "abcde-2200", "stage": "Film Extrusion", "role": "Resin is melted and blown into a 5-layer co-extruded film, 2,100 mm wide." },
        { "slug": "flexo-6c", "stage": "Flexo Printing", "role": "The film is printed in up to 6 colours at 260 m/min with ±0.1 mm registration." },
        { "slug": "t-pro-heatseal", "stage": "Bag Converting", "role": "Printed film is heat-sealed and cut into finished bags across multiple lanes." },
        { "slug": "cx-pelletizing", "stage": "Closed-Loop Recycling", "role": "Edge trim and reject bags are pelletized back into resin and fed to step one." }
      ]
    },
    {
      "id": "roll-bag-line",
      "name": "Roll Bag / Grocery Line",
      "tagline": "A simpler, lower-cost line for plain retail and grocery roll bags.",
      "heroImage": "/machines/rgb-rollbag.png",
      "bestFor": "Grocery, produce, and retail roll bags where speed and cost matter more than printed branding.",
      "whyBest": [
        "No printing stage — lower equipment cost and simpler operation than a full printed line.",
        "Inline perforation and automatic core-cutting produce retail-ready rolls with no manual finishing.",
        "Fewer machines means a smaller footprint and faster line commissioning on-site.",
        "The same closed-loop pelletizing recovers scrap film into resin, so the line still keeps material waste down."
      ],
      "steps": [
        { "slug": "abcde-2200", "stage": "Film Extrusion", "role": "Resin is melted and blown into a 5-layer co-extruded film, 2,100 mm wide." },
        { "slug": "rgb-rollbag", "stage": "Roll Winding", "role": "Film is perforated and wound onto rolls with automatic core-cutting for retail-ready packs." },
        { "slug": "cx-pelletizing", "stage": "Closed-Loop Recycling", "role": "Edge trim and scrap film are pelletized back into resin and fed to step one." }
      ]
    }
  ]
}
````

## File: data/site-seo-matrix.json
````json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "site": {
    "name": "Ashal Innomech",
    "legalName": "Wenzhou Ashal Innomech Technology Co., Ltd.",
    "url": "https://ashalinnomech.com",
    "logo": "https://ashalinnomech.com/logo.jpeg",
    "foundingYear": 2008,
    "address": {
      "city": "Wenzhou",
      "province": "Zhejiang",
      "country": "China"
    },
    "certifications": ["ISO 9001:2015", "CE Mark", "SGS Verified"],
    "exportCountriesCount": 80,
    "support": "24/7 Technical Service & On-Site Installation"
  },
  "pages": {
    "home": {
      "pageId": "home",
      "path": "/",
      "title": "Industrial Machinery Manufacturer | Ashal Innomech Wenzhou",
      "description": "High-performance blown film, bag making, flexo printing, and recycling extruders — engineered for continuous 24/7 industrial production worldwide.",
      "keywords": [
        "blown film extrusion line",
        "bag making machine manufacturer",
        "flexo printing press",
        "plastic recycling pelletizing machine",
        "Wenzhou industrial machinery",
        "heavy duty film blowing plant"
      ],
      "seo": {
        "h1": "BUILT FOR THE FLOOR. PROVEN WORLDWIDE.",
        "canonical": "https://ashalinnomech.com",
        "ogImage": "https://ashalinnomech.com/machines/hero-preview.png"
      },
      "geo": {
        "entityName": "Ashal Innomech Industrial Extrusion & Converting Equipment",
        "factualSummary": "Ashal Innomech is an ISO 9001:2015 certified manufacturer of high-performance blown film extruders, automatic bag making machines, flexographic printing presses, and recycling lines in Wenzhou, China. Serving over 80 countries worldwide with 24/7 technical support and rapid spare parts dispatch.",
        "citations": [
          "ISO 9001:2015 Quality Management Certified Factory",
          "CE Certified Electrical & Safety Controls",
          "Exported to 80+ Countries Across Americas, Europe, Asia, Africa",
          "24-Hour Express Inquiry Response Guarantee"
        ],
        "schemaType": "Organization"
      },
      "aeo": {
        "question": "Who is Ashal Innomech and what industrial machinery do they manufacture?",
        "directAnswer": "Ashal Innomech is a premier industrial machinery manufacturer based in Wenzhou, China, specializing in high-speed ABA 3-layer blown film extruders, automatic servo bag making machines, 2-8 color flexo printing presses, and plastic recycling pelletizing systems.",
        "bulletKeyPoints": [
          "Output capacity up to 450 kg/hr for blown film lines",
          "Bag making cycle speeds up to 250 bags per minute",
          "Full turn-key production line design and factory layout service",
          "24/7 remote diagnostic support and global engineer dispatch"
        ]
      }
    },
    "products": {
      "pageId": "products",
      "path": "/products",
      "title": "Industrial Plastic Packaging Machinery Catalogue | Ashal Innomech",
      "description": "Explore our full catalogue of blown film lines, automatic bag makers, flexographic printers, and eco recycling pelletizers with complete engineering specs.",
      "keywords": [
        "plastic machinery catalogue",
        "extrusion equipment supplier",
        "bag making machine price",
        "flexo press technical specifications",
        "recycling extruder models"
      ],
      "seo": {
        "h1": "INDUSTRIAL MACHINERY CATALOGUE",
        "canonical": "https://ashalinnomech.com/products",
        "ogImage": "https://ashalinnomech.com/machines/catalogue-og.png"
      },
      "geo": {
        "entityName": "Ashal Machinery Catalogue & Equipment Range",
        "factualSummary": "Comprehensive machinery catalogue comprising four core divisions: Blown Film Extrusion (ABA 3-layer & mono-layer), Bag Converting (t-shirt, side-seal, roll bags), Flexographic Printing (2, 4, 6, 8 color), and Plastic Recycling (water-ring & strand pelletizers).",
        "citations": [
          "Precision CNC machined components with strict tolerance standards",
          "Energy efficient inverter drives reducing kWh per kg processing cost",
          "Modular configuration options for tailored factory requirements"
        ],
        "schemaType": "ItemList"
      },
      "aeo": {
        "question": "What categories of machinery are available in the Ashal Innomech catalogue?",
        "directAnswer": "Ashal Innomech provides four main categories: 1) Blown Film Extrusion Lines, 2) Automatic Bag Making Machines, 3) Flexographic Printing Presses, and 4) Plastic Recycling Pelletizing Lines.",
        "bulletKeyPoints": [
          "Blown Film: 300mm - 2500mm film width capabilities",
          "Bag Making: Servo-driven precise length registration",
          "Flexo Printing: High-definition 150 LPI printing capability",
          "Recycling: Heavy duty granulators with dual degasser barrels"
        ]
      }
    },
    "film-blowing": {
      "pageId": "film-blowing",
      "path": "/products/film-blowing",
      "title": "Blown Film Extrusion Lines | Single & Multi-Layer Extruders",
      "description": "High-output ABA 3-layer & mono-layer blown film extruders for HDPE, LDPE, LLDPE, and bio-resins with rotary die heads & automatic winders.",
      "keywords": [
        "blown film extruder",
        "ABA 3 layer blown film machine",
        "HDPE LDPE film blowing machine",
        "co-extrusion film line",
        "rotary die head extruder",
        "biodegradable film extrusion"
      ],
      "seo": {
        "h1": "BLOWN FILM EXTRUSION LINES",
        "canonical": "https://ashalinnomech.com/products/film-blowing",
        "ogImage": "https://ashalinnomech.com/machines/film-blowing-og.png"
      },
      "geo": {
        "entityName": "Ashal ABA 3-Layer & Mono-Layer Blown Film Extruders",
        "factualSummary": "Ashal blown film extruders feature bimetallic alloy screws, automatic IBC cooling systems, rotating die heads, and dual-station friction winders. Ideal for producing carrier bags, agricultural film, shrink film, and industrial packaging.",
        "citations": [
          "Saves up to 30% resin cost using recycled calcium carbonate in center core layer",
          "Bimetallic barrel lifetime exceeding 30,000 operating hours",
          "Precision thickness tolerance within ±3% with automatic air ring"
        ],
        "schemaType": "Product"
      },
      "aeo": {
        "question": "How does an ABA 3-layer blown film machine save raw material cost?",
        "directAnswer": "An ABA 3-layer blown film extruder uses two extruders to feed a 3-layer die. The outer 'A' layers use virgin resin for strength and printability, while the inner 'B' core layer incorporates up to 40% recycled material or CaCO3 filler, reducing overall resin expenditure while preserving film integrity.",
        "bulletKeyPoints": [
          "Inner core (B layer): Accepts lower-cost recycled pellets or CaCO3 masterbatch",
          "Outer surfaces (A layers): Premium virgin polymer for smooth seal & print finish",
          "Output capacity: 80 kg/h to 450 kg/h depending on screw diameter"
        ]
      }
    },
    "bag-making": {
      "pageId": "bag-making",
      "path": "/products/bag-making",
      "title": "Automatic Bag Making Machines | Heat-Seal & Bottom-Seal",
      "description": "High-speed servo-driven automatic bag making machines for T-shirt bags, side-seal pouches, bottom-seal sacks, and garbage roll bags.",
      "keywords": [
        "bag making machine",
        "t-shirt bag making machine",
        "side seal pouch machine",
        "bottom seal heavy duty bag machine",
        "automatic roll bag machine",
        "servo bag converter"
      ],
      "seo": {
        "h1": "AUTOMATIC BAG MAKING MACHINERY",
        "canonical": "https://ashalinnomech.com/products/bag-making",
        "ogImage": "https://ashalinnomech.com/machines/bag-making-og.png"
      },
      "geo": {
        "entityName": "Ashal High-Speed Servo Bag Making Lines",
        "factualSummary": "Ashal bag making machines integrate Yaskawa/Panasonic servo control, Panasonic photocell color tracking, heavy-duty flying knives, and hydraulic automatic punchers to deliver rapid seal-and-cut operations for all commercial bag formats.",
        "citations": [
          "Production speeds reaching 250 bags per minute per lane",
          "Precision sealing temperature digital PID control ±1°C",
          "Zero-defect photocell registration for pre-printed film rolls"
        ],
        "schemaType": "Product"
      },
      "aeo": {
        "question": "What is the production speed of Ashal automatic bag making machines?",
        "directAnswer": "Ashal automatic bag making machines achieve speeds up to 250 bags per minute for T-shirt carrier bags and up to 180 pcs/min for heavy-duty bottom-seal bags, utilizing high-precision servo drives and auto-punching units.",
        "bulletKeyPoints": [
          "Formats: T-Shirt Bags, Flat Bags, Garbage Roll Bags, Side-Seal Pouches",
          "Film thickness range: 0.008mm to 0.15mm per layer",
          "Automated stack conveyor & pneumatic waste ejector"
        ]
      }
    },
    "printing": {
      "pageId": "printing",
      "path": "/products/printing",
      "title": "Flexographic Printing Machinery | 2 to 8 Color Presses",
      "description": "Precision 2-color, 4-color, 6-color, and 8-color stack and CI flexographic printing presses for plastic film and paper substrate printing.",
      "keywords": [
        "flexo printing machine",
        "stack flexo printing press",
        "CI flexo printing machine",
        "2 color flexo printer",
        "4 color flexo printer",
        "film printing press china"
      ],
      "seo": {
        "h1": "FLEXOGRAPHIC PRINTING PRESSES",
        "canonical": "https://ashalinnomech.com/products/printing",
        "ogImage": "https://ashalinnomech.com/machines/printing-og.png"
      },
      "geo": {
        "entityName": "Ashal Precision Flexographic Printing Machinery",
        "factualSummary": "Ashal flexographic printers utilize ceramic anilox rollers, doctor blade ink systems, synchronous belt transmission, and 360-degree continuous longitudinal registration. Designed for solvent-based and water-based ink applications.",
        "citations": [
          "Ceramic anilox roller line count options: 200 LPI to 800 LPI",
          "Registration precision tolerance: ±0.15mm",
          "Drying system: Electric blower + central hot-air recirculating duct"
        ],
        "schemaType": "Product"
      },
      "aeo": {
        "question": "What registration accuracy do Ashal flexographic printing presses achieve?",
        "directAnswer": "Ashal flexo printing presses achieve a registration accuracy of ±0.15mm with 360-degree motorized longitudinal adjustment, enabling high-definition multi-color printing on plastic films and paper up to 100 meters per minute.",
        "bulletKeyPoints": [
          "Color options: 2-color, 4-color, 6-color, 8-color configurations",
          "Substrates: HDPE, LDPE, LLDPE, PP, PET, Paper, Non-woven fabric",
          "Ceramic anilox roller for uniform ink distribution and rapid cleanup"
        ]
      }
    },
    "recycling": {
      "pageId": "recycling",
      "path": "/products/recycling",
      "title": "Plastic Recycling & Pelletizing Lines | Industrial Granulators",
      "description": "Heavy-duty plastic recycling pelletizers and granulating extruders for processing post-industrial PE, PP, film scrap, and rigid waste.",
      "keywords": [
        "plastic recycling machine",
        "film scrap pelletizing line",
        "plastic granulator extruder",
        "water ring pelletizing system",
        "PE PP plastic recycling machine",
        "waste plastic recycler china"
      ],
      "seo": {
        "h1": "PLASTIC RECYCLING & PELLETIZING LINES",
        "canonical": "https://ashalinnomech.com/products/recycling",
        "ogImage": "https://ashalinnomech.com/machines/recycling-og.png"
      },
      "geo": {
        "entityName": "Ashal Eco-Pelletizing Plastic Recycling Systems",
        "factualSummary": "Ashal recycling extruders combine compactor-cutter shredders, double-degassing vacuum vents, non-stop hydraulic screen changers, and water-ring pelletizing dies to transform post-industrial waste film directly into clean, uniform plastic granules.",
        "citations": [
          "Processing capacity: 150 kg/h to 800 kg/h",
          "Dual vacuum degassing ports for moisture and ink removal",
          "Hydraulic dual-piston screen changer for continuous filtration without downtime"
        ],
        "schemaType": "Product"
      },
      "aeo": {
        "question": "How does the compactor pelletizing system work in plastic recycling extruders?",
        "directAnswer": "The compactor pelletizing system pre-shreds, warms, and densifies soft plastic film waste using high-speed rotating blades before feeding it directly into the extruder barrel. This eliminates manual pre-cutting and maintains constant extrusion pressure.",
        "bulletKeyPoints": [
          "Eliminates pre-crushing step for film rolls and loose scrap",
          "Uniform pellet size: 3mm - 4mm sphere/cylinder granules",
          "Low energy consumption per ton of recycled polymer"
        ]
      }
    },
    "production-line": {
      "pageId": "production-line",
      "path": "/production-line",
      "title": "Interactive Production Line Architect | Plant ROI & Flow Builder",
      "description": "Design and calculate complete turnkey film blowing, printing, bag making, and recycling plant configurations with instant output estimates.",
      "keywords": [
        "production line builder",
        "turnkey extrusion plant design",
        "plastic manufacturing plant calculator",
        "factory layout planning tool"
      ],
      "seo": {
        "h1": "PRODUCTION LINE ARCHITECT",
        "canonical": "https://ashalinnomech.com/production-line",
        "ogImage": "https://ashalinnomech.com/machines/builder-og.png"
      },
      "geo": {
        "entityName": "Ashal Turnkey Factory Layout & Line Architect",
        "factualSummary": "Interactive engineering tool allowing factory owners to select raw material inputs, target bag dimensions, and hourly output requirements to generate an optimized equipment line recommendation with energy consumption metrics.",
        "citations": [
          "Calculates total kW connected load and floor space footprint",
          "Generates custom B2B turnkey proposal datasheets"
        ],
        "schemaType": "WebApplication"
      },
      "aeo": {
        "question": "How to plan a complete blown film and bag manufacturing plant?",
        "directAnswer": "To plan a complete packaging plant, connect a Blown Film Extruder to produce film rolls, an inline or offline Flexo Printer for branding, an Automatic Bag Making Machine for converting, and a Recycling Pelletizer to process trim scrap back into production.",
        "bulletKeyPoints": [
          "Step 1: Extrusion (Resin to Film Roll)",
          "Step 2: Flexo Printing (Multi-Color Graphics)",
          "Step 3: Bag Converting (Sealing & Die Punching)",
          "Step 4: Recycling (Edge Trim Repelletization)"
        ]
      }
    },
    "about": {
      "pageId": "about",
      "path": "/about",
      "title": "About Ashal Innomech | ISO 9001 Certified Machinery Factory",
      "description": "Learn about Ashal Innomech's 25,000m² manufacturing facility in Wenzhou, advanced CNC engineering precision, quality control, and global export heritage.",
      "keywords": [
        "Ashal Innomech company profile",
        "Wenzhou machinery factory",
        "industrial machinery exporter china",
        "ISO 9001 plastic machinery manufacturer"
      ],
      "seo": {
        "h1": "ENGINEERING EXCELLENCE. WORLDWIDE TRUST.",
        "canonical": "https://ashalinnomech.com/about",
        "ogImage": "https://ashalinnomech.com/machines/factory-about.png"
      },
      "geo": {
        "entityName": "Wenzhou Ashal Innomech Manufacturing Plant",
        "factualSummary": "Ashal Innomech operates a modern 25,000 square meter production facility equipped with Japanese Mazak CNC machining centers, CMM inspection tools, and dynamic balancing rigs, adhering to ISO 9001 quality standards.",
        "citations": [
          "Over 18 years of continuous industrial machine design",
          "Dedicated R&D engineering team holding multiple technical patents",
          "On-site factory inspection and video testing before dispatch"
        ],
        "schemaType": "AboutPage"
      },
      "aeo": {
        "question": "Where is Ashal Innomech located and what are its manufacturing credentials?",
        "directAnswer": "Ashal Innomech is located in Wenzhou, Zhejiang Province, China. The factory covers 25,000 square meters, holds ISO 9001:2015 quality certification and CE safety compliance, and exports to over 80 countries worldwide.",
        "bulletKeyPoints": [
          "Factory footprint: 25,000 m² state-of-the-art facility",
          "Machining: High-precision 5-axis CNC equipment",
          "Testing: 72-hour continuous trial run before customer delivery"
        ]
      }
    },
    "inquiries": {
      "pageId": "inquiries",
      "path": "/inquiries",
      "title": "Request a Machinery Quote & RFQ | 24H Factory Support",
      "description": "Submit a Request for Quote (RFQ) directly to Ashal Innomech engineers for custom blown film lines, bag makers, flexo printers, or recycling plants.",
      "keywords": [
        "request machinery quote",
        "plastic machine price inquiry",
        "extrusion line quote china",
        "RFQ bag making machine"
      ],
      "seo": {
        "h1": "REQUEST A DIRECT FACTORY QUOTE",
        "canonical": "https://ashalinnomech.com/inquiries",
        "ogImage": "https://ashalinnomech.com/machines/rfq-og.png"
      },
      "geo": {
        "entityName": "Ashal Innomech B2B Inquiry & Quotation Desk",
        "factualSummary": "Direct sales & engineering response portal providing official factory quotations, FOB/CIF freight estimates, technical layout drawings, and proforma invoices within 24 hours.",
        "citations": [
          "24-Hour guaranteed response SLA for all commercial RFQs",
          "Multi-lingual sales support in English, Arabic, Hindi, Spanish, and Russian"
        ],
        "schemaType": "ContactPage"
      },
      "aeo": {
        "question": "How quickly does Ashal Innomech respond to custom machinery quote requests?",
        "directAnswer": "Ashal Innomech provides official commercial quotes, technical specifications, and factory delivery estimates within 24 hours of receiving an RFQ submission.",
        "bulletKeyPoints": [
          "Includes technical parameters & power requirements",
          "FOB / CIF port shipping calculations",
          "Customized payment terms & LC acceptance"
        ]
      }
    },
    "faq": {
      "pageId": "faq",
      "path": "/faq",
      "title": "Machinery Technical FAQ & Knowledge Base | Ashal Innomech",
      "description": "Expert answers to common questions regarding extrusion screw setup, film thickness control, bag sealing temperatures, and preventative maintenance.",
      "keywords": [
        "blown film extrusion FAQ",
        "bag machine troubleshooting",
        "flexo print setup guide",
        "plastic machinery technical advice"
      ],
      "seo": {
        "h1": "TECHNICAL KNOWLEDGE BASE & FAQ",
        "canonical": "https://ashalinnomech.com/faq",
        "ogImage": "https://ashalinnomech.com/machines/faq-og.png"
      },
      "geo": {
        "entityName": "Ashal Industrial Machinery Knowledge Repository",
        "factualSummary": "Comprehensive technical resource detailing operating procedures, resin viscosity adjustments, heating zone calibration, and maintenance intervals for blown film, bag making, flexo printing, and recycling machinery.",
        "citations": [
          "Verified by Senior Mechanical Engineering Division",
          "Covers troubleshooting for HDPE, LDPE, LLDPE, PP, and PLA resins"
        ],
        "schemaType": "FAQPage"
      },
      "aeo": {
        "question": "How to prevent thickness variation in blown film extrusion?",
        "directAnswer": "To prevent thickness variation in blown film extrusion: 1) Clean the die lip gap using brass scrapers, 2) Verify dual-lip air ring airflow uniformity, 3) Ensure stable barrel heating zone temperatures, and 4) Check resin melt homogeneity.",
        "bulletKeyPoints": [
          "Check air ring levelness and blower damper position",
          "Verify melt temperature and pressure sensors",
          "Clean die head every 3-6 months depending on resin purity"
        ]
      }
    },
    "tools": {
      "pageId": "tools",
      "path": "/tools/extrusion-calculator",
      "title": "Industrial Extrusion Output & Energy Calculator | Ashal",
      "description": "Calculate hourly kilogram throughput, power consumption (kWh/kg), and estimated ROI for blown film and recycling extruders.",
      "keywords": [
        "extrusion output calculator",
        "plastic machine energy calculator",
        "film blowing throughput formula",
        "extruder payback calculator"
      ],
      "seo": {
        "h1": "EXTRUSION OUTPUT & ENERGY CALCULATOR",
        "canonical": "https://ashalinnomech.com/tools/extrusion-calculator",
        "ogImage": "https://ashalinnomech.com/machines/calculator-og.png"
      },
      "geo": {
        "entityName": "Ashal Industrial Extrusion Engineering Calculator",
        "factualSummary": "Calculates theoretical vs. practical extrusion output based on screw diameter (L/D ratio), melt density, RPM, motor power rating, and heating zone consumption.",
        "citations": [
          "Accurate within ±4% of real-world factory production floor results"
        ],
        "schemaType": "WebApplication"
      },
      "aeo": {
        "question": "How do you calculate output capacity in a blown film extruder?",
        "directAnswer": "Extrusion output is calculated using the formula: Output (kg/h) = K × Screw Diameter² (mm) × Screw Speed (RPM) × Polymer Density (g/cm³), adjusted by the L/D ratio and motor power efficiency.",
        "bulletKeyPoints": [
          "50mm screw: ~60 - 90 kg/h output",
          "55mm screw: ~90 - 130 kg/h output",
          "65mm screw: ~140 - 220 kg/h output"
        ]
      }
    }
  }
}
````

## File: docs/B2B_DIRECTORY_OUTREACH_STRATEGY.md
````markdown
# B2B Directory & International Citation Outreach Strategy
**Wenzhou Ashal Innomach Technology Co., Ltd. (https://www.wzashal.com)**

---

## 1. Core NAP (Name, Address, Phone) Standard

To maximize off-page Technical SEO, Google Knowledge Graph recognition, and local search authority, all external trade directory profiles, business listings, and B2B portals MUST maintain exact Name, Address, and Phone (NAP) consistency.

| Parameter | Standard Listing Specification |
|---|---|
| **Full Legal Company Name** | Wenzhou Ashal Innomach Technology Co., Ltd. |
| **Short / Brand Name** | Ashal Innomach / WZ Ashal |
| **Street Address** | Ruian Industrial Zone, Wenzhou |
| **City, Province** | Wenzhou, Zhejiang Province |
| **Postal Code** | 325200 |
| **Country** | China |
| **Primary Phone / WhatsApp** | +86 159 8877 5831 |
| **Engineering Support Email** | ashal@ashalinnomech.com |
| **Canonical Website URL** | `https://www.wzashal.com` |
| **Primary Category** | Packaging Machinery Manufacturer / Plastic Extrusion OEM |

---

## 2. High-Authority Trade Portal Copy Packs

### A. Made-in-China (MIC) Profile
- **Company Name:** Wenzhou Ashal Innomach Technology Co., Ltd.
- **Short Overview:** Leading Chinese manufacturer of 3-layer ABA and 5-layer ABCDE co-extrusion blown film lines, multi-lane heat-seal bag converters, and 6/8-color CI flexo printing presses. Certified ISO 9001:2015 and CE compliant.
- **Core Product Slugs & Links:**
  - `https://www.wzashal.com/products/film-blowing-machines/abcde-2200-five-layer-co-extrusion-line`
  - `https://www.wzashal.com/products/film-blowing-machines/aba-three-layer-blown-film-line`
  - `https://www.wzashal.com/products/bag-making-machines/t-pro-multi-lane-heat-seal-bag-machine`
  - `https://www.wzashal.com/products/flexo-printing-machines/ai-6c-high-speed-ci-flexo-press`

### B. PRM-Taiwan (Plastics & Rubber Machinery Network)
- **Profile Title:** Ashal Innomach — Advanced Blown Film & Converting Equipment
- **Listing Summary:** High-speed blown film extruders (up to 400 kg/h), biodegradable PBAT+PLA bioplastic bag machinery (up to 600 pcs/min), and central impression flexo presses with ±0.1mm registration precision. Exports to over 40 countries across Europe, South America, Middle East, and Southeast Asia.

### C. Ensun Industrial B2B Network
- **Company Designation:** Wenzhou Ashal Innomach Technology Co., Ltd.
- **Verified NAP:** Wenzhou, Zhejiang, China | +86 159 8877 5831
- **Focus Keywords:** Blown film line manufacturer, ABA 3-layer extruder, CI flexographic press, plastic recycling line.

### D. Plastics Technology Industry Directory
- **Company Summary:** Wenzhou Ashal Innomach Technology Co., Ltd. specializes in energy-efficient plastic extrusion and bag converting lines. Our flagship ABA 3-layer co-extrusion line delivers up to 35% polymer raw material savings using recycled PE core layers without compromising film tensile strength or surface gloss.

### E. LinkedIn Company Hub & Authority Architecture
- **Page Name:** Wenzhou Ashal Innomach Technology Co., Ltd.
- **Tagline:** Engineering High-Output Blown Film Extrusion & Flexible Packaging Machinery.
- **About Copy (English):**
  Wenzhou Ashal Innomach Technology Co., Ltd. is a global leader in high-performance blown film extruders, bag converting systems, flexographic printing presses, and closed-loop recycling lines. Based in Wenzhou, Zhejiang, China, our team delivers custom-engineered machinery tailored for LDPE, LLDPE, HDPE, barrier polymers (EVOH/Nylon), and 100% compostable PBAT+PLA bioplastics.
- **About Copy (Arabic):**
  شركة Wenzhou Ashal Innomach Technology Co., Ltd. هي شركة عالمية رائدة في تصنيع خطوط بَثق البلاستيك بالنفخ، ومكائن تصنيع الأكياس عالية السرعة، ومكائن الطباعة الفليكسوغرافية المطبّعة سنترال، وخطوط إعادة التدوير.

---

## 3. Off-Page Backlink & Citation Submission Roadmap

1. **Trade Directory Submissions:** Submit the exact NAP profile above to Made-in-China, PRM-Taiwan, Ensun, Plastics Technology, and Europages.
2. **Technical Datasheet PDF Outreach:** Distribute generated PDF specification sheets (`https://www.wzashal.com/api/datasheet/[slug]`) to industrial document portals (Scribd, Issuu, SlideShare, Academic Repositories) linking back to `https://www.wzashal.com`.
3. **Anchor Text Strategy:** Ensure 70% of external inbound links target target keywords (e.g., `"Ashal Innomach blown film line"`, `"ABA 3-layer co-extrusion machine"`, `"Wenzhou Ashal flexo press"`).
````

## File: i18n/navigation.ts
````typescript
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
````

## File: i18n/request.ts
````typescript
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
````

## File: i18n/routing.ts
````typescript
import { defineRouting } from "next-intl/routing";
⋮----
export type Locale = (typeof locales)[number];
````

## File: lib/aiBrain.ts
````typescript
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import AiBrain from "@/models/AiBrain";
⋮----
export function hashMessages(messages:
⋮----
export async function getBrainResponse(promptHash: string): Promise<string | null>
⋮----
export async function saveBrainResponse(
  promptHash: string,
  category: string,
  response: string
): Promise<void>
````

## File: lib/clientSession.ts
````typescript
export function getVisitorSessionId(): string
````

## File: lib/customerAuth.ts
````typescript
function getSecret(): string
⋮----
function toBase64Url(bytes: Uint8Array): string
function fromBase64Url(s: string): string
⋮----
async function hmac(payload: string): Promise<string>
⋮----
async function sign(scope: string, email: string, ttlS: number): Promise<string>
⋮----
async function verify(scope: string, token: string | undefined): Promise<string | null>
⋮----
export const createLoginToken = (email: string)
export const verifyLoginToken = (token: string | undefined)
export const createCustomerSessionToken = (email: string)
export const verifyCustomerSessionToken = (token: string | undefined)
⋮----
export function customerSessionCookieOptions()
````

## File: lib/format.ts
````typescript
export function formatDuration(ms: number)
````

## File: lib/lineStatus.ts
````typescript
import type { CategorySlug } from "@/lib/products";
⋮----
export type LineStatus = "empty" | "analyzing" | "mismatch" | "optimized";
⋮----
export interface LineStatusResult {
  status: LineStatus;
  message: string;
}
⋮----
export function evaluateLineStatus(categoriesInOrder: CategorySlug[]): LineStatusResult
⋮----
function labelFor(c: CategorySlug): string
````

## File: lib/machinesData.ts
````typescript
import machinesJson from "@/app/data/machines.json";
⋮----
export interface SiteMetadata {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  phone: string;
  location: string;
}
⋮----
export interface MachineCategory {
  id: string;
  name: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
}
⋮----
export interface MachineVideo {
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
}
⋮----
export interface MachineProduct {
  slug: string;
  category: string;
  name: string;
  model: string;
  seoTitle: string;
  metaDescription: string;
  specs: Record<string, string>;
  features: string[];
  faqs?: { question: string; answer: string }[];
  video?: MachineVideo;
}
⋮----
export interface MachinesData {
  siteMetadata: SiteMetadata;
  categories: MachineCategory[];
  products: MachineProduct[];
}
⋮----
export function getSiteMetadata(): SiteMetadata
⋮----
export function getMachineCategories(): MachineCategory[]
⋮----
export function getMachineCategoryBySlug(slug: string): MachineCategory | undefined
⋮----
export function getMachineProducts(): MachineProduct[]
⋮----
export function getMachineProductBySlug(slug: string): MachineProduct | undefined
⋮----
export function getMachineProductsByCategory(categorySlug: string): MachineProduct[]
⋮----
import newsJson from "@/data/news.json";
⋮----
export interface Article {
  slug: string;
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  date: string;
  author?: string;
  category: string;
  readTime?: string;
  summary?: string;
  excerpt?: string;
  image?: string;
  tags?: string[];
  relatedMachineSlugs?: string[];
}
⋮----
export function getRelatedArticlesForMachine(machineSlug: string): Article[]
````

## File: lib/productionLineTemplates.ts
````typescript
import templatesData from "@/data/production-line-templates.json";
⋮----
export interface LineTemplateStep {
  slug: string;
  stage: string;
  role: string;
}
⋮----
export interface LineTemplate {
  id: string;
  name: string;
  tagline: string;
  heroImage: string;
  bestFor: string;
  whyBest: string[];
  steps: LineTemplateStep[];
}
⋮----
export const lineTemplateById = (id: string): LineTemplate | undefined
````

## File: lib/resend.ts
````typescript
import { Resend } from "resend";
import { promises as fs } from "fs";
import path from "path";
⋮----
function client()
⋮----
export interface EmailAttachment {
  filename: string;
  content: Buffer;
}
⋮----
export async function loadLocalImageAttachments(imagePaths: string[]): Promise<EmailAttachment[]>
⋮----
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
})
````

## File: lib/seo-matrix.ts
````typescript
import type { Metadata } from "next";
import { SITE_URL, BRAND } from "@/lib/products";
import { localePath } from "@/lib/seo";
import seoMatrixData from "@/data/site-seo-matrix.json";
⋮----
export interface PageSeoEntry {
  pageId: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  seo: {
    h1: string;
    canonical: string;
    ogImage: string;
  };
  geo: {
    entityName: string;
    factualSummary: string;
    citations: string[];
    schemaType: string;
  };
  aeo: {
    question: string;
    directAnswer: string;
    bulletKeyPoints: string[];
  };
}
⋮----
export function getSeoEntry(pageId: string): PageSeoEntry
⋮----
export function generateMatrixMetadata(pageId: string, locale: string): Metadata
⋮----
export function generateStructuredSchema(pageId: string)
````

## File: lib/seo.ts
````typescript
import type { Metadata } from "next";
import { SITE_URL, BRAND } from "@/lib/products";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";
⋮----
export function localePath(locale: string, path: string): string
⋮----
/** Canonical URL + hreflang alternates for a route, for spreading into
 *  a page's `metadata.alternates`. `path` is locale-agnostic, e.g. "/about"
 *  or "/products/film-blowing/abcde-2200". */
export function alternates(locale: string, path: string): Metadata["alternates"]
⋮----
export function pageMetadata(opts: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata
````

## File: lib/uaParse.ts
````typescript
export interface ParsedUA {
  browser: string;
  os: string;
  device: "mobile" | "tablet" | "desktop";
}
⋮----
export function parseUserAgent(ua: string): ParsedUA
````

## File: models/AdminUser.ts
````typescript
import { Schema, model, models } from "mongoose";
⋮----
export interface IAdminUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: string;
  status: string;
  isSuperAdmin?: boolean;
  hidden?: boolean;
  locked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
````

## File: models/AiBrain.ts
````typescript
import { Schema, model, models } from "mongoose";
⋮----
export interface IAiBrain {
  promptHash: string;
  category: string;
  response: string;
  hitCount: number;
  lastUsedAt: Date;
  createdAt: Date;
}
````

## File: models/SystemState.ts
````typescript
import { Schema, model, models } from "mongoose";
⋮----
export interface ISystemState {
  key: string;
  value: Date;
}
````

## File: public/google6f1fb08fd726e855.html
````html
google-site-verification: google6f1fb08fd726e855.html
````

## File: scripts/generate20kNewsSeoData.js
````javascript
async function syncToMongo()
````

## File: scripts/seed-mongodb.ts
````typescript
import fs from "fs";
import path from "path";
⋮----
async function seed()
````

## File: scripts/verify-all.js
````javascript
function logPass(msg)
function logFail(msg)
function logWarn(msg)
````

## File: SEO-GEO-AEO-Skill-main/SKILL.md
````markdown
---
name: seo-geo-aeo
description: >
  Full-featured SEO, GEO, and AEO website audit tool. Analyzes any URL or website for Search Engine Optimization (SEO), Generative Engine Optimization (GEO — for AI-powered search engines like Perplexity, ChatGPT Search, and Gemini), and Answer Engine Optimization (AEO — for featured snippets and voice search). Use this skill whenever a user provides a URL, domain, or website and asks about search performance, SEO issues, rankings, AI search readiness, answer engine visibility, meta tags, schema markup, content quality, or visibility in search. Also trigger when the user asks to "audit my site", "check my SEO", "why isn't my site ranking", "optimize for AI search", or any similar request involving a web property and search performance.
---

# SEO / GEO / AEO Audit Skill

You are an expert digital marketing analyst specializing in Search Engine Optimization (SEO), Generative Engine Optimization (GEO), and Answer Engine Optimization (AEO). Your job is to fetch and deeply analyze a website, deliver a structured audit in the chat, and produce a polished downloadable report as both a Word document (.docx) and PDF.

---

## Step 1: Confirm scope with the user

**Do not fetch anything yet. Do not begin the audit. Stop and ask this question first, every single time:**

> "Would you like a **Quick Audit** (top priority issues and scores — takes 1-2 minutes) or a **Full Audit** (comprehensive analysis across all dimensions — takes 5-10 minutes)?"

Wait for the user's reply before doing anything else. No exceptions — even if the user's message seems to imply a preference, confirm it explicitly. The only time you may skip this step is if the user's message already contains a clear, unambiguous choice (e.g. "do a full audit of..." or "quick audit please").

---

## Step 2: Fetch and collect data

Use WebFetch to gather page data. **Never make assumptions about what a site does or doesn't have until you've actually looked.** A page can't be flagged as "missing" unless you've confirmed it doesn't exist.

### Phase 2a: Homepage fetch and site discovery

Fetch the provided URL first. Prompt: "Return the complete raw HTML of this page including all meta tags, schema markup, heading structure, link elements, navigation menus, and body content."

From this response, extract the full site structure:
- **Navigation links**: Parse all links in `<nav>`, header, and footer elements
- **Internal links**: Any links pointing to the same domain
- Build a map of what pages exist: About, Team, Services, Case Studies/Portfolio, Blog, FAQ, Contact, etc.

Also fetch in parallel:
- `{domain}/robots.txt` — crawl directives and sitemap pointer
- `{domain}/sitemap.xml` — confirms pages that exist even if not in nav

### Phase 2b: Crawl key pages

Based on what you discovered in Phase 2a, fetch the key pages in parallel. Prioritize pages most relevant to the audit dimensions:

- **About / Team page** (E-E-A-T, author signals, credentials)
- **Services / Work page** (content depth, keyword coverage)
- **Case Studies / Portfolio page** (social proof, trust signals, content richness)
- **Blog / Resources page** (content strategy, AEO potential)
- **Contact page** (NAP data, local signals)
- **Any FAQ page** (AEO signals)

**Quick Audit**: Fetch the homepage plus up to 6 high-signal pages.

**Full Audit**: Crawl as many pages as the site has, with no arbitrary cap. Work through this priority order, but keep going until you've fetched every meaningful page:

1. About / Team / Our Story
2. Services / What We Do / Solutions
3. Case Studies / Portfolio / Work
4. Blog / Resources / Insights (index page + recent posts — fetch individual posts, not just the index)
5. Contact / Location
6. FAQ / Help
7. Individual service or product pages
8. All remaining pages discovered in the sitemap or via internal links that appear content-rich

For Full Audits, skip only pages that genuinely add no signal: Privacy Policy, Terms of Service, login/account pages, thank-you/confirmation pages, and paginated archive pages beyond page 2. Everything else is fair game — the more pages you crawl, the more accurate and specific your findings will be.

### Phase 2c: Handling inaccessible sites

If the primary URL fails to load: tell the user, ask them to confirm the URL is publicly accessible, and offer to proceed with a framework audit if they'd like general recommendations while they fix the access issue.

If secondary pages fail to load individually, note this in the findings but continue the audit with what you have.

---

## Step 3: Analyze the signals

Work through each category systematically. Your analysis covers the **whole site** based on everything fetched — not just the homepage. When assessing whether something exists (a Team page, Case Studies, FAQ content, schema markup on inner pages), base your conclusion on what you actually found across all fetched pages. Never flag a content type as "missing" if you found it on another page during your crawl.

### SEO Signals (Traditional Search Engine Optimization)

**Technical On-Page:**
- **Title tag**: Present? Length (optimal: 50-60 chars)? Contains primary keyword? Compelling? Duplicate across site?
- **Meta description**: Present? Length (optimal: 150-160 chars)? Contains CTA? Engaging?
- **Heading hierarchy**: H1 present and singular? H2/H3 logical and keyword-relevant? Heading stuffing?
- **URL structure**: Clean and readable? Contains keywords? Avoids stop words and excessive parameters?
- **Canonical tag**: Present? Self-referencing appropriately?
- **Robots meta**: Indexable? Any accidental noindex?
- **Viewport/Mobile meta**: Present for mobile friendliness?
- **Image alt text**: Images present? Alt text descriptive and keyword-relevant?
- **Internal links**: Present? Descriptive anchor text?
- **Open Graph / Twitter Card**: og:title, og:description, og:image present? Appropriate for social sharing?

**Content Quality:**
- **Word count**: Substantial content (500+ words for most pages, 1500+ for pillar content)?
- **Keyword signals**: Primary topic clearly established? Semantic related terms present?
- **Content freshness signals**: Publication or update dates visible?
- **Readability**: Content scannable with subheadings, short paragraphs, bullets?

**Structured Data:**
- **Schema markup**: Any JSON-LD or microdata present? Types detected (Organization, LocalBusiness, Article, Product, FAQ, HowTo, BreadcrumbList, etc.)?
- **Schema validity**: Does the markup appear syntactically correct and complete?

### GEO Signals (Generative Engine Optimization)

GEO optimizes for AI-powered search engines (Perplexity, ChatGPT Search, Google AI Overviews, Gemini) that synthesize answers from multiple sources and cite pages. These engines reward clarity, authority, and factual richness.

**E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness):**
- **Author information**: Named authors with credentials visible?
- **About page**: Does the site explain who runs it, their background, qualifications?
- **Contact information**: Phone, address, email accessible?
- **Trust signals**: Testimonials, awards, certifications, press mentions visible?
- **Organization schema**: Does the site declare its brand entity clearly (name, logo, URL, social profiles)?

**Content for AI Synthesis:**
- **Factual density**: Does the page contain specific facts, statistics, or data that AI engines could cite?
- **Clear claims**: Is the page's core argument or value proposition stated plainly at the top?
- **Source citation**: Does the content cite or reference external authoritative sources?
- **Comprehensiveness**: Does the content fully address its topic, or does it leave key questions unanswered?
- **Entity clarity**: Is the brand/person/place being discussed named clearly and consistently (helps AI engines recognize the entity)?
- **Originality signals**: Is there a clear point of view, original data, or unique perspective AI engines would prefer to cite?

**Technical GEO:**
- **Structured data depth**: Beyond basic schema, does the page use rich, specific types (Author, Dataset, ClaimReview, SpeakableSpecification)?
- **HTTPS / security**: Secure site (trust signal for AI engines)?
- **Clean crawlability**: No robots.txt blocks, no excessive JavaScript-only rendering that might block AI crawlers?
- **Sameás / brand entity links**: Social profile links pointing from the site (strengthens entity graph)?

### AEO Signals (Answer Engine Optimization)

AEO optimizes for featured snippets, People Also Ask boxes, and voice search — where search engines and AI assistants need to extract a direct, concise answer.

**Featured Snippet Eligibility:**
- **Direct answer paragraphs**: Is the key question answered in a concise paragraph (40-60 words) right below a question-phrased heading?
- **Definition patterns**: Does the page define its core topic in a clear "X is..." sentence?
- **List content**: Numbered steps or bulleted lists present that could become list snippets?
- **Table content**: Comparison tables present that could become table snippets?

**Structured Answer Formats:**
- **FAQ schema**: FAQ schema markup present? Questions and answers structured correctly?
- **HowTo schema**: Step-by-step process content marked up with HowTo?
- **Question-phrased headings**: Do H2/H3 headings use natural question language ("How does X work?", "What is Y?")?
- **Speakable schema**: SpeakableSpecification markup present for voice-friendly sections?

**Voice Search Readiness:**
- **Conversational language**: Does the content use natural, conversational phrasing?
- **Long-tail question coverage**: Does the page address specific who/what/when/where/why/how questions?
- **Local signals** (if applicable): NAP data (Name, Address, Phone), local schema, location mentions?

---

## Step 4: Score rubric

Score each category 1-10 using this guide:
- **1-3**: Critical issues — site is likely penalized or invisible
- **4-5**: Below average — significant missed opportunities
- **6-7**: Decent foundation — specific improvements needed
- **8-9**: Strong — minor refinements available
- **10**: Exemplary — model implementation

Do NOT write out a long chat report. Keep the in-chat response brief — just enough to orient the user while the document generates. Use this format for both Quick and Full audits:

---

## 🔍 [Site Name] — [Quick/Full] SEO/GEO/AEO Audit

**Pages reviewed:** [count and list]  **Audit date:** [date]

| Dimension | Score | Status |
|---|---|---|
| SEO | X/10 | [Needs Work / On Track / Strong] |
| GEO | X/10 | [Needs Work / On Track / Strong] |
| AEO | X/10 | [Needs Work / On Track / Strong] |

**Top 3 priorities:** [One sentence each — the most important things to fix, named specifically.]

**Biggest strength:** [One sentence — the most notable thing working well.]

*Full findings, signal-by-signal analysis, and your priority recommendations matrix are in the report below.*

---

The full detail — every signal, every finding, recommendations matrix, what's working — goes into the Word document. That's where it belongs.

## Step 5: Generate the downloadable report

Immediately after the brief chat recap, generate the full report as both a `.docx` and `.pdf`. Do not ask the user if they want this — just produce it.

Tell the user: "Generating your downloadable report now..."

### Setup

**Do not run `npm install` as a separate step.** Check whether `docx` is already available first, and only install if missing. Do this in a single combined bash command so it counts as one tool call:

```bash
node -e "require('docx')" 2>/dev/null || npm install -g docx
```

**Then immediately write and run the full report script in the next tool call — do not pause, do not add intermediate steps.** Write the complete JS to a file and execute it in one shot.

### Report design

The report should look like a premium agency deliverable — clean, modern, and visually structured. Use this design system:

**Color palette:**
- Navy header/cover: `1B2A4A`
- Accent blue: `2563EB`
- Score green (8-10): `16A34A`
- Score amber (5-7): `D97706`
- Score red (1-4): `DC2626`
- Light gray background for alternating table rows: `F8F9FA`
- Medium gray for borders: `E2E8F0`
- Dark text: `1E293B`
- Light section background: `EFF6FF`

**Typography:** Arial throughout. Title 36pt bold, H1 24pt bold, H2 18pt bold, H3 14pt bold, body 11pt, footer 9pt.

**Page setup:** US Letter (12240 x 15840 DXA), 1-inch margins on all sides. Content width: 9360 DXA.

### Report structure

Build the report in this order:

#### 1. Cover page (separate section, no header/footer)

Full-page navy background (`1B2A4A`). Keep it clean and simple — everything fits on one page. Use `spaceBefore`/`spaceAfter` on paragraphs to vertically center the content block.

**Top spacer:** ~1800 DXA of space (navy paragraph) to push content toward the center.

**Content (all centered):**
1. Site domain in white, 36pt bold — the hero element
2. "SEO / GEO / AEO Audit Report" in light blue (`93C5FD`), 18pt — subtitle
3. Audit type: "QUICK AUDIT" or "FULL AUDIT" in white, 11pt, with 400 DXA space after
4. Score table — a simple 3-column table, full width, no visible outer border:
   - Each cell: colored background based on score (green `16A34A` for 8-10, amber `D97706` for 5-7, red `DC2626` for 1-4), with generous top/bottom cell margins
   - Row 1: dimension label ("SEO", "GEO", "AEO") in white, 10pt bold, centered
   - Row 2 (same cell, second paragraph): score number in white, 36pt bold, centered
   - Row 3 (same cell, third paragraph): status word ("Strong", "On Track", "Needs Work") in white, 9pt italic, centered

**Bottom spacer:** ~1800 DXA of space, then attribution in gray (`94A3B8`), 9pt, centered:
- Line 1: Audit date
- Line 2: "Claude Skill and Plugin by Alex Labat"

Page break after cover.

#### 2. Executive summary

Section heading: "Executive Summary" (Heading 1)

A light-blue shaded box (use a single-cell table with `EFF6FF` background) containing:
- One paragraph summarizing the site's overall position in 3-5 sentences — what's strong, what's the most urgent issue, and one key opportunity. Be specific to this site, not generic.

Below the box, the scores table:

| Dimension | Score | Status | Key Takeaway |
|---|---|---|---|
| SEO | X/10 | [color-coded status] | [one-line summary] |
| GEO | X/10 | ... | ... |
| AEO | X/10 | ... | ... |
| **Combined** | **X/30** | | |

Color-code the Score cells: green fill for 8-10, amber for 5-7, red for 1-4.

#### 4. Pages audited

Section heading: "Pages Audited" (Heading 1)

A simple table listing every page fetched: URL | Page Type | Notes (e.g., "Homepage", "Missing H1", "Rich schema detected"). Use alternating row shading.

#### 5. SEO analysis section

Section heading: "SEO Analysis" (Heading 1), with score subtitle.

Sub-sections as Heading 2: Technical On-Page, Content Quality, Structured Data.

For each finding, use a 3-column table: Signal | Finding | Status. Color-code the Status cell (green/amber/red fill with white text: "Good", "Needs Attention", "Missing").

#### 6. GEO analysis section

Same structure as SEO. Sub-sections: E-E-A-T Assessment, Content for AI Synthesis, Technical GEO.

#### 7. AEO analysis section

Same structure. Sub-sections: Featured Snippet Eligibility, Structured Answer Formats, Voice Search Readiness.

#### 8. Priority recommendations matrix

Section heading: "Priority Recommendations" (Heading 1).

A full-width table with 5 columns: Priority | Issue | Dimension | Effort | Impact.

Color-code the Priority column cells:
- 🔴 Critical: red fill (`DC2626`), white text
- 🟠 High: orange fill (`EA580C`), white text
- 🟡 Medium: amber fill (`D97706`), white text
- 🟢 Quick Win: green fill (`16A34A`), white text

#### 9. What's working well

Section heading: "What's Working Well" (Heading 1).

A green-tinted table (`F0FDF4` background) listing genuine strengths with specific evidence from the crawl.

#### 10. Glossary (Full Audit only)

Brief definitions of SEO, GEO, and AEO for clients who may be unfamiliar.

### Headers and footers (all pages except cover)

**Header:** Site domain left-aligned, "SEO / GEO / AEO Audit Report" right-aligned. Separated from content by a navy bottom border (`1B2A4A`, size 8).

**Footer:** "Claude Skill and Plugin by Alex Labat" left-aligned, page number right-aligned. Separated by a gray top border.

### Generate the DOCX

```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents,
        ExternalHyperlink, LevelFormat } = require('docx');
const fs = require('fs');

// ... build document as described above ...

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/wizardly-charming-thompson/mnt/outputs/seo-audit-[domain]-[date].docx', buffer);
  console.log('DOCX written');
});
```

Use a filename like `seo-audit-example-com-2025-03-13.docx` (domain with hyphens, ISO date).

### Validate

```bash
python /sessions/wizardly-charming-thompson/mnt/.skills/skills/docx/scripts/office/validate.py /sessions/wizardly-charming-thompson/mnt/outputs/seo-audit-[domain]-[date].docx
```

If validation fails, inspect the error, fix the JS, and regenerate.

### Convert to PDF

```bash
python /sessions/wizardly-charming-thompson/mnt/.skills/skills/docx/scripts/office/soffice.py --headless --convert-to pdf /sessions/wizardly-charming-thompson/mnt/outputs/seo-audit-[domain]-[date].docx --outdir /sessions/wizardly-charming-thompson/mnt/outputs/
```

### Deliver to the user

Use `present_files` (if available) to surface both files, then follow up with computer:// links:

```
Your audit report is ready:
[Download Word Doc](computer:///sessions/wizardly-charming-thompson/mnt/outputs/seo-audit-[domain]-[date].docx)
[Download PDF](computer:///sessions/wizardly-charming-thompson/mnt/outputs/seo-audit-[domain]-[date].pdf)
```

---

## Step 6: Invite next steps

> "Would you like me to go deeper on any specific area? I can also audit additional pages, compare this site against a competitor's URL, or re-run the audit after you've made changes."

---

## Important principles

**Audit the whole site, not just the starting URL.** The URL the user provides is a starting point, not the whole picture. Always crawl key pages before drawing conclusions. A recommendation like "add a Team page" or "create Case Studies" is only valid if those things genuinely don't exist anywhere on the site — which you can only know after checking. If you found a Team page at /team, say so. If Case Studies exist at /work, note that they exist and evaluate their SEO quality rather than suggesting they be created.

**Be specific, not generic.** Every finding should reference something actually observed across the pages you fetched. Avoid boilerplate advice that could apply to any website. If the title is "Welcome to Our Website" — say that. If a page you fetched is missing an H1 — say which page. Quote actual text when it helps illustrate the point.

**Be honest about what you can and can't assess.** Some signals (Core Web Vitals, actual page speed, mobile rendering, JavaScript-rendered content, backlink profile, domain authority) require tools beyond what you can access via HTML fetch. When this comes up, name the tool that can assess it (e.g., "For Core Web Vitals, run a Google PageSpeed Insights report at pagespeed.web.dev") rather than guessing.

**Calibrate tone to the findings.** If a site is genuinely in good shape, say so — don't manufacture problems. If it has serious issues, communicate urgency without being alarmist.

**GEO and AEO are emerging disciplines.** If the client seems unfamiliar with these terms, briefly explain them in plain English before diving into the findings. A sentence or two is enough.

**Make the report earn its download.** The DOCX/PDF should feel like something an agency charged for — not a printout of the chat. Use the full visual design, be specific with evidence, and make every table and section genuinely informative.
````

## File: postcss.config.mjs
````javascript

````

## File: skills-lock.json
````json
{
  "version": 1,
  "skills": {
    "animation-vocabulary": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/animation-vocabulary/SKILL.md",
      "computedHash": "39319fc9a33c15be08666b3685f58666f042ff36bb902b7814c0834a5ba99df4"
    },
    "apple-design": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/apple-design/SKILL.md",
      "computedHash": "8b94db67cb9edaad5f1501010804caa610131f1d2dfda0a27664b2e858deade3"
    },
    "brandkit": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/brandkit/SKILL.md",
      "computedHash": "b63012f3c3d21197e0185d3e9cc7ec40c589fb10e0b5a32a561739de31aa3f20"
    },
    "design-taste-frontend": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/taste-skill/SKILL.md",
      "computedHash": "6d838b246d0e35d0b53f4f23f98ba7a1dd561937e64f7d0c7553b0928e376c3e"
    },
    "design-taste-frontend-v1": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/taste-skill-v1/SKILL.md",
      "computedHash": "d704ab912c4d0ca954ffa858983da755ae4cd5cad9ba22554db5557382f5bd34"
    },
    "emil-design-eng": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/emil-design-eng/SKILL.md",
      "computedHash": "41b0a4dc1a27164fe297845a6c6850a39e9242c42c9be999967fcee9df2c5974"
    },
    "find-animation-opportunities": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/find-animation-opportunities/SKILL.md",
      "computedHash": "8fb8492eb8fbed1313cb430b5831d925d9b8964ca24f3c41a6244cbd1fd98732"
    },
    "full-output-enforcement": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/output-skill/SKILL.md",
      "computedHash": "26bd29ce4c5e02c7666b2d503609bf466bd32290822e91f0e984147048dbb924"
    },
    "gpt-taste": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/gpt-tasteskill/SKILL.md",
      "computedHash": "cc8f0c601d8240a124e1d11634351a2be7b8a72fd807c75e5b6bf7afcd5ddee0"
    },
    "high-end-visual-design": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/soft-skill/SKILL.md",
      "computedHash": "7db385e4c5370e5a7fca9704a1361b056e4504ea6a03924bb86f33a4f00b5c73"
    },
    "image-to-code": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/image-to-code-skill/SKILL.md",
      "computedHash": "58517b03b2a01f4c9ba65861559d03df931400871bbc200978c975b24bb92c73"
    },
    "imagegen-frontend-mobile": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/imagegen-frontend-mobile/SKILL.md",
      "computedHash": "9ab7f4f6ce66a3cff02bbf5894e5bd5af50bf5d6ef0adffdc88e8fab772fe44f"
    },
    "imagegen-frontend-web": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/imagegen-frontend-web/SKILL.md",
      "computedHash": "65f5ae59fa317567809438310b1c54f78cd133426deb43e4d3d4ca4c8f541628"
    },
    "improve-animations": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/improve-animations/SKILL.md",
      "computedHash": "eeb219a407e325b687af88db25771cc3018e3148245604112f5ac6990b6fd79c"
    },
    "industrial-brutalist-ui": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/brutalist-skill/SKILL.md",
      "computedHash": "8fc355c4aadb7d29c53ca28bc41be3cd6eea765d121e3737c4dc2d0f90a8effa"
    },
    "minimalist-ui": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/minimalist-skill/SKILL.md",
      "computedHash": "08873a3131d3be27bef9bf3304b310b16b44ca6e3561aebe532797be3443f6bd"
    },
    "pick-ui-library": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/pick-ui-library/SKILL.md",
      "computedHash": "f8d4d2cf4677bf54b14f35f62a741add93541bfcb67863315a40164365161b49"
    },
    "prototype": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/prototype/SKILL.md",
      "computedHash": "f246d1f47566481d9207e1aa574bdee5454257d862919a6591283e9af2f57eab"
    },
    "redesign-existing-projects": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/redesign-skill/SKILL.md",
      "computedHash": "b405eee0e0e80fc243f731d9aa368bca307e356db7e6157d27101d369dac6726"
    },
    "review-animations": {
      "source": "emilkowalski/skills",
      "sourceType": "github",
      "skillPath": "skills/review-animations/SKILL.md",
      "computedHash": "b9f669af5ae280c19a592a94611520335a81de25c88f225bf60ae4b2d66c8c7c"
    },
    "stitch-design-taste": {
      "source": "Leonxlnx/taste-skill",
      "sourceType": "github",
      "skillPath": "skills/stitch-skill/SKILL.md",
      "computedHash": "13322f38406cd3abf16ba45e35bdc9b18002d0153a79b4612b97aefc65d5a335"
    }
  }
}
````

## File: tailwind.config.js
````javascript

````

## File: app/[locale]/account/page.tsx
````typescript
import { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { LogOut, Wrench, ClipboardList, Package, CheckCircle2, Clock, Inbox } from "lucide-react";
⋮----
interface InquiryMachine { name: string; model: string; qty: number; notes: string; }
interface InquiryPart { name: string; machine: string; quantity: number; notes: string; }
interface InquiryReply { message: string; sentAt: string; }
interface AccountInquiry {
  _id: string;
  inquiryType: "talk-to-engineer" | "direct" | "parts";
  machines: InquiryMachine[];
  parts: InquiryPart[];
  message: string;
  status: "new" | "read" | "replied";
  replies: InquiryReply[];
  createdAt: string;
}
⋮----
function formatDate(iso: string)
⋮----
async function logout()
````

## File: app/[locale]/contact/ContactClient.tsx
````typescript
import { useRef } from "react";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import { useScrollReveal } from "@/lib/useScrollReveal";
````

## File: app/[locale]/faq/FaqClient.tsx
````typescript
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { FAQ_ITEMS } from "@/lib/faqData";
import { useScrollReveal } from "@/lib/useScrollReveal";
⋮----
export default function FaqClient()
⋮----
onClick=
````

## File: app/api/account/login/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { createLoginToken } from "@/lib/customerAuth";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/emailTemplate";
⋮----
export async function POST(req: NextRequest)
````

## File: app/api/admin/analytics/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession from "@/models/VisitorSession";
import ChatSession from "@/models/ChatSession";
⋮----
export async function GET(_req: NextRequest)
⋮----
// The pending draft's own session may have aged out of the top-500 list
// above (it only needed one pageview to seed it, possibly long before the
// draft finished generating) — fetch its country directly rather than
// silently showing "??" whenever that happens.
````

## File: app/api/admin/inquiries/[id]/reply/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { sendEmail, loadLocalImageAttachments } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/emailTemplate";
⋮----
function escapeHtml(s: string)
⋮----
// Auth is enforced by middleware for all /api/admin/* routes.
export async function POST(req: NextRequest,
````

## File: app/api/admin/inquiries/[id]/roadmap/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry, { type InquiryMachine, type InquiryPart } from "@/models/Inquiry";
import VisitorSession from "@/models/VisitorSession";
import { groqJsonCompletion } from "@/lib/groq";
import { formatDuration } from "@/lib/format";
⋮----
function daysAgo(date: Date)
⋮----
export async function POST(req: NextRequest,
````

## File: app/api/admin/inquiries/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
⋮----
import { parseSessionToken, SESSION_COOKIE } from "@/lib/adminAuth";
⋮----
export async function GET(req: NextRequest)
⋮----
export async function DELETE(req: NextRequest)
````

## File: app/api/track/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession from "@/models/VisitorSession";
import { parseUserAgent } from "@/lib/uaParse";
import { maybeProcessLeadDrafts } from "@/lib/leadDrafts";
⋮----
interface TrackBody {
  sessionId: string;
  type: "pageview" | "chat_open";
  path?: string;
  durationMs?: number;
  referrer?: string;
  locale?: string;
  source?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
  clientTimezone?: string;
  connectionType?: string;
}
⋮----
export async function POST(req: NextRequest)
⋮----
// First-touch fields only: what session this visitor first landed under.
// Never overwritten on later pings, so it keeps meaning "the page/referrer
⋮----
// Environmental snapshot fields: refreshed on every ping, not just the
// first. A sessionId lives in localStorage indefinitely, so a visitor
// returning weeks later on a different network/device would otherwise be
// stuck showing their very first visit's stale IP/geo/device forever —
// this keeps the profile reflecting their current visit.
````

## File: app/cx-ops-x7k9q2/inquiries/CustomerRoadmap.tsx
````typescript
import { useEffect, useMemo, useState } from "react";
import { Users, Compass, Sparkles, RefreshCw, MapPin } from "lucide-react";
import type { InquiryRoadmap } from "@/models/Inquiry";
import { formatDuration } from "@/lib/format";
⋮----
export interface InquiryForRoadmap {
  _id: string;
  email: string;
  sessionId?: string;
  createdAt: string;
  roadmap?: InquiryRoadmap | null;
}
⋮----
interface SessionSummary {
  countryCode?: string;
  device?: string;
  browser?: string;
  totalDurationMs?: number;
  pageCount: number;
  chatOpened?: boolean;
}
⋮----
function flagEmoji(code?: string)
⋮----
async function generateRoadmap(force: boolean)
⋮----
{/* linked visitor behavior */}
⋮----
⋮----
{/* AI roadmap */}
⋮----
<button onClick=
````

## File: app/cx-ops-x7k9q2/adminIcons.tsx
````typescript
import {
  Sparkles, LayoutGrid, Wrench, Printer,
  ShoppingBag, Newspaper, Factory, Recycle, Film, Package,
  type LucideIcon,
} from "lucide-react";
⋮----
export function SectionIcon(
````

## File: app/data/machines.json
````json
{
  "siteMetadata": {
    "siteName": "Wenzhou Ashal Innomach Technology Co., Ltd.",
    "siteUrl": "https://www.wzashal.com",
    "contactEmail": "ashal@ashalinnomech.com",
    "phone": "+86 159 8877 5831",
    "location": "Wenzhou, Zhejiang, China"
  },
  "categories": [
    {
      "id": "film-blowing-machines",
      "name": "Film Blowing Machines",
      "slug": "film-blowing-machines",
      "metaTitle": "Blown Film Extrusion Lines & Co-Extrusion Machines | Ashal Innomach",
      "metaDescription": "Explore industrial 3-layer ABA, 5-layer ABCDE, and high-output blown film extrusion lines engineered for PE, HDPE, LDPE, and biodegradable PBAT+PLA films."
    },
    {
      "id": "bag-making-machines",
      "name": "Bag Making Machines",
      "slug": "bag-making-machines",
      "metaTitle": "Automatic Heat-Seal & Bottom-Seal Bag Making Machines | Ashal Innomach",
      "metaDescription": "High-speed multi-lane heat-seal, bottom-seal, and roll-bag converters delivering up to 600 pcs/min for PE and compostable bioplastics."
    },
    {
      "id": "flexo-printing-machines",
      "name": "Flexographic Printing Machines",
      "slug": "flexo-printing-machines",
      "metaTitle": "Central Impression (CI) Flexographic Printing Presses | Ashal Innomach",
      "metaDescription": "2, 4, 6, and 8-color CI flexo printing presses running up to 350 m/min with ±0.1mm registration for plastic films, paper, and non-woven substrates."
    },
    {
      "id": "recycling-machines",
      "name": "Recycling & Pelletizing Lines",
      "slug": "recycling-machines",
      "metaTitle": "Plastic Film Recycling & Pelletizing Lines | Ashal Innomach",
      "metaDescription": "Closed-loop PE film recycling and granulation extrusion systems achieving up to 99% resin recovery."
    }
  ],
  "products": [
    {
      "slug": "abcde-2200-five-layer-co-extrusion-line",
      "category": "film-blowing-machines",
      "name": "ABCDE-2200 Five-Layer Co-extrusion Blown Film Line",
      "model": "ABCDE-2200",
      "seoTitle": "ABCDE-2200 5-Layer Blown Film Machine Manufacturer | Ashal Innomach",
      "metaDescription": "Factory direct ABCDE-2200 (ABCDE 2200) 5-layer co-extrusion blown film line manufacturer. 400 kg/h output, 2200mm film width for high-barrier food packaging.",
      "specs": {
        "Model Number": "ABCDE-2200 (ABCDE 2200)",
        "Layers": "5-Layer Co-extrusion (ABCDE)",
        "Max Output": "400 kg/h",
        "Max Film Width": "2200 mm",
        "Compatible Resins": "LDPE, LLDPE, HDPE, MLLDPE, Barrier Resins",
        "Control System": "PLC with central touchscreen & automatic thickness control",
        "Power Supply": "380V / 3PH / 50Hz"
      },
      "features": [
        "Internal Bubble Cooling (IBC) system for high-speed stability on model ABCDE-2200",
        "Gravimetric dosing and automatic gauge control for 5-layer ABCDE extrusion",
        "Low-shear screw design minimizing polymer degradation across all 5 extruders"
      ],
      "faqs": [
        {
          "question": "What is the factory price and production capacity of the ABCDE-2200 5-layer blown film line?",
          "answer": "The ABCDE-2200 (ABCDE 2200) 5-layer co-extrusion line delivers up to 400 kg/h maximum throughput. Wenzhou Ashal Innomach Technology Co., Ltd. provides factory-direct export pricing, custom screw design, and turnkey installation support."
        },
        {
          "question": "What barrier materials can the ABCDE-2200 5-layer blown film line process?",
          "answer": "The ABCDE-2200 is engineered to process EVOH and Polyamide (PA/Nylon) barrier resins alongside LDPE, LLDPE, HDPE, and MLLDPE using compatible tie-layer adhesive resins for high-barrier food and chemical packaging."
        },
        {
          "question": "How does the automatic gauge control system on ABCDE-2200 operate?",
          "answer": "The line features non-contact capacitive or beta-ray thickness measurement sensors linked to a high-precision segmented thermal air ring, regulating gauge variation to within ±3%."
        }
      ],
      "video": {
        "title": "ABCDE-2200 Five-Layer Blown Film Line Factory Floor Running Test",
        "description": "Live factory trial demonstration of ABCDE-2200 5-layer co-extrusion line producing high-barrier film at 400 kg/h with Internal Bubble Cooling (IBC).",
        "youtubeId": "dQw4w9WgXcQ",
        "thumbnailUrl": "https://www.wzashal.com/images/video-thumbnails/abcde-2200-test.jpg",
        "uploadDate": "2026-08-01",
        "duration": "PT3M45S"
      }
    },
    {
      "slug": "aba-three-layer-blown-film-line",
      "category": "film-blowing-machines",
      "name": "ABA Three-Layer Co-Extrusion Blown Film Line (1000 / 1200 / 1500)",
      "model": "ABA-1000",
      "seoTitle": "ABA 3-Layer Blown Film Machine (ABA-1000 / ABA-1200) Manufacturer",
      "metaDescription": "China manufacturer of ABA 3-layer co-extrusion blown film machine (ABA-1000, ABA-1200, ABA-1500). Reduces raw material costs by up to 35% using CaCO3 or recycled resin.",
      "specs": {
        "Model Range": "ABA-1000 / ABA-1200 / ABA-1500",
        "Layers": "3-Layer Co-extrusion (ABA)",
        "Film Width": "1000 – 1500 mm",
        "Output": "120 – 250 kg/h",
        "Material": "HDPE / LDPE / Recycled Resin / CaCO3",
        "Drive": "High-efficiency inverter-driven AC motors"
      },
      "features": [
        "Up to 50% recycled material or CaCO3 filler in the middle B-layer for ABA series machines",
        "High mechanical tensile and dart-impact film strength",
        "Precision spiral die head ensuring uniform melt distribution on ABA-1000/1200/1500"
      ],
      "faqs": [
        {
          "question": "Where can I buy factory-direct ABA 3-layer blown film machines (ABA-1000 / ABA-1200)?",
          "answer": "Wenzhou Ashal Innomach Technology Co., Ltd. manufactures ABA-1000, ABA-1200, and ABA-1500 series 3-layer extruders in Wenzhou, China, exporting to over 80 countries with CE certification."
        },
        {
          "question": "How much raw material cost can an ABA 3-layer line save compared to single layer?",
          "answer": "By utilizing up to 50–70% recycled PE resins or calcium carbonate (CaCO3) masterbatch in the middle B-layer while maintaining virgin resin in the outer A-layers, manufacturers typically reduce overall polymer costs by 20% to 35%."
        },
        {
          "question": "Does using recycled plastic in the middle B-layer of ABA-1000 affect printability?",
          "answer": "No. Because the outer A-layers encapsulate the core layer with 100% virgin polymer, the surface gloss, corona treatment retention, and flexographic printability remain high quality."
        }
      ]
    },
    {
      "slug": "t-pro-multi-lane-heat-seal-bag-machine",
      "category": "bag-making-machines",
      "name": "T-PRO High-Speed Multi-Lane Heat-Seal Bag Making Machine",
      "model": "T-PRO",
      "seoTitle": "T-PRO Multi-Lane Heat-Seal Bag Converter (600 pcs/min) | Manufacturer",
      "metaDescription": "T-PRO (T PRO) high-speed multi-lane heat-seal bag making machine manufacturer. Converts up to 600 pcs/min with ±0.5mm servo precision for PE and compostable PLA bags.",
      "specs": {
        "Model": "T-PRO (T PRO)",
        "Speed": "Up to 600 pcs / min",
        "Film Width": "750 – 1150 mm",
        "Lanes": "Up to 6 Lanes",
        "Sealing Accuracy": "±0.5 mm servo repeat accuracy",
        "Material Compatibility": "PE, PBAT + PLA Biodegradable Blends",
        "Changeover Time": "< 15 minutes tool-free width adjustment"
      },
      "features": [
        "Compatible with biodegradable and compostable resins out of the box on T-PRO bag machine",
        "Multi-lane independent tension control for T-PRO series converters",
        "Synchronized servo motor drive system with ±0.5mm repeat accuracy"
      ],
      "faqs": [
        {
          "question": "What is the speed and capacity of the T-PRO multi-lane bag making machine?",
          "answer": "The T-PRO (T PRO) operates at speeds up to 600 pieces per minute across up to 6 independent lanes, engineered by Wenzhou Ashal Innomach Technology Co., Ltd."
        },
        {
          "question": "Can the T-PRO bag machine convert 100% biodegradable PBAT + PLA films?",
          "answer": "Yes. The T-PRO features digital PID micro-temperature regulators and specialized anti-stick Teflon sealing bars designed specifically for low-temperature, heat-sensitive biodegradable and compostable resins."
        }
      ],
      "video": {
        "title": "T-PRO Multi-Lane Heat-Seal Converter 600 pcs/min Speed Demonstration",
        "description": "High-speed 6-lane heat-seal bag converting demonstration using biodegradable PBAT+PLA film at 600 pieces per minute.",
        "youtubeId": "dQw4w9WgXcQ",
        "thumbnailUrl": "https://www.wzashal.com/images/video-thumbnails/t-pro-test.jpg",
        "uploadDate": "2026-08-05",
        "duration": "PT2M30S"
      }
    },
    {
      "slug": "f-pro-bottom-seal-bag-machine",
      "category": "bag-making-machines",
      "name": "F-PRO Bottom-Seal Bag Making Machine (1600mm)",
      "model": "F-PRO-1600",
      "seoTitle": "F-PRO-1600 Bottom-Seal Bag Machine Manufacturer | Ashal Innomach",
      "metaDescription": "F-PRO-1600 (F PRO 1600) heavy-duty 1600mm bottom-seal bag making machine manufacturer. Designed for industrial liner bags, heavy-duty trash sacks, and construction films.",
      "specs": {
        "Model": "F-PRO-1600 (F PRO 1600)",
        "Max Width": "1600 mm",
        "Bag Length": "200 – 2000 mm",
        "Speed": "180 pcs / min",
        "Material": "HDPE, LDPE, Recycled PE",
        "Sealing Knife": "High-durability flying rotary knife"
      },
      "features": [
        "Heavy-gauge film sealing up to 150 microns on F-PRO-1600",
        "Static eliminator and automatic stack counting unit for F-PRO series",
        "Photocell registration for printed film converting"
      ],
      "faqs": [
        {
          "question": "What applications is the F-PRO-1600 bottom-seal bag making machine designed for?",
          "answer": "The F-PRO-1600 (F PRO 1600) handles heavy-duty HDPE and LDPE films up to 150 microns, making it ideal for industrial liner bags, construction films, and heavy-load shipping sacks."
        }
      ]
    },
    {
      "slug": "ai-6c-high-speed-ci-flexo-press",
      "category": "flexo-printing-machines",
      "name": "AI-6C High-Speed CI Flexographic Printing Press (6-Colour)",
      "model": "AI-6C",
      "seoTitle": "AI-6C 6-Color CI Flexo Printing Machine Manufacturer | Ashal Innomach",
      "metaDescription": "AI-6C (AI 6C) central impression 6-color flexographic printing press manufacturer. 260 m/min max printing speed with ±0.1mm registration for PE film, BOPP & paper.",
      "specs": {
        "Model": "AI-6C (AI 6C)",
        "Colors": "6 Colors",
        "Max Printing Speed": "260 m / min",
        "Registration Precision": "±0.1 mm",
        "Printing Width": "600 – 1600 mm",
        "Anilox Roller": "Ceramic laser-engraved 200–600 LPI",
        "Substrates": "PE, PP, PET, BOPP, Paper, Non-woven"
      },
      "features": [
        "Central Impression (CI) drum eliminating film stretching during high-speed printing on model AI-6C",
        "Enclosed doctor blade chamber for clean inking on AI-6C flexo press",
        "Automatic video web inspection system for ±0.1mm registration tracking"
      ],
      "faqs": [
        {
          "question": "What is the speed and registration accuracy of the AI-6C flexo printing machine?",
          "answer": "The AI-6C (AI 6C) 6-color Central Impression flexographic press operates at speeds up to 260 m/min with precise ±0.1mm color registration, manufactured by Wenzhou Ashal Innomach Technology Co., Ltd."
        },
        {
          "question": "Why is a Central Impression (CI) drum superior for printing extensible plastic films?",
          "answer": "The single high-precision central steel drum locks the film against its surface during all 6 color stations, preventing film elongation and maintaining color registration within ±0.1mm at speeds up to 260 m/min."
        }
      ],
      "video": {
        "title": "AI-6C Central Impression Flexographic Press 260 m/min Registration Test",
        "description": "Precision ±0.1mm color registration test on thin LDPE packaging film at 260 meters per minute.",
        "youtubeId": "dQw4w9WgXcQ",
        "thumbnailUrl": "https://www.wzashal.com/images/video-thumbnails/ai-6c-test.jpg",
        "uploadDate": "2026-08-10",
        "duration": "PT4M12S"
      }
    },
    {
      "slug": "cx-closed-loop-recycling-pelletizing-line",
      "category": "recycling-machines",
      "name": "CX Closed-Loop Plastic Film Recycling & Pelletizing Line",
      "model": "CX-Pelletizer",
      "seoTitle": "CX Plastic Film Recycling & Pelletizing Machine Manufacturer | Ashal",
      "metaDescription": "Integrated cutter-compactor CX plastic film recycling extruder & pelletizing line manufacturer. 99% resin recovery rate with dual-zone vacuum degassing.",
      "specs": {
        "Model": "CX-Pelletizer (CX Recycling Line)",
        "Resin Recovery Rate": "99%",
        "Throughput Capacity": "150 – 500 kg/h",
        "Degassing System": "Dual-zone high vacuum venting",
        "Pelletizing Method": "Water-ring die face cutting",
        "Suitable Scrap": "Blown film edge trim, bag cutoffs, printed film waste"
      },
      "features": [
        "Direct feeding from film roll or scrap scrap without pre-shredding on CX pelletizing line",
        "Dual-piston non-stop hydraulic screen changer for continuous operation",
        "High-density uniform pellet output ready for immediate re-extrusion"
      ],
      "faqs": [
        {
          "question": "Can printed scrap film be recycled without pre-washing using the CX line?",
          "answer": "Yes. The CX closed-loop recycling line integrates dual-zone high-vacuum degassing to remove volatile printing ink vapors and moisture, producing bubble-free, high-density granules ready for immediate re-extrusion."
        }
      ]
    }
  ]
}
````

## File: components/AboutAtmosphere.tsx
````typescript
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
⋮----
const resize = () =>
⋮----
const hash = (x: number, y: number) =>
const noise = (x: number, y: number) =>
const fbm = (x: number, y: number) =>
⋮----
const onMove = (e: MouseEvent) =>
const onLeave = () =>
⋮----
const render = () =>
⋮----
const start = () =>
const stop = () =>
````

## File: components/EditorialKit.tsx
````typescript
import type { ReactNode } from "react";
⋮----
export function Grain(
⋮----
export function PlusMark(
````

## File: components/MachineSubNav.tsx
````typescript
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { categories } from "@/lib/products";
````

## File: components/PageNav.tsx
````typescript
export default function PageNav()
````

## File: components/ProactiveNudge.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { openAshaChat, ASHA_STATE_EVENT } from "./ChatWidget";
import { LEAD_POPUP_STATE_EVENT } from "./ProductLeadCapture";
⋮----
function getSeenSlugs(): Set<string>
function markSeen(slug: string)
⋮----
const onState = (e: Event) =>
const onLeadPopupState = (e: Event) =>
⋮----
onClick=
````

## File: components/ProductLeadCapture.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getVisitorSessionId } from "@/lib/clientSession";
import { ASHA_STATE_EVENT } from "./ChatWidget";
⋮----
function alreadyShown(): boolean
function markShown()
function broadcast(open: boolean)
⋮----
const onState = (e: Event) =>
⋮----
function close()
⋮----
async function submit(e: React.FormEvent)
⋮----
onChange=
````

## File: components/SpecTable.tsx
````typescript
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ProductFamily } from "@/lib/products";
⋮----
function handleWheel(e: React.WheelEvent<HTMLDivElement>)
````

## File: data/home-hero.ar.json
````json
{
  "eyebrow": "الماكينات في العمل",
  "headline1": ".مصنّعة لأرضية المصنع",
  "headline2": ".مثبتة الجدارة عالميًا",
  "description": "خطوط بثق رقائق البلاستيك وصناعة الأكياس وإعادة التدوير عالية الأداء — صُممت لتحقيق أقصى إنتاجية وكفاءة في استهلاك الطاقة وتشغيل صناعي مستمر.",
  "primaryLabel": "استكشف الماكينات",
  "primaryHref": "/products",
  "secondaryLabel": "اطلب عرض سعر",
  "secondaryHref": "/inquiries",
  "featured": [
    { "slug": "abcde-2200" },
    { "slug": "abc-multilayer-small" },
    { "slug": "abc-multilayer-large" },
    { "slug": "abc-cx-series" },
    { "slug": "aba-1000-1500" }
  ]
}
````

## File: data/home-hero.hi.json
````json
{
  "eyebrow": "गतिशील मशीनरी",
  "headline1": "फ़ैक्टरी फ़्लोर के लिए बनी।",
  "headline2": "दुनिया भर में सिद्ध।",
  "description": "उच्च प्रदर्शन वाली ब्लोन फिल्म, बैग मेकिंग और रीसाइक्लिंग एक्सट्रूज़न लाइनें — अधिकतम आउटपुट, ऊर्जा दक्षता और 24/7 निरंतर औद्योगिक उत्पादन के लिए इंजीनियर।",
  "primaryLabel": "मशीनें देखें",
  "primaryHref": "/products",
  "secondaryLabel": "कोटेशन प्राप्त करें",
  "secondaryHref": "/inquiries",
  "featured": [
    { "slug": "abcde-2200" },
    { "slug": "abc-multilayer-small" },
    { "slug": "abc-multilayer-large" },
    { "slug": "abc-cx-series" },
    { "slug": "aba-1000-1500" }
  ]
}
````

## File: lib/adminAuth.ts
````typescript
import { AdminRole } from "./adminRoles";
⋮----
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}
⋮----
function getSecret(): string
⋮----
function toBase64Url(bytes: Uint8Array): string
⋮----
function fromBase64Url(str: string): string
⋮----
async function hmac(payload: string): Promise<string>
⋮----
export async function createSessionToken(user?: Partial<SessionUser>): Promise<string>
⋮----
export async function parseSessionToken(token: string | undefined): Promise<SessionUser | null>
⋮----
export async function verifySessionToken(token: string | undefined): Promise<boolean>
⋮----
export function sessionCookieOptions()
````

## File: lib/emailTemplate.ts
````typescript
export interface EmailLayoutOptions {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}
⋮----
export function renderEmailLayout(
⋮----
export function infoBlock(rows:
⋮----
export function messageBlock(html: string): string
⋮----
export function dataTable(headers: string[], rows: string[][]): string
````

## File: lib/faqData.ts
````typescript

````

## File: lib/leadDrafts.ts
````typescript
import { connectDB } from "@/lib/mongodb";
import ChatSession, { type ChatMessageDoc } from "@/models/ChatSession";
import VisitorSession, { type PageViewEntry } from "@/models/VisitorSession";
import SystemState from "@/models/SystemState";
import { groqJsonCompletion } from "@/lib/groq";
import { formatDuration } from "@/lib/format";
⋮----
export async function maybeProcessLeadDrafts(): Promise<void>
````

## File: lib/leadNotify.ts
````typescript
import { connectDB } from "@/lib/mongodb";
import { sendEmail } from "@/lib/resend";
import VisitorSession from "@/models/VisitorSession";
import { renderEmailLayout, infoBlock } from "@/lib/emailTemplate";
import { formatDuration } from "@/lib/format";
⋮----
function escapeHtml(s: string)
⋮----
export interface LeadCapturedInput {
  sessionId: string;
  name?: string;
  email: string;
  machineName?: string;
}
⋮----
/** Best-effort — never throws, so a failed notification never blocks the chat turn. */
export async function notifyLeadCaptured(input: LeadCapturedInput)
````

## File: lib/news.ts
````typescript
export type NewsBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };
⋮----
export interface NewsArticle {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  body: NewsBlock[];
  image: string;
  tags: string[];
  links?: { label: string; url: string }[];
}
⋮----
export interface NewsData {
  articles: NewsArticle[];
}
⋮----
const inline = (s: string)
⋮----
export function renderNewsBody(blocks: NewsBlock[]): string
⋮----
export const articleBySlug = (data: NewsData, slug: string)
⋮----
export const latestArticles = (data: NewsData, n = 4)
````

## File: lib/openrouter.ts
````typescript
import { categories, families } from "@/lib/products";
import type { ChatMessageDoc } from "@/models/ChatSession";
import type { LocalAnswer } from "@/lib/localAgent";
⋮----
function getApiKey(): string
⋮----
function buildCatalogBlock(): string
⋮----
interface OpenRouterMsg {
  role: "system" | "user" | "assistant";
  content: string;
}
⋮----
export async function answerWithOpenRouter(
  messages: ChatMessageDoc[],
  pendingInquiry: LocalAnswer["pendingInquiry"],
): Promise<LocalAnswer>
⋮----
// Strip markdown fences if present
⋮----
// Find the first JSON object in the text if surrounded by non-JSON
⋮----
// 404 means this model id is gone/renamed on OpenRouter's end — try the
// next model instead of aborting; only bail early on auth failures.
````

## File: lib/track.ts
````typescript
import { getVisitorSessionId } from "./clientSession";
⋮----
interface NetworkInformation { effectiveType?: string; }
⋮----
function post(payload: Record<string, unknown>)
⋮----
function deviceSignals()
⋮----
export function trackPageview(path: string, durationMs?: number, extra?:
⋮----
export function trackChatOpen()
````

## File: lib/useScrollReveal.ts
````typescript
import { useEffect, type RefObject } from "react";
⋮----
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>)
````

## File: models/AdminCredentials.ts
````typescript
import { Schema, model, models } from "mongoose";
⋮----
export interface IAdminCredentials {
  singleton: true;
  email: string;
  password?: string;
  passwordHash: string;
  role?: string;
  isSuperAdmin?: boolean;
  hidden?: boolean;
  locked?: boolean;
  pendingEmail?: string;
  pendingEmailToken?: string;
  pendingEmailExpires?: Date;
  updatedAt: Date;
}
````

## File: models/ChatSession.ts
````typescript
import { Schema, model, models } from "mongoose";
⋮----
export interface ChatMessageDoc {
  role: "user" | "assistant";
  content: string;
  at: Date;
}
⋮----
export type ChatAction =
  | { type: "navigate"; slug: string }
  | { type: "show_machines"; slugs: string[] }
  | { type: "compare"; slugs: string[]; specLabels: string[] }
  | { type: "quick_replies"; options: string[] };
⋮----
export interface PendingInquiryDoc {
  stage: "name" | "email" | "qty" | "done";
  slug?: string;
  machineName?: string;
  name?: string;
  email?: string;
  qty?: number;
}
⋮----
export interface HookDraft {
  subject: string;
  body: string;
  generatedAt: Date;
  status: "pending" | "sent" | "dismissed" | "failed";
  sentAt?: Date;
}
⋮----
export interface IChatSession {
  sessionId: string;
  messages: ChatMessageDoc[];
  contactCaptured?: { name?: string; email?: string; phone?: string };
  pendingInquiry?: PendingInquiryDoc | null;
  leadNotified?: boolean;
  leadCapturedAt?: Date | null;
  hookDraft?: HookDraft | null;
  createdAt: Date;
}
````

## File: models/Inquiry.ts
````typescript
import mongoose, { Schema, model, models } from "mongoose";
⋮----
export interface InquiryMachine {
  slug: string;
  name: string;
  series: string;
  model: string;
  qty: number;
  notes: string;
  images?: string[];
}
⋮----
export interface InquiryPart {
  name: string;
  machine: string;
  machineSlug: string;
  quantity: number;
  notes: string;
  images: string[];
}
⋮----
export interface InquiryReply {
  message: string;
  images: string[];
  sentAt: Date;
  sentBy: string;
}
⋮----
export interface InquiryRoadmap {
  text: string;
  nextTouchpointDays: number;
  generatedAt: Date;
  basedOnReplyCount: number;
}
⋮----
export type InquiryType = "talk-to-engineer" | "direct" | "parts";
⋮----
export interface IInquiry {
  inquiryType: InquiryType;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  images: string[];
  machines: InquiryMachine[];
  parts: InquiryPart[];
  status: "new" | "read" | "replied";
  replies: InquiryReply[];
  source: string;
  flow: string;
  sessionId?: string;
  roadmap?: InquiryRoadmap | null;
  createdAt: Date;
}
⋮----
// Prevent model recompilation in Next.js hot-reload
````

## File: models/VisitorSession.ts
````typescript
import { Schema, model, models } from "mongoose";
⋮----
export interface PageViewEntry {
  path: string;
  enteredAt: Date;
  durationMs: number;
}
⋮----
export interface AiInsight {
  text: string;
  intentSignal: "high" | "medium" | "low";
  generatedAt: Date;
  basedOnPageCount: number;
  basedOnMessageCount: number;
}
⋮----
export interface IVisitorSession {
  sessionId: string;
  ip: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
  clientTimezone?: string;
  connectionType?: string;
  referrer?: string;
  source?: string;
  landingPath?: string;
  locale?: string;
  pageViews: PageViewEntry[];
  totalDurationMs: number;
  chatOpened: boolean;
  aiInsight?: AiInsight | null;
  firstSeen: Date;
  lastSeen: Date;
}
⋮----
// TTL index: Mongo deletes the document 180 days after lastSeen — long
// enough for real behavioral analysis, short enough not to accumulate
// visitor IPs/UAs indefinitely. Keyed off lastSeen (not firstSeen) so a
// sliding window keeps active/returning visitors alive rather than
// expiring them on a fixed clock from their very first visit.
````

## File: scripts/generateSeoData.js
````javascript
function generateSeoDataForFamily(f)
⋮----
async function syncToMongo()
````

## File: app/[locale]/about/AboutClient.tsx
````typescript
import { useState, useEffect, useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import TransitionLink from "@/components/TransitionLink";
import AboutAtmosphere from "@/components/AboutAtmosphere";
import Image from "next/image";
import { useScrollReveal } from "@/lib/useScrollReveal";
⋮----
function useCountUp(target: number, active: boolean, duration = 1400)
⋮----
const tick = (now: number) =>
⋮----
function useInView<T extends HTMLElement>(threshold = 0.25)
⋮----
<div className="ab-chart__bars" role="img" aria-label=
⋮----
<svg viewBox="0 0 160 160" className="ab-donut__svg" role="img" aria-label=
⋮----
<div className="ab-hbars" role="img" aria-label=
⋮----
const checkTheme = () =>
````

## File: app/[locale]/faq/page.tsx
````typescript
import { pageMetadata } from "@/lib/seo";
import { FAQ_ITEMS } from "@/lib/faqData";
import JsonLd from "@/components/JsonLd";
import FaqClient from "./FaqClient";
⋮----
import { routing } from "@/i18n/routing";
⋮----
export function generateStaticParams()
⋮----
export function generateMetadata(
⋮----
export default function FaqPage()
````

## File: app/[locale]/inquiries/direct/page.tsx
````typescript
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { families, familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import { getVisitorSessionId } from "@/lib/clientSession";
import TransitionLink from "@/components/TransitionLink";
import {
  Field, Section, MachinePicker,
  InsightPanel, ReviewCard, ImageGallery, chatStyles, type ReviewRow,
} from "@/components/ChatInquiry";
⋮----
interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}
⋮----
async function uploadImage(file: File)
⋮----
async function send()
⋮----
<Section title=
⋮----
<Field label=
⋮----
<input type="text" value=
⋮----
<input type="email" value=
⋮----
onClick=
⋮----
!family ?
````

## File: app/[locale]/inquiries/parts/page.tsx
````typescript
import { Suspense, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import { getVisitorSessionId } from "@/lib/clientSession";
import TransitionLink from "@/components/TransitionLink";
import {
  Field, Section, MachinePicker, EntryRow, AddAnotherButton,
  InsightPanel, ReviewCard, chatStyles, type ReviewRow,
} from "@/components/ChatInquiry";
⋮----
interface PartEntry {
  name: string;
  machine: string;
  machineSlug: string;
  quantity: number;
  notes: string;
  images: string[];
}
⋮----
interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}
⋮----
async function uploadImage(file: File)
⋮----
function addPart()
function removePart(i: number)
⋮----
async function send()
⋮----
<Section title=
⋮----
meta=
⋮----
<Field label=
<input type="text" value=
⋮----
<input type="email" value=
⋮----
onClick=
⋮----
parts.length === 0 ?
````

## File: app/[locale]/legal/page.tsx
````typescript
import { pageMetadata } from "@/lib/seo";
import LegalClient from "./LegalClient";
import { routing } from "@/i18n/routing";
⋮----
export function generateStaticParams()
⋮----
export function generateMetadata(
⋮----
export default function LegalPage()
````

## File: app/[locale]/products/page.tsx
````typescript
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata } from "@/lib/seo";
import CatalogueClient from "./CatalogueClient";
⋮----
export function generateMetadata(
⋮----
export default async function ProductsIndex()
````

## File: app/api/admin/settings/email/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { requestEmailChange, getAdminEmail } from "@/lib/adminCredentials";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/emailTemplate";
⋮----
export async function GET()
⋮----
export async function POST(req: NextRequest)
````

## File: app/cx-ops-x7k9q2/analytics/page.tsx
````typescript
import { useEffect, useMemo, useState } from "react";
import { Terminal, Globe, Clock, Users, Activity, MessageSquare, Mail } from "lucide-react";
import AdminShell from "../AdminShell";
import SessionDetailPanel from "./SessionDetailPanel";
import { formatDuration } from "@/lib/format";
⋮----
interface Totals {
  totalSessions: number;
  sessionsToday: number;
  avgDurationMs: number;
  chatOpenRate: number;
}
interface CountryRow { countryCode: string; count: number; }
interface PageRow { path: string; views: number; avgDurationMs: number; }
interface ChatRow { sessionId: string; countryCode: string; lastQuestion: string; messageCount: number; at: string; }
interface SessionRow {
  sessionId: string; countryCode: string; region: string; city: string;
  device: string; browser: string; os: string; landingPath: string;
  referrer: string; source: string; pageCount: number; totalDurationMs: number;
  chatOpened: boolean; firstSeen: string; lastSeen: string;
}
interface DraftRow { sessionId: string; countryCode: string; name: string; email: string; subject: string; generatedAt: string; }
interface AnalyticsData {
  totals: Totals;
  byCountry: CountryRow[];
  topPages: PageRow[];
  recentSessions: SessionRow[];
  chatActivity: ChatRow[];
  pendingHookDrafts: DraftRow[];
}
⋮----
function flagEmoji(code: string)
⋮----
function timeAgo(iso: string)
⋮----
function TypedLine(
⋮----
<td>
⋮----
````

## File: app/cx-ops-x7k9q2/analytics/SessionDetailPanel.tsx
````typescript
import { useEffect, useState, useCallback } from "react";
import { X, MapPin, Monitor, Clock, Mail, Send, Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/format";
⋮----
interface PageViewEntry { path: string; enteredAt: string; durationMs: number; }
interface HookDraft { subject: string; body: string; generatedAt: string; status: "pending" | "sent" | "dismissed" | "failed"; sentAt?: string; }
interface SessionDetail {
  sessionId: string; ip: string; countryCode: string; region: string; city: string;
  latitude: string; longitude: string; timezone: string;
  browser: string; os: string; device: string; userAgent: string;
  screenWidth?: number; screenHeight?: number; viewportWidth?: number; viewportHeight?: number;
  language: string; clientTimezone: string; connectionType: string;
  referrer: string; source: string; landingPath: string; locale: string;
  totalDurationMs: number; chatOpened: boolean;
  firstSeen: string; lastSeen: string;
}
interface ChatMsg { role: "user" | "assistant"; content: string; at: string; }
interface DetailResponse {
  session: SessionDetail;
  journey: PageViewEntry[];
  longestPage: PageViewEntry | null;
  chat: { messages: ChatMsg[]; contactCaptured: { name?: string; email?: string; phone?: string } | null; hookDraft: HookDraft | null } | null;
}
⋮----
function flagEmoji(code: string)
⋮----
function formatClock(iso: string)
⋮----
async function actOnDraft(action: "send" | "dismiss")
⋮----
⋮----
<span className="sdp-journey-dur">
⋮----
{/* ── chat transcript ── */}
````

## File: app/cx-ops-x7k9q2/admin.css
````css
:root {
⋮----
.adm-btn {
⋮----
.adm-btn:hover:not(:disabled) {
⋮----
.adm-btn:active:not(:disabled) {
⋮----
.adm-btn:disabled {
⋮----
.adm-btn-secondary {
⋮----
.adm-btn-secondary:hover {
⋮----
.adm-btn-danger {
⋮----
.adm-btn-danger:hover {
⋮----
[data-admin] {
⋮----
[data-admin] * {
⋮----
.adm-rise {
⋮----
.adm-shell {
⋮----
.adm-side {
⋮----
.adm-side::-webkit-scrollbar {
.adm-side::-webkit-scrollbar-thumb {
⋮----
.adm-brand {
.adm-brand__logo {
.adm-brand__name {
⋮----
.adm-side__search {
.adm-side__search-icon {
.adm-side__search-input {
.adm-side__search-input:focus {
.adm-side__search-input::placeholder {
⋮----
.adm-side__grid {
.adm-side__grid-btn {
.adm-side__grid-btn:hover {
.adm-side__grid-btn--active {
.adm-side__grid-btn--active svg {
⋮----
.adm-side__group {
.adm-side__group-head {
.adm-side__group-items {
.adm-side__item {
.adm-side__item:hover {
.adm-side__item--active {
.adm-side__bullet {
⋮----
.adm-side__user {
.adm-side__user-info {
.adm-side__user-avatar {
.adm-side__user-name {
.adm-side__user-role {
.adm-side__user-btn {
.adm-side__user-btn:hover {
⋮----
.adm-main {
⋮----
.adm-header {
.adm-breadcrumb {
.adm-breadcrumb span { color: var(--adm-mint); font-weight: 600; }
.adm-title {
.adm-subtitle {
.adm-header__actions {
.adm-icon-btn {
.adm-icon-btn:hover {
⋮----
.adm-top-row {
⋮----
.adm-stats-grid {
.adm-stat-card {
.adm-stat-card:hover {
.adm-stat-card__top {
.adm-stat-card__icon {
.adm-stat-card__val {
.adm-stat-card__lbl {
⋮----
.adm-gauge-card {
.adm-gauge-wrap {
.adm-gauge-svg {
.adm-gauge-center {
.adm-gauge-val {
.adm-gauge-sub {
.adm-gauge-ticks {
⋮----
.adm-mid-row {
⋮----
.adm-card {
.adm-card__head {
.adm-card__title {
.adm-card__more {
.adm-card__more:hover { color: #fff; }
⋮----
.adm-tabs {
.adm-tab {
.adm-tab--active {
⋮----
.adm-task-item {
.adm-task-item__head {
.adm-task-item__title {
.adm-task-item__sub {
.adm-task-item__badge {
.adm-task-item__foot {
⋮----
.adm-kpi-val {
.adm-chart-wrap {
⋮----
.adm-badges-grid {
.adm-badge-box {
.adm-badge-box__top {
.adm-badge-box__val {
⋮----
.adm-bars-wrap {
.adm-bar-col {
.adm-bar-val {
.adm-bar-fill {
.adm-bar-lbl {
⋮----
.adm-table-card {
.adm-table-head {
.adm-table-search {
.adm-table-search input {
.adm-table-search input:focus { border-color: var(--adm-mint); }
.adm-table-search svg {
⋮----
.adm-table-wrap {
.adm-table {
.adm-table th {
.adm-table td {
.adm-table tr:last-child td { border-bottom: none; }
.adm-table tr:hover td { background: rgba(255,255,255,0.015); }
⋮----
.adm-status-pill {
.adm-status-pill--active {
.adm-status-pill--pending {
.adm-status-pill--replied {
⋮----
.adm-cell-user {
.adm-cell-avatar {
.adm-cell-avatar img {
.adm-cell-name {
.adm-cell-sub {
⋮----
.adm-top-row { grid-template-columns: 1fr; }
.adm-mid-row { grid-template-columns: 1fr; }
.adm-stats-grid { grid-template-columns: 1fr 1fr; }
⋮----
.adm-side { transform: translateX(-100%); transition: transform 0.28s var(--adm-ease); }
.adm-side.adm-side--open { transform: translateX(0); }
.adm-main { margin-left: 0; padding: 1.2rem; }
.adm-badges-grid { grid-template-columns: repeat(3, 1fr); }
````

## File: app/cx-ops-x7k9q2/layout.tsx
````typescript
import type { Metadata } from "next";
⋮----
export default function AdminLayout(
````

## File: components/LineTemplateShowcase.tsx
````typescript
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { familyBySlug, familyImage, familyImages } from "@/lib/products";
import type { LineTemplate } from "@/lib/productionLineTemplates";
import { openAshaChat } from "@/components/ChatWidget";
⋮----
type Tab = "overview" | "installation" | "ai";
type Mode = "overview" | "explore";
⋮----
function goTo(i: number)
⋮----
function explore(fromIdx = 0)
⋮----
function askAiAboutMachine()
⋮----
function askAiAboutLine()
⋮----
⋮----
<button type="button" className="lts__nav-btn" disabled=
````

## File: components/ProductionLineTeaser.tsx
````typescript
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
⋮----
function dismiss()
⋮----
<div className=
````

## File: components/ProductStage3D.tsx
````typescript
import { useRef, useState, useCallback, useEffect } from "react";
import Image, { type StaticImageData } from "next/image";
⋮----
interface Props {
  src: string | StaticImageData;
  alt: string;
  badge?: string;
  photoKey: number | string;
  priority?: boolean;
  variant?: "hero" | "card";
  sizes?: string;
  eager?: boolean;
  bare?: boolean;
  cover?: boolean;
}
⋮----
export default function ProductStage3D(
⋮----
onLoad=
````

## File: components/SectionReveal.tsx
````typescript
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
⋮----
interface Props {
  children: React.ReactNode;
  skip?: boolean;
  delay?: number;
}
⋮----
export default function SectionReveal(
````

## File: data/home-hero.json
````json
{
  "eyebrow": "Machinery in motion",
  "headline1": "Built for the floor.",
  "headline2": "Proven worldwide.",
  "description": "Blown film · Bag making · Recycling lines — built for 24/7 output.",
  "primaryLabel": "Explore machines",
  "primaryHref": "/products",
  "secondaryLabel": "Request a quote",
  "secondaryHref": "/inquiries",
  "featured": [
    { "slug": "abcde-2200" },
    { "slug": "t-pro-heatseal" },
    { "slug": "flexo-6c" },
    { "slug": "cx-pelletizing" },
    { "slug": "abc-multilayer-large" },
    { "slug": "aba-1000-1500" }
  ]
}
````

## File: lib/adminCredentials.ts
````typescript
import { connectDB } from "@/lib/mongodb";
import AdminCredentials from "@/models/AdminCredentials";
⋮----
async function hashPassword(password: string): Promise<string>
⋮----
async function checkPassword(password: string, stored: string): Promise<boolean>
⋮----
async function getOrSeedCredentials()
⋮----
export async function verifyCredentials(email: string, password: string): Promise<boolean>
⋮----
export async function getAdminEmail(): Promise<string | null>
⋮----
export async function changePassword(currentPassword: string, newPassword: string): Promise<
⋮----
export async function requestEmailChange(currentPassword: string, newEmail: string): Promise<
⋮----
export async function confirmEmailChange(token: string): Promise<
````

## File: lib/cmsSchemas.ts
````typescript
export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "productSelect"
  | "image"
  | "images"
  | "stringlist"
  | "pairs"
  | "kvlist"
  | "features"
  | "specs"
  | "steps"
  | "phases"
  | "gallery"
  | "videos"
  | "reviews"
  | "stagePhotos"
  | "customSections"
  | "parts"
  | "richtext"
  | "links";
⋮----
export interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[];
  hint?: string;
  group?: string;
}
⋮----
export interface Collection {
  key: string;
  label: string;
  singular?: string;
  titleKeys: string[];
  fields: Field[];
  groups?: string[];
  canAdd?: boolean;
  template?: Record<string, unknown>;
}
⋮----
export interface SectionSchema {
  slug: string;
  title: string;
  description: string;
  rootFields?: Field[];
  collections: Collection[];
}
⋮----
export function schemaBySlug(slug: string): SectionSchema | undefined
````

## File: lib/gemini.ts
````typescript
export interface GeminiChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}
⋮----
export async function geminiJsonCompletion(
  messages: GeminiChatMsg[],
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<string>
````

## File: lib/inquiries.ts
````typescript
import { connectDB } from "@/lib/mongodb";
import Inquiry, { type InquiryMachine, type InquiryPart, type InquiryType } from "@/models/Inquiry";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout, infoBlock, messageBlock, dataTable } from "@/lib/emailTemplate";
⋮----
export interface CreateInquiryInput {
  inquiryType?: InquiryType;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
  images?: string[];
  machines?: InquiryMachine[];
  parts?: InquiryPart[];
  source?: string;
  flow?: string;
  sessionId?: string;
}
⋮----
function escapeHtml(s: string)
⋮----
export async function createInquiry(body: CreateInquiryInput)
⋮----
// Lowercased so it matches exactly what the customer-portal login (which
// normalizes the entered address the same way) queries against — email
// local parts aren't meaningfully case-sensitive in practice, and every
// downstream lookup (login, roadmap repeat-customer matching) assumes this.
````

## File: .gitignore
````
node_modules/
.next/
*.node
data.zip
SEO-GEO-AEO-Skill-main.zip
seo-audits/
# data/ — CMS content (data/*.json) must be committed; was previously ignored
tsconfig.tsbuildinfo
*.tsbuildinfo
.env
.env.local
.env*.local
*.log
.DS_Store

# About page video frames (served from Cloudinary)
public/about-frames/

# About page hero video — served from Cloudinary, not committed (large binary)
public/about-hero.mp4
/l.mp4

# Ad-hoc dev/testing screenshots — not part of the app
/shots/
````

## File: app/[locale]/inquiries/talk-to-engineer/page.tsx
````typescript
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { toast } from "sonner";
import { families, familiesByCategory, type ProductFamily, type CategorySlug } from "@/lib/products";
import { getVisitorSessionId } from "@/lib/clientSession";
import TransitionLink from "@/components/TransitionLink";
import {
  Field, Section, MachineGrid, EntryRow, AddAnotherButton,
  InsightPanel, ReviewCard, ImageGallery, chatStyles, type ReviewRow,
} from "@/components/ChatInquiry";
import AiReviewChat from "@/components/AiReviewChat";
⋮----
interface MachineEntry {
  family: ProductFamily;
  modelIdx: number;
  qty: number;
  notes: string;
}
⋮----
interface PartEntry {
  name: string;
  machine: string;
  machineSlug: string;
  quantity: number;
  notes: string;
  images: string[];
}
⋮----
interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}
⋮----
function addMachine()
function removeMachine(i: number)
⋮----
async function uploadPartImage(file: File)
function addPart()
function removePart(i: number)
⋮----
// ── AI review chat callbacks — the chat suggests changes, these apply them
//    to the same machines/parts state the manual form above edits. ──────
function aiAddMachine(slug: string)
function aiEditMachineQty(index: number, qty: number)
function aiEditMachineNotes(index: number, notes: string)
function aiAddPart(name: string)
⋮----
async function uploadImage(file: File)
⋮----
async function send()
⋮----
title=
⋮----
onRemove=
⋮----
<Field label=
⋮----
meta=
⋮----
onClick=
⋮----
<input type="text" value=
⋮----
<input type="email" value=
⋮----
machines.length === 0 && parts.length === 0 ?
canReview ?
````

## File: app/[locale]/production-line/page.tsx
````typescript
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import ProductionLineClient from "./ProductionLineClient";
⋮----
export function generateMetadata(
⋮----
export default function ProductionLinePage()
````

## File: app/api/chat/route.ts
````typescript
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import { answerWithGroq } from "@/lib/groq";
import { answerWithOpenRouter } from "@/lib/openrouter";
import { answerLocally, isBasicQuery } from "@/lib/localAgent";
import { createInquiry } from "@/lib/inquiries";
import { notifyLeadCaptured } from "@/lib/leadNotify";
⋮----
export async function GET(req: NextRequest)
⋮----
export async function POST(req: NextRequest)
⋮----
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T>
⋮----
// Same NDJSON framing the Grok-backed route used, so the widget's parser
// (ChatWidget.tsx) needs no changes: one delta frame with the full text
// (no real streaming needed — the engine answers synchronously), then the
// final frame carrying the structured actions.
````

## File: app/cx-ops-x7k9q2/invite/page.tsx
````typescript
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, Lock, CheckCircle2, AlertCircle, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { ADMIN_PATH } from "@/lib/adminAuth";
⋮----
async function handleActivate(e: React.FormEvent)
````

## File: app/cx-ops-x7k9q2/settings/page.tsx
````typescript
import { useEffect, useState } from "react";
import {
  KeyRound, Mail, ShieldCheck, Loader2, CheckCircle2, AlertCircle,
  UserPlus, Users, Copy, Lock, RefreshCw, Trash2, Eye, EyeOff, ShieldAlert, Sparkles, ExternalLink
} from "lucide-react";
import AdminShell from "../AdminShell";
import { AdminRole, AdminUser, MagicLinkInvitation, SecurityAuditItem } from "@/lib/adminRoles";
⋮----
function Notice(
⋮----
async function submit(e: React.FormEvent)
⋮----
function copyToClipboard()
⋮----
function copyLinkOnly()
⋮----
async function handleRoleChange(userId: string, newRole: AdminRole)
⋮----
async function handleRevoke(userId: string, email: string)
⋮----
async function handleResetPassword(e: React.FormEvent)
⋮----
onClick=
⋮----
function loadRolesData()
````

## File: app/sitemap.ts
````typescript
import type { MetadataRoute } from "next";
import { SITE_URL, categories, families } from "@/lib/products";
import { locales, defaultLocale } from "@/i18n/routing";
import { localePath } from "@/lib/seo";
import newsData from "@/data/news.json";
import { getMachineCategories, getMachineProducts } from "@/lib/machinesData";
⋮----
function languageAlternates(path: string): Record<string, string>
⋮----
export default function sitemap(): MetadataRoute.Sitemap
⋮----
// Categories from legacy productsData
````

## File: components/AiAgentBanner.tsx
````typescript
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { openAshaChat } from "@/components/ChatWidget";
⋮----
const st = () => (
````

## File: components/AudienceSection.tsx
````typescript
import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TransitionLink from "@/components/TransitionLink";
import AetherBtn from "@/components/AetherBtn";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";
````

## File: components/ChatInquiry.tsx
````typescript
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ProductFamily, CategorySlug } from "@/lib/products";
import { categories, familiesByCategory, familyImage, familyBySlug, familyImages } from "@/lib/products";
⋮----
function specMagnitude(v: string): number
⋮----
/* ─── shared building blocks for the 3 inquiry forms (talk-to-engineer,
   direct, parts). All fields are visible on one scrollable page — like
   writing a document, not answering one prompt at a time — grouped into
   labelled sections with a review step before the final send. ──────── */
⋮----
/** A labelled field wrapper — section building block for the single-page form. */
export function Field({ label, hint, required, children }: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
})
⋮----
export function Section({ title, subtitle, children, actions }: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
})
⋮----
<Field label=
⋮----
onClick=
⋮----
<Image src=
⋮----
<button type="button" className="ci-entry__remove" onClick=
⋮----
function commit()
⋮----
<button type="button" className="ci-gallery__remove" onClick=
⋮----
⋮----
<span className="ci-linesum__meta">
⋮----
/** Live side panel — updates as the visitor picks a machine/model: photo,
 *  top specs for that model, a contextual tip, and related machines to
 *  cross-sell. Renders an empty placeholder before any machine is picked. */
````

## File: components/FlexoPrintingPage.tsx
````typescript
import { useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import { CldImage } from "next-cloudinary";
import { familiesByCategory, type ProductFamily } from "@/lib/products";
import SpecTable from "@/components/SpecTable";
import { useScrollReveal } from "@/lib/useScrollReveal";
````

## File: components/LoadingScreen.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
````

## File: components/ThemeToggle.tsx
````typescript
import { useEffect, useState } from "react";
⋮----
const toggle = () =>
````

## File: components/WaveBackground.tsx
````typescript
import { useEffect, useRef } from "react";
⋮----
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
}
⋮----
function resize()
⋮----
function onPointerMove(e: PointerEvent)
⋮----
function frame(t: number)
````

## File: lib/localAgent.ts
````typescript
import { categories, families, type ProductFamily, type CategorySlug } from "@/lib/products";
import { classifyFlowReply, type FlowClassification, type FlowStage } from "@/lib/groq";
import type { ChatAction, PendingInquiryDoc as PendingInquiry } from "@/models/ChatSession";
⋮----
export interface LocalAnswer {
  text: string;
  actions: ChatAction[];
  pendingInquiry?: PendingInquiry | null;
  completedInquiry?: { name: string; email: string; qty: number; slug: string; machineName: string };
}
⋮----
function normalize(s: string): string
⋮----
function fuzzyIncludes(haystack: string, needle: string): boolean
⋮----
function findMachines(message: string): ProductFamily[]
⋮----
function findCategory(message: string): CategorySlug | null
⋮----
function parseNumericTarget(message: string): number | null
⋮----
function parseColorTarget(message: string): number | null
⋮----
function findByExactSpec(labelPattern: RegExp, target: number, category: CategorySlug | null): ProductFamily[]
⋮----
function specSummary(f: ProductFamily): string
⋮----
// Conversational filler/acknowledgement tokens that must never be captured
// as a person's name — without this check, replying "ok" to "what's your
// name?" would literally set the visitor's name to "Ok". Checked per-word
// (see isFillerOnly) so multi-word filler like "yeah sure" or "got it" is
// caught too, not just single-word replies.
⋮----
// Words that open a genuine question ("How do I install this?") rather than
// a name reply — only checked together with a "?" and 3+ words, so a name
// typed with a stray trailing "?" (e.g. "pias?") is never caught by this.
⋮----
// Explicit intent to back out of the guided flow — checked before any
// stage-specific logic so it works from name/email/qty alike, instead of
// leaving the visitor stuck re-answering the same prompt with no way out.
⋮----
/** Lowercases, strips punctuation (keeping letters/digits/apostrophe/hyphen — Unicode-aware, not Latin-only), and splits into words. */
function normalizeWords(raw: string): string[]
⋮----
function isCancelIntent(raw: string): boolean
⋮----
function isFillerOnly(words: string[]): boolean
⋮----
function looksLikeQuestion(raw: string, words: string[]): boolean
⋮----
/**
 * True if `raw` plausibly reads as a person's name rather than filler, an
 * acknowledgement, or a question. Unicode-letter-aware (not a Latin-only
 * character allowlist) so real names in Arabic/Hindi script — this site
 * ships ar/hi locales — aren't rejected as "not looking like a name". Trailing
 * punctuation ("pias?") is stripped rather than treated as an automatic
 * disqualifier, so a stray "?" doesn't reject an otherwise valid name.
 */
function looksLikeName(raw: string): boolean
⋮----
if (words.join("").length < 2) return false; // single character ("k", "y") is filler, not an initial
⋮----
async function classifyFlowReplySafe(stage: FlowStage, message: string, machineName: string): Promise<FlowClassification>
⋮----
function completeInquiry(pending: PendingInquiry, qty: number): LocalAnswer
⋮----
async function continueInquiryFlow(message: string, pending: PendingInquiry): Promise<LocalAnswer>
⋮----
function startInquiryFlow(machine: ProductFamily | undefined, contact?:
⋮----
export function isBasicQuery(rawMessage: string, pendingInquiry: PendingInquiry | null | undefined): boolean
⋮----
export async function answerLocally(
  rawMessage: string,
  pendingInquiry: PendingInquiry | null | undefined,
  contactCaptured?: { name?: string; email?: string },
): Promise<LocalAnswer>
⋮----
const closest = (f: ProductFamily) =>
````

## File: middleware.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { parseSessionToken, SESSION_COOKIE, ADMIN_PATH, MACHINE_MANAGER_SCHEMAS } from "@/lib/adminAuth";
import { routing } from "@/i18n/routing";
⋮----
export async function middleware(req: NextRequest)
⋮----
// ── RBAC Enforcement for Admin API routes ──
⋮----
// machine_manager: restricted from roles, settings, inquiries, analytics, and non-machine CMS mutations
⋮----
// every other page-rendering route resolves its locale (en/ar/hi)
⋮----
// run on the admin console + its API, on /api/admin/* specifically (the
// session check above is meaningless if this middleware never executes
// for those routes — the general "/((?!api|...))" pattern below
// excludes ALL of /api, admin included, so it has to be listed
// explicitly), and on every public page route (handled by next-intl,
// which skips the rest of /api, static files, and Next.js internals)
````

## File: app/[locale]/products/[category]/CategoryPageClient.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import type { Category, ProductFamily } from "@/lib/products";
import { familyImage } from "@/lib/products";
import { useScrollReveal } from "@/lib/useScrollReveal";
⋮----
function FeatureIcon(
⋮----
function firstSpec(f: ProductFamily, key: string): string | null
⋮----
interface Props {
  category: Category;
  families: ProductFamily[];
  allCategories: Category[];
}
⋮----
// mobile-only: category tabs collapse into a tap-to-expand dropdown
// showing the active category, instead of a horizontal swipe row
⋮----
/* stagger-reveal cards on scroll */
````

## File: app/[locale]/products/[category]/page.tsx
````typescript
import { notFound } from "next/navigation";
import FlexoPrintingPage from "@/components/FlexoPrintingPage";
import { categories, type CategorySlug } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata } from "@/lib/seo";
import { getMachineCategories, getMachineCategoryBySlug, getMachineProductsByCategory } from "@/lib/machinesData";
import CategoryPageClient from "./CategoryPageClient";
⋮----
export function generateStaticParams()
⋮----
export async function generateMetadata(
⋮----
export default async function CategoryPage(
````

## File: app/[locale]/products/CatalogueClient.tsx
````typescript
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { familyImage } from "@/lib/products";
import type { Category, ProductFamily } from "@/lib/products";
import ProductStage3D from "@/components/ProductStage3D";
import { useScrollReveal } from "@/lib/useScrollReveal";
⋮----
function SearchIcon()
⋮----
function ClearIcon()
⋮----
function ArrowIcon()
⋮----
const countFor = (slug: string | "all")
⋮----
onChange=
⋮----
aria-label=
⋮----
<button type="button" className="cat2-search__clear" onClick=
⋮----
onClick=
⋮----
<div className="cat2-hero__dots" role="tablist" aria-label=
````

## File: app/cx-ops-x7k9q2/login/page.tsx
````typescript
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2, Shield
} from "lucide-react";
import { ADMIN_PATH } from "@/lib/adminAuth";
⋮----
async function submit(e: React.FormEvent)
````

## File: components/ChatWidget.tsx
````typescript
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Link from "next/link";
import Image from "next/image";
import { HardHat, X } from "lucide-react";
import { getVisitorSessionId } from "@/lib/clientSession";
import { trackChatOpen } from "@/lib/track";
⋮----
export function openAshaChat(prefillMessage?: string)
⋮----
type ChatAction =
  | { type: "navigate"; slug: string }
  | { type: "show_machines"; slugs: string[] }
  | { type: "compare"; slugs: string[]; specLabels: string[] }
  | { type: "quick_replies"; options: string[] }
  | { type: "machine_detail"; slug: string };
⋮----
interface Msg {
  role: "user" | "assistant";
  content: string;
  at?: string;
  actions?: ChatAction[];
}
⋮----
interface MachineSummary {
  slug: string;
  name: string;
  series: string;
  tagline: string;
  category: string;
  categoryName: string;
  image: string;
  models: string[];
  specs: { label: string; values: string[] }[];
  href: string;
}
⋮----
function parseNumeric(v: string): number | null
⋮----
/** Machine suggestion cards — larger image left, data right, polished card UI with Explore + Inquire buttons. */
⋮----
onAnimationEnd=
⋮----
aria-label=
⋮----
placeholder=
````

## File: lib/adminRoles.ts
````typescript
import fs from "fs";
import path from "path";
import crypto from "crypto";
⋮----
export type AdminRole = "super_admin" | "content_editor" | "machine_manager" | "analytics_viewer";
⋮----
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: "active" | "invited" | "disabled";
  tempPassword?: string;
  createdAt: string;
  lastLoginAt?: string;
}
⋮----
export interface MagicLinkInvitation {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  tempPassword: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
  expiresAt: string;
}
⋮----
export interface SecurityAuditItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ip?: string;
}
⋮----
export interface RolesDatabase {
  users: AdminUser[];
  invitations: MagicLinkInvitation[];
  auditLog: SecurityAuditItem[];
  revokedEmails?: string[];
}
⋮----
export function readRolesDB(): RolesDatabase
⋮----
export function writeRolesDB(db: RolesDatabase): void
⋮----
export function logSecurityEvent(actor: string, action: string, details: string): void
⋮----
export function generateTempPassword(): string
⋮----
export function generateInviteToken(): string
````

## File: lib/products.ts
````typescript
export type CategorySlug = "film-blowing" | "bag-making" | "recycling" | "printing";
⋮----
export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  blurb: string;
}
⋮----
export interface SpecRow {
  label: string;
  values: string[];
}
⋮----
export interface SetupStep {
  title: string;
  detail: string;
  image?: string;
}
⋮----
export interface DeliveryPhase {
  label: string;
  duration: string;
  detail: string;
}
⋮----
export interface GalleryImage {
  src: string;
  caption: string;
}
⋮----
export interface ProductVideo {
  url: string;
  title: string;
}
⋮----
export interface ProductReview {
  name: string;
  title: string;
  rating: number;
  text: string;
}
⋮----
export interface DeliveryStagePhotos {
  packing?: string | string[];
  freight?: string | string[];
  install?: string | string[];
}
⋮----
export interface CustomSectionBanner {
  kind: "banner";
  title: string;
  image?: string;
  text?: string;
}
export interface CustomSectionText {
  kind: "text";
  title: string;
  text: string;
}
export interface CustomSectionSplit {
  kind: "split";
  title: string;
  image?: string;
  text: string;
  imageSide?: "left" | "right";
}
export interface CustomSectionGallery {
  kind: "gallery";
  title: string;
  photos: GalleryImage[];
}
export type CustomSection =
  | CustomSectionBanner
  | CustomSectionText
  | CustomSectionSplit
  | CustomSectionGallery;
⋮----
export interface SeoFaqItem {
  question: string;
  answer: string;
}
⋮----
export interface MachineSeoData {
  wordCount: number;
  overviewHeading: string;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  technicalArchitecture: string;
  applicationsAndMaterials: string;
  targetIndustries: string[];
  engineeringFeatures: string;
  keyInnovations: { title: string; description: string }[];
  utilityRequirements: string;
  maintenanceProtocol: string;
  faqs: SeoFaqItem[];
  commercialGuide: string;
}
⋮----
export interface MachinePart {
  name: string;
  detail: string;
  images?: string[];
  installation?: SetupStep[];
}
⋮----
export interface ProductFamily {
  slug: string;
  category: CategorySlug;
  series: string;
  name: string;
  tagline: string;
  models: string[];
  materials?: string;
  image?: string;
  images?: string[];
  specs: SpecRow[];
  installation?: SetupStep[];
  deliveryGuide?: DeliveryPhase[];
  gallery?: GalleryImage[];
  videos?: ProductVideo[];
  reviews?: ProductReview[];
  deliveryStagePhotos?: DeliveryStagePhotos;
  customSections?: CustomSection[];
  parts?: MachinePart[];
  radarImage?: string;
  radarSpecs?: string[];
  seoData?: MachineSeoData;
}
⋮----
export const parseYouTubeId = (input: string): string | null =>
⋮----
import productsData from "@/data/products.json";
⋮----
export interface Catalogue {
  categories: Category[];
  families: ProductFamily[];
}
⋮----
export const familiesByCategory = (slug: CategorySlug)
⋮----
export const categoryBySlug = (slug: string)
⋮----
export const familyBySlug = (slug: string)
⋮----
export const familyImages = (f: Pick<ProductFamily, "slug" | "image" | "images">): string[] =>
⋮----
export const stagePhotos = (v: string | string[] | undefined): string[] =>
⋮----
export const familyImage = (f: Pick<ProductFamily, "slug" | "image" | "images">)
````

## File: app/api/admin/invite/verify/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { readRolesDB, writeRolesDB, logSecurityEvent } from "@/lib/adminRoles";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/adminAuth";
⋮----
export async function GET(req: NextRequest)
⋮----
export async function POST(req: NextRequest)
````

## File: app/cx-ops-x7k9q2/inquiries/page.tsx
````typescript
import { useEffect, useState } from "react";
import { Inbox, Wrench, ClipboardList, Package, Mail, CheckCircle2, Send, Trash2 } from "lucide-react";
import AdminShell from "../AdminShell";
import { familyBySlug, familyImages } from "@/lib/products";
import type { InquiryMachine, InquiryPart, InquiryReply, InquiryRoadmap, InquiryType } from "@/models/Inquiry";
import CustomerRoadmap from "./CustomerRoadmap";
⋮----
interface InquiryRow {
  _id: string;
  inquiryType: InquiryType;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  machines: InquiryMachine[];
  parts: InquiryPart[];
  images: string[];
  status: "new" | "read" | "replied";
  replies: InquiryReply[];
  source: string;
  flow?: string;
  sessionId?: string;
  roadmap?: InquiryRoadmap | null;
  createdAt: string;
}
⋮----
function flowLabel(flow: string | undefined): string | null
⋮----
const typeConfig = (t: InquiryType | undefined)
⋮----
function timeAgo(iso: string)
⋮----
function SourceIcon(
⋮----
async function load()
⋮----
async function selectInquiry(inq: InquiryRow)
⋮----
function toggleChecked(id: string)
⋮----
function toggleCheckAll(ids: string[])
⋮----
async function deleteIds(ids: string[])
⋮----
const deleteChecked = ()
const deleteOne = (id: string)
⋮----
const effectiveType = (i: InquiryRow)
````

## File: app/cx-ops-x7k9q2/Editor.tsx
````typescript
import { useEffect, useState, useCallback } from "react";
import { Camera, Star, X, Plus, CheckCircle2, Package, Loader2, AlertTriangle, Search, Eye, Copy, Trash2 } from "lucide-react";
import type { Field, Collection, SectionSchema } from "@/lib/cmsSchemas";
import { CATEGORY_ICON as SHARED_CATEGORY_ICON } from "./adminIcons";
⋮----
type Json = Record<string, unknown>;
type Item = Record<string, unknown>;
⋮----
interface ValidationWarning {
  field: string;
  message: string;
  severity: "error" | "warning";
}
⋮----
async function upload(file: File)
⋮----
async function uploadOne(file: File): Promise<string>
⋮----
async function uploadMany(files: FileList)
⋮----
function remove(i: number)
function makePrimary(i: number)
⋮----
onClick=
⋮----
<button type="button" style=
⋮----
// ── product model dropdown selector for hero section ──────
// ── product model dropdown selector with automatic catalogue data filling ──────
⋮----
.catch(() => { /* ignore */ });
⋮----
const handleAutoFill = (selectedSlug: string) =>
⋮----
// 1. Primary photo
⋮----
const handleSelectChange = (newSlug: string) =>
⋮----
// ── one field, dispatched by kind ──────────────────────────
⋮----
/** write a sibling field on the same item (used by "specs" to keep `models` in sync) */
⋮----
const title = String(item.name || item.title || item.series || "");
if (title)
onChange(slugify(title));
⋮----
<input type="checkbox" checked=
⋮----
const setModelName = (mi: number, name: string) =>
const addModel = () =>
const removeModel = (mi: number) =>
⋮----
const toArray = (x: string | string[] | undefined): string[]
⋮----
<ImagesField value=
⋮----
{/* inline warnings */}
⋮----
const move = (i: number, dir: -1 | 1) =>
const setKind = (i: number, kind: Block["kind"]) =>
⋮----
// ── fields for one open item — grouped into tabs when the collection
// declares `groups`, otherwise a plain flat list (unchanged behaviour) ──
⋮----
onClose();
⋮----
{/* Features Preview */}
⋮----
async function doSave()
⋮----
const handleKeyDown = (e: KeyboardEvent) =>
⋮----
onCancel=
⋮----
onSave=
⋮----
mutate(d => {
const n = ((d[modalItem.collection.key] as Item[]) ?? []).map(x => (
setModalItem(prev => prev ?
⋮----
src=
⋮----
<button type="button" onClick=
⋮----
{/* Dynamic Filter Controls */}
⋮----
<button onClick=
⋮----
````

## File: components/MachineDiagram.tsx
````typescript
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import {
  Globe2, DollarSign, BarChart3, Gauge, Ruler, Zap, Weight, Settings2, Layers,
} from "lucide-react";
import type { SpecRow, ProductFamily } from "@/lib/products";
⋮----
interface Props {
  image: string;
  name: string;
  specs: SpecRow[];
  specKeys: string[];
  modelIndex: number;
  family: ProductFamily;
  category?: string;
}
⋮----
function extractNum(v: string): number
⋮----
function formatValue(v: number): string
⋮----
function extractUnit(v: string): string
⋮----
/* pick a representative icon for a spec label — purely decorative, mirrors
   the icon-per-ring pattern in the reference gauge */
function iconForLabel(label: string)
⋮----
const animateTo = (targets: typeof gaugeSpecs) =>
⋮----
<span className="md-compare__bar-val">
````

## File: components/NewsStrip.tsx
````typescript
import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { latestArticles, type NewsArticle } from "@/lib/news";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";
⋮----
function fmtDate(iso: string)
⋮----
function getReadTime(excerpt: string)
⋮----
const prevSlide = () =>
⋮----
const nextSlide = () =>
⋮----
onClick=
⋮----
<ArticleCard key=
````

## File: package.json
````json
{
  "name": "cx-machinery",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3333",
    "dev:clean": "rm -rf .next && next dev --port 3333",
    "build": "next build",
    "start": "next start",
    "seed": "node scripts/seed.mjs",
    "lint": "next lint"
  },
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "@react-three/fiber": "^8.16.8",
    "cloudinary": "^2.10.0",
    "framer-motion": "^13.1.1",
    "groq-sdk": "^1.5.0",
    "gsap": "^3.15.0",
    "lucide-react": "^1.21.0",
    "mongoose": "^9.7.1",
    "next": "^14.2.5",
    "next-cloudinary": "^6.17.5",
    "next-intl": "^4.13.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "resend": "^6.17.1",
    "sonner": "^2.0.7",
    "three": "^0.160.1"
  },
  "browserslist": [
    "chrome >= 91",
    "edge >= 91",
    "firefox >= 90",
    "safari >= 15",
    "not dead"
  ],
  "devDependencies": {
    "@next/eslint-plugin-next": "^16.2.9",
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.160.0",
    "autoprefixer": "^10.5.4",
    "critters": "^0.0.23",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.35",
    "playwright": "^1.61.0",
    "postcss": "^8.5.25",
    "sharp": "^0.35.3",
    "tailwindcss": "^3.4.19",
    "typescript": "^5.4.5"
  }
}
````

## File: app/[locale]/about/page.tsx
````typescript
import { pageMetadata } from "@/lib/seo";
import AboutClient from "./AboutClient";
⋮----
import { routing } from "@/i18n/routing";
⋮----
export function generateStaticParams()
⋮----
export function generateMetadata(
⋮----
export default function AboutPage()
````

## File: app/[locale]/contact/page.tsx
````typescript
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, BRAND } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import ContactClient from "./ContactClient";
⋮----
import { routing } from "@/i18n/routing";
⋮----
export function generateStaticParams()
⋮----
export function generateMetadata(
⋮----
export default function ContactPage()
````

## File: app/[locale]/news/page.tsx
````typescript
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getLiveNews } from "@/lib/liveNews";
import { pageMetadata } from "@/lib/seo";
⋮----
export function generateMetadata(
⋮----
function fmt(iso: string)
````

## File: app/[locale]/products/[category]/[slug]/page.tsx
````typescript
import { notFound } from "next/navigation";
import { families, SITE_URL, BRAND, familyImage, type CategorySlug, type ProductFamily, type Category } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata, localePath } from "@/lib/seo";
import { getMachineProducts, getMachineProductBySlug, getMachineCategoryBySlug, getRelatedArticlesForMachine } from "@/lib/machinesData";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "./ProductDetail";
⋮----
export function generateStaticParams()
⋮----
export async function generateMetadata(
````

## File: app/api/admin/roles/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import {
  readRolesDB,
  writeRolesDB,
  logSecurityEvent,
  generateTempPassword,
  generateInviteToken,
  AdminRole,
} from "@/lib/adminRoles";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/adminAuth";
⋮----
export async function GET(req: NextRequest)
⋮----
export async function POST(req: NextRequest)
````

## File: app/[locale]/news/[slug]/page.tsx
````typescript
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import AetherBtn from "@/components/AetherBtn";
import { articleBySlug, renderNewsBody } from "@/lib/news";
import { getLiveNews } from "@/lib/liveNews";
import { pageMetadata, localePath } from "@/lib/seo";
import { SITE_URL, BRAND } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
⋮----
export async function generateMetadata(
⋮----
function fmt(iso: string)
````

## File: app/api/admin/login/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/adminCredentials";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, SessionUser } from "@/lib/adminAuth";
import { readRolesDB, writeRolesDB, logSecurityEvent, AdminRole } from "@/lib/adminRoles";
⋮----
export async function POST(req: NextRequest)
⋮----
// Check exact match against stored user password, invitation password, or master credentials
````

## File: app/cx-ops-x7k9q2/AdminShell.tsx
````typescript
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Inbox, LineChart, Settings, LogOut, Search,
  ChevronDown, Bell, Menu, X, ShieldAlert, ArrowLeft, Lock
} from "lucide-react";
import { SECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { ADMIN_PATH, SessionUser, MACHINE_MANAGER_SCHEMAS } from "@/lib/adminAuth";
import { AdminRole } from "@/lib/adminRoles";
import { SectionIcon } from "./adminIcons";
⋮----
// Tab session guard & fetch current authenticated user
⋮----
async function logout()
⋮----
onClick=
⋮----
onChange=
⋮----
{/* Role Shortcuts Accordion Group */}
````

## File: components/ConfiguratorCTA.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";
⋮----
function resize()
⋮----
function draw()
⋮----
<section ref=
````

## File: components/LanguageSwitcher.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
⋮----
const onClick = (e: MouseEvent) =>
const onKey = (e: KeyboardEvent) =>
⋮----
const toggle = () =>
⋮----
const switchTo = (next: Locale) =>
⋮----
onClick=
````

## File: components/ParticlePortfolio.tsx
````typescript
import React, { useRef, useEffect, useState } from "react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import { useCms } from "@/lib/useCms";
import TransitionLink from "@/components/TransitionLink";
⋮----
function accentFor(i: number)
⋮----
interface Step {
  slug: string;
  img: string;
  cat: string;
  stage: string;
  name: string;
  role: string;
  quality: [string, string][];
}
⋮----
function rgbFromHex(hex: string, a = 1)
⋮----
const restartTimer = () =>
````

## File: components/ScrollHome.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import AetherBtn from "@/components/AetherBtn";
import { useCms } from "@/lib/useCms";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
⋮----
type Spec = { label: string; value: string };
type Feature = { head: string; body: string };
⋮----
type ProductDetail = {
  specs: Spec[];
  features: Feature[];
};
⋮----
const xAt = (pct: number)
const yAt = (pct: number)
⋮----
const sizeToAnchor = (el: HTMLElement | null) =>
const anchorX = (el: HTMLElement | null) =>
⋮----
const anchorY = (el: HTMLElement | null) =>
⋮----
const setMachinePos = (x: number, y: number) =>
⋮----
const travelThenHold = (from: HTMLElement, to: HTMLElement) =>
⋮----
const captureStart = () =>
⋮----
const colCenterY = () =>
⋮----
const resync = ()
⋮----
const handleCardClick = (slug: string) =>
⋮----
const slideCards = (dir: -1 | 1) =>
⋮----
const toggleFeature = (head: string) =>
const mobilePrev = () =>
const mobileNext = () =>
⋮----
onClick=
````

## File: components/TrustSection.tsx
````typescript
import React, { useRef, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Canvas, useFrame } from "@react-three/fiber";
⋮----
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";
⋮----
function seededRand(seed: number)
function noise3(x: number, y: number, z: number): number
⋮----
const r = (a:number,b:number,c:number)
⋮----
function pickColor(t: number)
⋮----
const tick=(now:number)=>
⋮----
const revealAll = () =>
````

## File: lib/groq.ts
````typescript
import Groq from "groq-sdk";
import { categories, families } from "@/lib/products";
import type { ChatMessageDoc } from "@/models/ChatSession";
import type { LocalAnswer } from "@/lib/localAgent";
import { geminiJsonCompletion } from "@/lib/gemini";
import { getBrainResponse, saveBrainResponse, hashMessages } from "@/lib/aiBrain";
⋮----
function getClient(): Groq
⋮----
interface GroqChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}
⋮----
export async function groqJsonCompletion(
  messages: GroqChatMsg[],
  opts: { maxTokens?: number; temperature?: number; bypassCache?: boolean } = {},
): Promise<string>
⋮----
// 2. Try Primary Gemini AI Model
⋮----
// 3. Fall back to Groq Models
⋮----
// Save successful response into AI Brain for future zero-token instant reuse
⋮----
function buildCatalogBlock(): string
⋮----
interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}
⋮----
function extractJson(raw: string): LocalAnswer | null
⋮----
export type FlowStage = "name" | "email" | "qty";
⋮----
export interface FlowClassification {
  intent: "answer" | "cancel" | "question" | "unclear";
  value: string | null;
  reply: string | null;
}
⋮----
export async function classifyFlowReply(
  stage: FlowStage,
  message: string,
  machineName: string,
): Promise<FlowClassification>
⋮----
export async function answerWithGroq(
  messages: ChatMessageDoc[],
  pendingInquiry: LocalAnswer["pendingInquiry"],
): Promise<LocalAnswer>
````

## File: app/[locale]/page.tsx
````typescript
import dynamic from "next/dynamic";
import { alternates } from "@/lib/seo";
import { routing } from "@/i18n/routing";
⋮----
import { generateMatrixMetadata, generateStructuredSchema } from "@/lib/seo-matrix";
⋮----
export function generateStaticParams()
⋮----
export function generateMetadata(
⋮----
import HeroSplash from "@/components/HeroSplash";
````

## File: app/cx-ops-x7k9q2/page.tsx
````typescript
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Share2, MoreHorizontal, ArrowUpRight, Search,
  Users, DollarSign, TrendingUp, UserPlus, CheckCircle2, Clock,
  Video, CalendarDays, ChevronDown, MoreVertical, ExternalLink,
  X, Plus, RefreshCw, Download, Filter, Trash2, Eye, Mail, Check,
  Inbox, FileText, Sparkles, Activity, Layers, Send, Loader2,
  Wrench, Cpu, Factory, Gauge, Box, ShieldCheck, ArrowRight
} from "lucide-react";
import AdminShell from "./AdminShell";
import { ADMIN_PATH, SessionUser } from "@/lib/adminAuth";
import type { InquiryType } from "@/models/Inquiry";
⋮----
interface InquiryRow {
  _id: string;
  inquiryType: InquiryType;
  name: string;
  company: string;
  email?: string;
  status: "new" | "read" | "replied";
  source?: string;
  createdAt: string;
}
⋮----
interface ScheduleTask {
  id: string;
  title: string;
  subtitle: string;
  category: "meetings" | "tasks" | "events";
  time: string;
  type: string;
  link?: string;
}
⋮----
type TimeframeOption = "7D" | "30D" | "6M" | "1Y";
⋮----
const showToast = (msg: string) =>
⋮----
const fetchInquiries = async () =>
⋮----
// Category Bar Chart Real Calculations
⋮----
const exportDataToCSV = () =>
⋮----
const handleCreateTask = (e: React.FormEvent) =>
⋮----
const handleDeleteAllSchedule = () =>
⋮----
const handleDeleteRow = async (id: string) =>
⋮----
const handleDeleteAllInquiries = async () =>
⋮----
const handleToggleStatus = (id: string, currentStatus: string) =>
⋮----
onClick=
⋮----
}} onClick=
⋮----
<button onClick=
````

## File: components/PrintingShowcase.tsx
````typescript
import React, { useState, useEffect, useCallback, useRef } from "react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import { families as localFamilies } from "@/lib/products";
import type { ProductFamily } from "@/lib/products";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
⋮----
interface PrintingMachine {
  src: string;
  model: string;
  series: string;
  speed: string;
  reg: string;
  accent: string;
  hot?: boolean;
}
⋮----
function familyToMachine(f: ProductFamily, idx: number): PrintingMachine
⋮----
function buildMachines(families: ProductFamily[]): PrintingMachine[]
⋮----
const revealAll = () =>
⋮----
const check = ()
⋮----
const onKey = (e: KeyboardEvent) =>
⋮----
const tr   = (props: string) => props.split(",").map(p => `$
⋮----
const role = (i: number) =>
⋮----
const itemStyle = (r: string): React.CSSProperties =>
````

## File: components/FlexoStrip.tsx
````typescript
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";
⋮----
interface FlexoModel {
  slug: string;
  label: string;
  colours: number;
  speed: string;
  reg: string;
  img: string;
  tag: string;
  categoryTag: string;
  hot?: boolean;
  flagship?: boolean;
}
⋮----
function findSpec(family: ProductFamily, label: string): string
⋮----
function buildModels(list: ProductFamily[]): FlexoModel[]
⋮----
const check = ()
⋮----
const handleCategorySelect = (category: string) =>
⋮----
onClick=
⋮----
setSliderIdx(i);
scrollToSlide(i);
````

## File: next.config.mjs
````javascript
async headers()
````

## File: components/HeroSplash.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";
import localProducts from "@/data/products.json";
import localHeroEn from "@/data/home-hero.json";
import localHeroAr from "@/data/home-hero.ar.json";
import localHeroHi from "@/data/home-hero.hi.json";
import WispBackground from "@/components/WispBackground";
⋮----
interface ArchPos {
  left: number;
  top: number;
  scale: number;
  opacity: number;
}
⋮----
function getTrajectoryPos(cardIndex: number, step: number, totalNodes: number): ArchPos
⋮----
interface HeroFeaturedItem {
  slug: string;
  customImage?: string;
  customSeries?: string;
  customName?: string;
  customHref?: string;
}
⋮----
interface HeroCms {
  eyebrow: string;
  headline1: string;
  headline2: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  featured: HeroFeaturedItem[];
}
⋮----
interface CategoryItem {
  slug: string;
  name: string;
}
⋮----
interface ResolvedHeroNode {
  key: string;
  slug: string;
  category: string;
  categoryName: string;
  series: string;
  name: string;
  image: string;
  href: string;
}
⋮----
function getFamilyImage(f: Pick<ProductFamily, "slug" | "image" | "images">): string
⋮----
function getMobileArcPos(slotIdx: number):
⋮----
const update = ()
⋮----
const check = ()
⋮----
const apply = () =>
⋮----
const onMove = (e: PointerEvent) =>
⋮----
const onLeave = () =>
⋮----
const onScroll = () =>
⋮----
onClick=
⋮----
onMouseLeave=
````

## File: components/SiteFooter.tsx
````typescript
import Image from "next/image";
import dynamic from "next/dynamic";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BRAND } from "@/lib/products";
⋮----
href={`https://wa.me/${WHATSAPP_NUMBER}`}
⋮----
aria-label=
⋮----
<FooterColumn title=
⋮----
<a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="footer-contact-link">
````

## File: components/MachineCatalogSection.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";
⋮----
import localData from "@/data/products.json";
⋮----
function familyImage(f: Pick<ProductFamily, "slug" | "image" | "images">, customImage?: string): string
⋮----
interface CatalogCms {
  headline1: string;
  headline2: string;
  items: { slug: string; stat: string; label: string; customImage?: string }[];
}
⋮----
const revealAll = () =>
⋮----
<section ref=
⋮----
onClick=
⋮----
<Image src=
````

## File: components/SiteNav.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RollingNavMenu from "@/components/RollingNavMenu";
import { categories, familiesByCategory } from "@/lib/products";
⋮----
function machineImg(slug: string)
⋮----
export default function SiteNav()
⋮----
const fn = () =>
⋮----
// Hide main navbar on scroll down, reveal on scroll up
⋮----
const openMenu = (slug: string) =>
const closeMenu = () =>
const keepMenu = () =>
⋮----
const updateScrollState = () =>
⋮----
const scrollDdList = (dir: 1 | -1) =>
⋮----
<TransitionLink href="/" className="sn__logo" aria-label=
⋮----
onClick=
⋮----
onMouseEnter=
````

## File: app/[locale]/products/[category]/[slug]/ProductDetail.tsx
````typescript
import { useState, useRef, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import ProcessIcon, { resolveIcon, type IconName } from "@/components/ProcessIcon";
import DeliveryStageIcon, { resolveDeliveryStage } from "@/components/DeliveryStageIcon";
import { openAshaChat } from "@/components/ChatWidget";
import CustomSections from "@/components/CustomSections";
import MachineParts from "@/components/MachineParts";
import ProductStage3D from "@/components/ProductStage3D";
import MachineSeoSection from "@/components/MachineSeoSection";
import VideoFacade from "@/components/VideoFacade";
import { Grain, PlusMark, SectionHead, SubHead } from "@/components/EditorialKit";
import type { ProductFamily, Category, DeliveryPhase, SetupStep } from "@/lib/products";
import { familyImage, familyImages, parseYouTubeId, stagePhotos, BRAND } from "@/lib/products";
import type { Article, MachineVideo } from "@/lib/machinesData";
⋮----
interface Props {
  family: ProductFamily;
  category: Category;
  related: ProductFamily[];
  relatedArticles?: Article[];
  machineVideo?: MachineVideo;
}
⋮----
interface PartDef { icon: IconName }
⋮----
function sumDurationRange(durations: string[]):
⋮----
function onKey(e: KeyboardEvent)
⋮----
onClick=
⋮----
<button type="button" className="pdv2-rmodal__close" aria-label=
⋮----
<DeliveryStageIcon name=
⋮----
icon=
⋮----
askContext=
⋮----
<ProcessIcon name=
⋮----
const ref = useRef<T>(null);
⋮----
useEffect(() =>
⋮----
/** Bar-chart comparison of one numeric spec across this family's models —
 *  visually matches the About page's CapacityChart (title/unit header,
 *  animated horizontal fills, scroll-triggered reveal). Clicking a bar
 *  selects that model, same as clicking its column in the spec table. */
⋮----
const findSpec = (key: string)
⋮----
src={`https://img.youtube.com/vi/${videos[activeVideo].id}/maxresdefault.jpg`}
⋮----
src={`https://www.youtube.com/embed/${videos[activeVideo].id}?autoplay=1&rel=0`}
⋮----
<Image src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
⋮----
<>
⋮----
<SubHead title=
⋮----
const setIdx = (next: number)
⋮----
<div className="relative z-[1]"><StarRating n=
⋮----
<Image src=
⋮----
aria-label=
⋮----
<a className="pdv2-float__icn" href="tel:+8615988775831" aria-label=
````

## File: data/admin-users.json
````json
{
  "users": [
    {
      "id": "usr-super-1",
      "email": "admin@ashalinnomech.com",
      "name": "Super Admin",
      "role": "super_admin",
      "status": "active",
      "createdAt": "2026-08-26T07:02:19.888Z",
      "tempPassword": "pias900###",
      "lastLoginAt": "2026-09-06T10:15:06.113Z"
    },
    {
      "id": "usr-super-pvs",
      "email": "pvs178380@gmail.com",
      "name": "Super Admin",
      "role": "super_admin",
      "status": "active",
      "tempPassword": "admin##",
      "createdAt": "2026-09-10T00:00:00.000Z",
      "lastLoginAt": "2026-09-10T11:30:00.000Z"
    },
    {
      "id": "usr-mtg3wzec",
      "email": "newinviteuser@gmail.com",
      "name": "newinviteuser",
      "role": "super_admin",
      "status": "active",
      "tempPassword": "MyNewPassword123!",
      "createdAt": "2026-08-30T17:52:14.388Z",
      "lastLoginAt": "2026-08-30T17:55:00.061Z"
    },
    {
      "id": "usr-mtg41twn",
      "email": "newinviteduser@gmail.com",
      "name": "newinviteduser",
      "role": "super_admin",
      "status": "active",
      "tempPassword": "MyNewPassword123!",
      "createdAt": "2026-08-30T17:56:00.551Z",
      "lastLoginAt": "2026-08-30T17:56:00.552Z"
    },
    {
      "id": "usr-machine-mgr-1",
      "email": "manager@ashalinnomech.com",
      "name": "Machine Manager",
      "role": "machine_manager",
      "status": "active",
      "tempPassword": "machine123###",
      "createdAt": "2026-09-06T12:00:00.000Z",
      "lastLoginAt": "2026-09-06T10:15:01.651Z"
    }
  ],
  "invitations": [
    {
      "id": "inv-machine-mgr-1",
      "email": "manager@ashalinnomech.com",
      "name": "Machine Manager",
      "role": "machine_manager",
      "tempPassword": "machine123###",
      "token": "mag_machine_manager_test",
      "status": "accepted",
      "createdAt": "2026-09-06T12:00:00.000Z",
      "expiresAt": "2028-09-06T12:00:00.000Z"
    },
    {
      "id": "inv-mtg41twn",
      "email": "newinviteduser@gmail.com",
      "name": "newinviteduser",
      "role": "super_admin",
      "tempPassword": "MyNewPassword123!",
      "token": "mag_1788112560551",
      "status": "accepted",
      "createdAt": "2026-08-30T17:56:00.551Z",
      "expiresAt": "2027-08-30T17:56:00.551Z"
    },
    {
      "id": "inv-mtg3wzec",
      "email": "newinviteuser@gmail.com",
      "name": "newinviteuser",
      "role": "super_admin",
      "tempPassword": "MyNewPassword123!",
      "token": "mag_user_test",
      "status": "accepted",
      "createdAt": "2026-08-30T17:52:14.388Z",
      "expiresAt": "2027-08-30T17:54:17.602Z"
    },
    {
      "id": "inv-super-pvs",
      "email": "pvs178380@gmail.com",
      "name": "Super Admin",
      "role": "super_admin",
      "tempPassword": "admin##",
      "token": "mag_super_pvs_locked",
      "status": "accepted",
      "createdAt": "2026-09-10T00:00:00.000Z",
      "expiresAt": "2030-01-01T00:00:00.000Z"
    },
    {
      "id": "inv-super-1",
      "email": "admin@ashalinnomech.com",
      "name": "Super Admin",
      "role": "super_admin",
      "tempPassword": "pias900###",
      "token": "mag_4d9dedf878c4624ba232a9eab53e2978",
      "status": "accepted",
      "createdAt": "2026-08-26T07:02:19.888Z",
      "expiresAt": "2029-09-28T05:46:14.969Z"
    }
  ],
  "auditLog": [
    {
      "id": "aud-mtpno29t-154c",
      "timestamp": "2026-09-06T10:15:06.113Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtpnnytv-4pds",
      "timestamp": "2026-09-06T10:15:01.651Z",
      "actor": "Machine Manager",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'machine_manager'"
    },
    {
      "id": "aud-mth7gg6h-vfx9",
      "timestamp": "2026-08-31T12:19:07.625Z",
      "actor": "custompass@gmail.com",
      "action": "LOGIN_FAILED",
      "details": "Failed authentication attempt with invalid email or password"
    },
    {
      "id": "aud-mth7gfrc-wtss",
      "timestamp": "2026-08-31T12:19:07.080Z",
      "actor": "Custom Pass User",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mth7gfjn-ojmq",
      "timestamp": "2026-08-31T12:19:06.803Z",
      "actor": "custompass@gmail.com",
      "action": "INVITATION_ACCEPTED",
      "details": "Accepted invitation and set secure permanent password for role super_admin"
    },
    {
      "id": "aud-mth7gfja-3ejl",
      "timestamp": "2026-08-31T12:19:06.790Z",
      "actor": "Super Admin",
      "action": "GMAIL_MAGIC_LINK_CREATED",
      "details": "Created magic link invitation for custompass@gmail.com with role 'super_admin' and temporary password"
    },
    {
      "id": "aud-mth7gf6i-ekb4",
      "timestamp": "2026-08-31T12:19:06.330Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mth7fput-aguh",
      "timestamp": "2026-08-31T12:18:33.509Z",
      "actor": "Pass Check",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'machine_manager'"
    },
    {
      "id": "aud-mth7dv8i-j9uq",
      "timestamp": "2026-08-31T12:17:07.170Z",
      "actor": "Super Admin",
      "action": "ROLE_UPDATED",
      "details": "Updated role for passcheck@gmail.com from 'content_editor' to 'machine_manager'"
    },
    {
      "id": "aud-mth7d25k-4tgr",
      "timestamp": "2026-08-31T12:16:29.480Z",
      "actor": "Super Admin",
      "action": "GMAIL_MAGIC_LINK_CREATED",
      "details": "Created magic link invitation for passcheck@gmail.com with role 'content_editor' and temporary password"
    },
    {
      "id": "aud-mth797z7-igo3",
      "timestamp": "2026-08-31T12:13:30.403Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtg4ykcm-26xv",
      "timestamp": "2026-08-30T18:21:27.814Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtg4ryca-mvql",
      "timestamp": "2026-08-30T18:16:19.354Z",
      "actor": "pvs178380",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'content_editor'"
    },
    {
      "id": "aud-mtg4rjhk-nkor",
      "timestamp": "2026-08-30T18:16:00.104Z",
      "actor": "pvs178380",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'content_editor'"
    },
    {
      "id": "aud-mtg4cjf0-fsf7",
      "timestamp": "2026-08-30T18:04:20.172Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtg48pft-qd2h",
      "timestamp": "2026-08-30T18:01:21.353Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtg41twv-0r84",
      "timestamp": "2026-08-30T17:56:00.559Z",
      "actor": "newinviteduser",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtg40j8d-vujj",
      "timestamp": "2026-08-30T17:55:00.061Z",
      "actor": "newinviteuser@gmail.com",
      "action": "INVITATION_ACCEPTED",
      "details": "Accepted invitation and set secure permanent password for role super_admin"
    },
    {
      "id": "aud-mtg3w0m4-3tvy",
      "timestamp": "2026-08-30T17:51:29.308Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtg3moab-yxag",
      "timestamp": "2026-08-30T17:44:13.427Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-mtg2uruq-kfpn",
      "timestamp": "2026-08-30T17:22:31.682Z",
      "actor": "pvs178380",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'content_editor'"
    },
    {
      "id": "aud-mtg2ud3i-w8uw",
      "timestamp": "2026-08-30T17:22:12.558Z",
      "actor": "pvs178380@gmail.com",
      "action": "INVITATION_ACCEPTED",
      "details": "Accepted invitation and set secure permanent password for role content_editor"
    },
    {
      "id": "aud-mtg2tlms-b4ce",
      "timestamp": "2026-08-30T17:21:36.964Z",
      "actor": "Super Admin",
      "action": "GMAIL_MAGIC_LINK_CREATED",
      "details": "Created magic link invitation for pvs178380@gmail.com with role 'content_editor' and temporary password"
    },
    {
      "id": "aud-mtdyji2j-aqod",
      "timestamp": "2026-08-29T05:46:14.971Z",
      "actor": "Super Admin",
      "action": "ROLE_LOGIN_SUCCESS",
      "details": "Logged into Ops Console with role 'super_admin'"
    },
    {
      "id": "aud-init",
      "timestamp": "2026-08-29T11:43:00.000Z",
      "actor": "System",
      "action": "SYSTEM_INITIALIZED",
      "details": "Production Super Admin account configured with full security scope"
    }
  ],
  "revokedEmails": []
}
````

## File: app/[locale]/layout.tsx
````typescript
import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
⋮----
import SiteNav from "@/components/SiteNav";
import LoadingScreen from "@/components/LoadingScreen";
import { BRAND, SITE_URL } from "@/lib/products";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
⋮----
export function generateStaticParams()
````

## File: components/ClientJourney.tsx
````typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import TransitionLink from "@/components/TransitionLink";
import { openAshaChat } from "@/components/ChatWidget";
import {
  MessageSquare, FileText, ShoppingCart, Factory,
  Truck, Wrench, GraduationCap, Headphones,
  Bot, HardHat, User, UserCheck, Send, CheckCircle2,
  type LucideIcon,
} from "lucide-react";
⋮----
type StepCopy = { label: string; tagline: string; desc: string; metric1v: string; metric1l: string; metric2v: string; metric2l: string };
⋮----
function rectPosition(index: number)
⋮----
function popupAlignment(index: number)
⋮----
function TypewriterText(
⋮----
function animateTravel(now: number)
⋮----
const stepContext = (s: typeof STEPS[number])
⋮----
const clearFailsafe = () =>
⋮----
const openCard = (id: string) =>
⋮----
const finish = () =>
⋮----
const onKey = (e: KeyboardEvent) =>
⋮----
<div className="cj__ring" role="list" aria-label=
⋮----
onClick=
````

## File: app/globals.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;
⋮----
:root {
⋮----
[data-theme="light"] .sh-section *:not(button):not(a):not(.eyebrow):not([class*="brand"]):not([class*="teal"]):not([class*="aether"]),
⋮----
[data-theme="light"] .sh-section h1,
[data-theme="light"] .sh-section p   { color: rgba(13,34,32,0.72); }
[data-theme="light"] .sh-section span:not([class*="eyebrow"]):not([class*="brand"]):not([class*="teal"]) { color: inherit; }
⋮----
[data-theme="light"] .sh-stat-grid b    { color: #0d2220 !important; }
[data-theme="light"] .sh-stat-grid span { color: rgba(13,34,32,0.65) !important; }
⋮----
[data-theme="light"] .cc__title { color: #f8fafc !important; }
[data-theme="light"] .cc__desc  { color: rgba(248,250,252,0.75) !important; }
[data-theme="light"] .cc__eyebrow { color: var(--brand-teal) !important; }
⋮----
[data-theme="light"] .ns2-cat      { color: var(--brand-teal) !important; }
⋮----
[data-theme="light"] .sn__dd-tag    { color: var(--ink-60) !important; }
⋮----
[data-theme="light"] .sn__mobile         { background: var(--bg-base) !important; border-right-color: var(--bg-line) !important; }
[data-theme="light"] .sn__mob-header     { background: var(--brand-teal-dim) !important; border-color: var(--bg-line) !important; }
[data-theme="light"] .sn__mob-logo       { color: var(--ink) !important; }
[data-theme="light"] .sn__mobile-link    { color: var(--ink-60) !important; border-color: var(--bg-line) !important; }
[data-theme="light"] .sn__mobile-link:hover { color: var(--brand-teal) !important; background: var(--brand-teal-dim) !important; }
[data-theme="light"] .sn__mob-close      { color: var(--ink-60) !important; border-color: var(--bg-line) !important; background: var(--brand-teal-dim) !important; }
⋮----
[data-theme="light"] .pp-mobile h2        { color: #0d2220 !important; }
[data-theme="light"] .pp-mobile p         { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] .pp-mobile > div > div[style] { color: #0d2220 !important; }
⋮----
[data-theme="light"] {
⋮----
.glass {
.glass--sm { -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-sat)); backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-sat)); }
.glass--lg { -webkit-backdrop-filter: blur(var(--glass-blur-lg)) saturate(var(--glass-sat)); backdrop-filter: blur(var(--glass-blur-lg)) saturate(var(--glass-sat)); }
.glass--raised { background: var(--glass-bg-raise); }
⋮----
.glass-in { animation: glassIn 0.45s var(--ease-fluid) both; }
⋮----
.glass-in { animation: none; }
⋮----
[data-theme="light"] body {
⋮----
[data-theme="light"] .cj          { background: #ffffff !important; }
[data-theme="light"] .trust-section { background: #ffffff !important; }
[data-theme="light"] .ts-headline  { color: #0d2220 !important; }
[data-theme="light"] .ts-headline em { color: var(--brand-teal) !important; }
[data-theme="light"] .ts-desc      { color: rgba(13,34,32,0.72) !important; }
[data-theme="light"] .ts-stat__val { color: #0d2220 !important; }
[data-theme="light"] .ts-stat__label { color: rgba(13,34,32,0.75) !important; }
[data-theme="light"] .ts-stat__sub  { color: rgba(13,34,32,0.65) !important; }
[data-theme="light"] .ts-stats      { border-color: rgba(43,191,179,0.2) !important; }
[data-theme="light"] .ts-stat       { border-right-color: rgba(43,191,179,0.15) !important; }
⋮----
[data-theme="light"] .sn__logo,
[data-theme="light"] .sn__cat-btn:hover,
[data-theme="light"] .sn__dd-series { color: var(--ink) !important; }
[data-theme="light"] .marquee-track span { color: rgba(13,34,32,0.6) !important; }
[data-theme="light"] .marquee-wrap  { background: #ffffff !important; }
⋮----
[data-theme="light"] * {
⋮----
[data-theme="light"] .hs,
[data-theme="light"] .hs__grid {
[data-theme="light"] .hs__fade { background: linear-gradient(to bottom, transparent, #ffffff) !important; }
⋮----
[data-theme="light"] .sh-section p   { color: rgba(13,34,32,0.72) !important; }
[data-theme="light"] .sh-mob-carousel > div { background: #ffffff !important; }
[data-theme="light"] .sh-section [style*="color: \"#fff\""],
⋮----
[data-theme="light"] .cj__step-row { background: rgba(13,34,32,0.03) !important; border-color: rgba(13,34,32,0.08) !important; }
[data-theme="light"] .cj__step-row--active { background: rgba(43,191,179,0.08) !important; }
⋮----
[data-theme="light"] .mcs         { background: #ffffff !important; }
[data-theme="light"] .mcs__outer  { background: #ffffff !important; border-color: rgba(43,191,179,0.2) !important; }
[data-theme="light"] .mcs__title  { color: #0d2220 !important; }
[data-theme="light"] .mcs__sub    { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] .mcs__badge  { color: rgba(13,34,32,0.72) !important; }
[data-theme="light"] .mcs-card    { background: #ffffff !important; border: 1px solid rgba(13,34,32,0.12) !important; color: #0d2220 !important; box-shadow: 0 10px 30px -10px rgba(13,34,32,0.08), 0 2px 6px -1px rgba(13,34,32,0.04) !important; }
[data-theme="light"] .mcs-card:hover { border-color: var(--brand-teal) !important; box-shadow: 0 20px 45px -12px rgba(43,191,179,0.25) !important; }
[data-theme="light"] .mcs-card__cat { background: rgba(13,34,32,0.07) !important; color: #0d2220 !important; }
[data-theme="light"] .mcs-card__series { color: rgba(13,34,32,0.75) !important; }
[data-theme="light"] .mcs-card__name   { color: #0d2220 !important; }
[data-theme="light"] .mcs-card__stat   { color: #0d2220 !important; }
[data-theme="light"] .mcs-card__stat-label { color: rgba(13,34,32,0.65) !important; }
[data-theme="light"] .mcs-card__pill-btn { background: #0d2220 !important; color: #ffffff !important; box-shadow: 0 6px 16px rgba(13,34,32,0.2) !important; }
[data-theme="light"] .mcs-stat__num   { color: #0d2220 !important; }
[data-theme="light"] .mcs-stat__label { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] .mcs-stat__unit  { color: rgba(13,34,32,0.65) !important; }
[data-theme="light"] .mcs-stat__desc  { color: rgba(13,34,32,0.78) !important; }
[data-theme="light"] .mcs-quote__text { color: #0d2220 !important; }
[data-theme="light"] .mcs-quote__source { color: rgba(13,34,32,0.65) !important; }
[data-theme="light"] .mcs-total__num  { color: #0d2220 !important; }
[data-theme="light"] .mcs-cat__name   { color: rgba(13,34,32,0.65) !important; }
[data-theme="light"] .mcs-cat__count  { color: #0d2220 !important; }
[data-theme="light"] .mcs-card--cat:hover { background: rgba(43,191,179,0.05) !important; }
⋮----
[data-theme="light"] .cc__hint-step { color: rgba(248,250,252,0.7) !important; }
[data-theme="light"] .cc__hint-num  { color: rgba(248,250,252,0.7) !important; border-color: rgba(255,255,255,0.2) !important; }
[data-theme="light"] .cc__wave path { fill: #ffffff !important; }
⋮----
[data-theme="light"] section[style*="07080d"] { background: #ffffff !important; }
[data-theme="light"] .ns2-card   { background: #ffffff !important; border-color: rgba(43,191,179,0.15) !important; }
[data-theme="light"] .ns2-card:hover { background: #ffffff !important; }
[data-theme="light"] .ns2-title  { color: #0d2220 !important; }
[data-theme="light"] .ns2-excerpt { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] .ns2-date   { color: rgba(13,34,32,0.6) !important; }
[data-theme="light"] .ns2-img-wrap { background: #ffffff !important; }
[data-theme="light"] .ns2-fade-l { background: linear-gradient(to right, #ffffff, transparent) !important; }
[data-theme="light"] .ns2-fade-r { background: linear-gradient(to left,  #ffffff, transparent) !important; }
⋮----
[data-theme="light"] [data-ps] { background-color: #ffffff !important; }
[data-theme="light"] [data-ps] .ps-brand-label span { color: #0d2220 !important; }
[data-theme="light"] [data-ps] .ps-counter span     { color: #0d2220 !important; }
[data-theme="light"] [data-ps] .ps-brand-label { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] [data-ps] .ps-counter      { color: rgba(13,34,32,0.72) !important; }
⋮----
[data-theme="light"] .pp-mobile { background: #ffffff !important; }
[data-theme="light"] .pp-mobile > div { background: #ffffff !important; border-color: rgba(43,191,179,0.15) !important; }
⋮----
[data-theme="light"] .sh-section { background: #ffffff !important; }
⋮----
[data-theme="light"] .sh-section span { color: inherit !important; }
[data-theme="light"] .sh-section div  { color: inherit !important; }
⋮----
[data-theme="light"] .sh-stat-grid b     { color: #0d2220 !important; }
[data-theme="light"] .sh-stat-grid span  { color: rgba(13,34,32,0.65) !important; }
⋮----
[data-theme="light"] .sh-hot-head { color: #0d2220 !important; }
⋮----
[data-theme="light"] .sh-mob-carousel { background: #ffffff !important; color: #0d2220 !important; }
⋮----
[data-theme="light"] .sh-mob-carousel span { color: inherit !important; }
⋮----
[data-theme="light"] .sh-section button { color: #0d2220 !important; border-color: rgba(13,34,32,0.15) !important; }
[data-theme="light"] .sh-card-strip-wrap { background: #ffffff !important; }
[data-theme="light"] .sh-card { background: rgba(13,34,32,0.04) !important; border-color: rgba(13,34,32,0.12) !important; }
[data-theme="light"] .sh-card:hover { background: rgba(13,34,32,0.08) !important; border-color: var(--brand-teal) !important; }
[data-theme="light"] .sh-card__name { color: rgba(13,34,32,0.65) !important; }
[data-theme="light"] .sh-card[data-active] .sh-card__name,
⋮----
[data-theme="light"] .pp-section { background: #ffffff !important; }
[data-theme="light"] .pp-desktop { background: #ffffff !important; }
[data-theme="light"] .pp-desktop h2,
[data-theme="light"] .pp-desktop p   { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] .pp-desktop div { color: inherit !important; }
[data-theme="light"] .pp-desktop span { color: inherit !important; }
⋮----
[data-theme="light"] .cj__title         { color: #0d2220 !important; }
[data-theme="light"] .cj__step-label    { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] .cj__step--active .cj__step-label { color: #0d2220 !important; }
[data-theme="light"] .cj__step-num      { color: rgba(13,34,32,0.6) !important; }
[data-theme="light"] .cj__nav-btn       { color: rgba(13,34,32,0.7) !important; border-color: rgba(13,34,32,0.15) !important; }
⋮----
[data-theme="light"] .ns2-body          { background: #ffffff !important; }
[data-theme="light"] .ns2-body h2,
[data-theme="light"] .ns2-body p        { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] .ns2-body span     { color: inherit !important; }
[data-theme="light"] .ns2-body button   { color: rgba(13,34,32,0.7) !important; border-color: rgba(13,34,32,0.18) !important; }
⋮----
[data-theme="light"] section[style*="07080d"] h2,
[data-theme="light"] section[style*="07080d"] p   { color: rgba(13,34,32,0.7) !important; }
[data-theme="light"] section[style*="07080d"] span { color: inherit !important; }
⋮----
[data-theme="light"] [style*="rgba(255,255,255,.35)"],
[data-theme="light"] [style*="color: \"#fff\""],
[data-theme="light"] [style*="color: white"],
[data-theme="light"] [style*="rgba(255,255,255,0.6)"],
[data-theme="light"] [style*="rgba(255,255,255,0.4)"],
[data-theme="light"] [style*="rgba(255,255,255,0.28)"],
[data-theme="light"] [style*="rgba(255,255,255,0.15)"],
⋮----
[data-theme="light"] .fp-dark [style*="color:#fff"],
[data-theme="light"] .fp-dark [style*="rgba(255,255,255,0.9"],
[data-theme="light"] .fp-dark [style*="rgba(255,255,255,0.78"],
[data-theme="light"] .fp-dark [style*="rgba(255,255,255,0.75"],
[data-theme="light"] .fp-dark [style*="rgba(255,255,255,0.65"],
⋮----
[data-theme="light"] .btn--hot               { color: #fff !important; }
[data-theme="light"] .sn__cta                { color: #080e0d !important; }
⋮----
[data-theme="light"] .tt-btn           { color: #0d2220 !important; }
[data-theme="light"] .tt-btn:hover     { color: #0d2220 !important; }
[data-theme="light"] .ls-btn           { color: #0d2220 !important; }
[data-theme="light"] .ls-btn:hover,
[data-theme="light"] .ls-btn svg       { opacity: 0.95 !important; stroke: #0d2220 !important; }
[data-theme="light"] .ls-opt           { color: #0d2220 !important; font-weight: 500 !important; }
[data-theme="light"] .ls-opt:hover     { color: #0d2220 !important; background: rgba(43,191,179,0.14) !important; }
[data-theme="light"] .ls-opt--on       { color: #1fa39a !important; font-weight: 700 !important; }
⋮----
@layer base {
⋮----
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
⋮----
html {
html::-webkit-scrollbar { width: 10px; height: 10px; }
html::-webkit-scrollbar-track { background: transparent; }
html::-webkit-scrollbar-thumb {
html::-webkit-scrollbar-thumb:hover { background: rgba(43,191,179,0.7); background-clip: padding-box; }
body {
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
button { cursor: pointer; border: none; background: none; font: inherit; }
⋮----
.wrap { max-width: 1280px; margin: 0 auto; padding-inline: clamp(1.25rem, 4vw, 3rem); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
⋮----
.eyebrow {
.eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-red); flex-shrink: 0; }
⋮----
/* =======================  MARQUEE DIVIDER  ======================= */
.marquee-wrap {
.marquee-track { display: flex; gap: 0; width: max-content; animation: marquee 28s linear infinite; }
.marquee-track span {
.marquee-track .dot { color: var(--brand-red); padding-inline: 0; }
⋮----
/* =========================================================================
   3D TYPOGRAPHY & TEXT STYLES
   Adds physical depth, subtle drop-shadows, and luminous emboss effects
   to headlines, titles, and key badges across all sections.
   ========================================================================= */
.text-3d, .title-3d {
⋮----
.text-3d-emboss {
⋮----
.text-3d-teal {
⋮----
.text-3d-amber {
⋮----
/* =========================================================================
   3D TACTILE BUTTONS & PILL CONTROLS
   Creates physical 3D depth, inset top highlights, and press depth
   ========================================================================= */
.btn {
.btn--hot {
.btn--hot:hover {
.btn--hot:active {
⋮----
.btn--ghost {
.btn--ghost:hover {
.btn--ghost:active { transform: translateY(1px) scale(0.97); transition-duration: .08s; }
⋮----
/* =======================  AETHER & GLASS BUTTONS ======================= */
.aether-btn {
.aether-btn > a,
.aether-btn > a::before,
.aether-btn > a:hover,
.aether-btn > a:hover::before,
.aether-btn > a:active,
⋮----
/* Secondary Translucent Apple-Style Dark Glass Button */
.btn-secondary-glass {
.btn-secondary-glass:hover {
.btn-secondary-glass:active {
⋮----
/* Light mode overrides for secondary glass button */
[data-theme="light"] .btn-secondary-glass,
[data-theme="light"] .btn-secondary-glass:hover,
⋮----
.new-machine-alert-badge {
⋮----
.new-machine-alert-badge::before {
⋮----
/* =========================================================================
   3D FLOATING BACKGROUND ELEMENTS & ORBS
   Adds animated 3D spheres, luminous glows, and tactile pill badges
   ========================================================================= */
.bg-3d-container {
.bg-3d-orb {
.bg-3d-orb--teal {
.bg-3d-orb--amber {
.bg-3d-orb--rose {
⋮----
.bg-3d-pill-badge {
⋮----
.aether-btn > a, .aether-btn > button, .btn--hot, .btn--ghost { transform: none !important; }
.aether-btn > a::before, .aether-btn > button::before { display: none; }
.bg-3d-orb, .bg-3d-pill-badge { animation: none !important; }
⋮----
/* =======================  CATALOGUE PAGES (/products)  =======================
   Asymmetric hero (title/toolbar | live 3D-staged featured machine, rotating
   through one representative per category) + category-grouped result grids
   using ProductStage3D card tiles instead of flat photo-in-a-box cards. ── */
.cat2-hero {
.cat2-hero__grid {
.cat2-hero__inner {
.cat2-crumb {
.cat2-crumb a { color: var(--ink-35); transition: color 0.15s; }
.cat2-crumb a:hover { color: var(--brand-teal); }
.cat2-crumb span { color: var(--ink-15); }
.cat2-crumb__cur { color: var(--ink-60) !important; }
.cat2-hero__h1 {
.cat2-hero__sub {
⋮----
/* ── toolbar — search + filter pills as one cohesive strip ── */
.cat2-toolbar { margin-top: 2.25rem; display: flex; flex-direction: column; gap: 1rem; }
.cat2-search {
.cat2-search:focus-within { border-color: var(--brand-teal); }
.cat2-search__icon { color: var(--ink-35); display: flex; flex-shrink: 0; }
.cat2-search:focus-within .cat2-search__icon { color: var(--brand-teal); }
.cat2-search__input {
.cat2-search__input::placeholder { color: var(--ink-35); }
.cat2-search__clear {
.cat2-search__clear:hover { color: var(--brand-red); }
⋮----
.cat2-filter { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.cat2-filter__pill {
.cat2-filter__pill:hover { border-color: var(--brand-teal); color: var(--ink); }
.cat2-filter__pill--active {
.cat2-filter__pill--active .cat2-filter__count { color: #06201d; opacity: 0.65; }
.cat2-filter__count { color: var(--ink-35); font-size: 0.65rem; }
⋮----
/* ── hero stage — the rotating featured machine ── */
.cat2-hero__stage { position: relative; }
.cat2-hero__dots {
.cat2-hero__dot {
.cat2-hero__dot:hover { border-color: var(--brand-teal); }
.cat2-hero__dot--on { background: var(--brand-teal); border-color: var(--brand-teal); width: 20px; border-radius: 4px; }
⋮----
/* ── results ── */
.cat2-results { background: var(--bg-base); padding: clamp(3rem, 6vw, 5rem) 0; }
.cat2-results-head { margin-bottom: 1.75rem; }
.cat2-results-count {
.cat2-empty {
⋮----
/* ── category groups (unfiltered "All" browse state) ── */
.cat2-group { margin-bottom: clamp(3rem, 6vw, 4.5rem); }
.cat2-group:last-child { margin-bottom: 0; }
.cat2-group__head {
.cat2-group__title {
.cat2-group__tag { color: var(--ink-35); font-size: 0.88rem; flex: 1; min-width: 0; }
.cat2-group__link {
.cat2-group__link:hover { text-decoration: underline; }
⋮----
.cat2-feature {
.cat2-feature:hover { border-color: rgba(43,191,179,0.35); }
.cat2-feature__stage { position: relative; }
.cat2-feature__body { display: flex; flex-direction: column; gap: 0.6rem; }
.cat2-feature__name {
⋮----
.cat2-feature { grid-template-columns: 1fr; }
⋮----
.cat2-grid {
.cat2-card {
.cat2-card:hover { background: var(--bg-raise); border-color: rgba(43,191,179,0.35); }
.cat2-card__body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.6rem; flex: 1; }
.cat2-card__series {
.cat2-card__name { font-family: var(--ff-display); font-size: 1.5rem; color: var(--ink); line-height: 1.05; }
.cat2-card__tag { font-size: 0.92rem; font-weight: 400; color: var(--ink-35); line-height: 1.6; }
.cat2-card__models { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: auto; padding-top: 1rem; }
⋮----
.cat2-hero__inner { grid-template-columns: 1fr; }
.cat2-hero__stage { order: -1; max-width: 420px; margin: 0 auto; }
⋮----
.family-block { padding-block: 4rem; border-top: 1px solid var(--bg-line); scroll-margin-top: 80px; }
.family-block__head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; }
.family-block__title { font-family: var(--ff-display); font-size: clamp(2rem, 5vw, 3.5rem); color: var(--ink); line-height: 0.98; margin-top: 0.5rem; }
.family-block__tag { color: var(--ink-35); font-size: 1rem; font-weight: 400; line-height: 1.7; margin-top: 0.4rem; max-width: 52ch; }
.mat-badge { font-family: var(--ff-mono); font-size: 0.7rem; letter-spacing: 0.08em; color: var(--brand-red); border: 1px solid rgba(43,191,179,0.25); padding: 0.4rem 0.75rem; }
⋮----
.spec-wrap {
.spec-wrap::-webkit-scrollbar { height: 6px; }
.spec-wrap::-webkit-scrollbar-thumb { background: var(--bg-line); border-radius: 3px; }
.spec-wrap-fade {
.spec-table { width: 100%; border-collapse: collapse; min-width: 500px; }
.spec-table th, .spec-table td { padding: 0.85rem 1rem; text-align: left; border-bottom: 1px solid var(--bg-line); vertical-align: top; }
.spec-table th:first-child, .spec-table td:first-child {
.spec-table thead th { background: var(--slate); font-family: var(--ff-display); text-transform: uppercase; font-size: 1rem; color: #fff; }
.spec-table thead th:first-child { background: #1e293b; }
[data-theme="light"] .spec-table thead th              { background: #ffffff; color: #0d2220; border-bottom: 2px solid rgba(13,34,32,0.12); }
[data-theme="light"] .spec-table thead th:first-child   { background: #ffffff; }
.spec-table .spec-label b { display: block; font-weight: 600; font-size: 0.9rem; color: var(--ink); }
.spec-table .spec-label i { font-style: normal; color: var(--ink-35); font-size: 0.8rem; }
.spec-table td.val { font-family: var(--ff-mono); font-size: 0.85rem; color: var(--ink); }
.spec-table tbody tr:nth-child(odd) td  { background: var(--bg-base); }
.spec-table tbody tr:nth-child(even) td { background: var(--bg-surface); }
.spec-table tbody tr:hover td { background: var(--bg-raise); }
⋮----
.spec-table tbody tr:nth-child(odd) td:first-child  { background: var(--bg-base); }
.spec-table tbody tr:nth-child(even) td:first-child { background: var(--bg-surface); }
.spec-table tbody tr:hover td:first-child { background: var(--bg-raise); }
⋮----
.footer {
⋮----
.footer-bg-grid {
.footer-bg-glow {
⋮----
.footer > canvas { z-index: 0; }
⋮----
.footer-live-dot {
⋮----
.footer-live-dot { animation: none; }
⋮----
.footer-shortcuts {
.footer-shortcut {
.footer-shortcut:hover { background: rgba(255,255,255,0.04); }
.footer-shortcut__icon {
.footer-shortcut:hover .footer-shortcut__icon {
.footer-shortcut__label {
.footer-shortcut:hover .footer-shortcut__label { color: #fff; }
⋮----
.footer-bottom {
.footer-brand-col { display: flex; flex-direction: column; gap: .35rem; }
.footer-logo-row { display: flex; align-items: center; gap: 1rem; }
.footer-logo {
.footer-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.footer-brand { font-family: var(--ff-display); font-size: 1.4rem; color: #fff; line-height: 1; }
.footer-brand span { color: var(--brand-red); }
.footer-founded {
.footer-founded__dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.3); flex-shrink: 0; }
⋮----
.footer-links {
.footer-links a {
.footer-links a:hover { color: #fff; }
⋮----
.footer-contact-col {
.footer-contact-link,
.footer-contact-link:hover { color: #fff; }
.footer-contact-link svg,
.footer-contact-static { color: rgba(255,255,255,0.72); }
⋮----
.footer-main-grid { border-bottom: 1px solid rgba(255,255,255,0.06); }
⋮----
.footer-certs { border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; z-index: 1; }
.footer-certs__label { color: rgba(255,255,255,0.60); }
.footer-certs__stats { color: rgba(255,255,255,0.60); }
.footer-cert-badge {
.footer-cert-badge:hover {
⋮----
.footer-cert-badge { transition: none; }
⋮----
.footer-bar { border-top: 1px solid rgba(255,255,255,0.06); padding-block: 1.2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .5rem; }
.footer-bar p { font-family: var(--ff-mono); font-size: .72rem; letter-spacing: .04em; color: rgba(255,255,255,0.65); }
.footer-copyright { color: rgba(255,255,255,0.65); }
.footer-legal-link { color: rgba(255,255,255,0.60); }
.footer-bar__company { color: rgba(255,255,255,0.65); }
⋮----
.footer-col-link { font-family: var(--ff-body); font-size: .82rem; color: rgba(255,255,255,0.72); text-decoration: none; transition: color 0.2s; line-height: 1.6; }
.footer-col-link:hover { color: #fff; }
⋮----
.footer-col-toggle {
.footer-col-title { font-family: var(--ff-display); font-size: 0.85rem; letter-spacing: 0.06em; color: #fff; text-transform: uppercase; margin: 0; }
.footer-col-chev { display: none; }
.footer-col-body { display: flex; flex-direction: column; gap: 0.6rem; }
⋮----
.footer-social-icon {
.footer-social-icon:hover {
.footer-social-icon:active { transform: translateY(0) scale(0.94); transition-duration: 0.08s; }
@media (prefers-reduced-motion: reduce) { .footer-social-icon { transform: none !important; } }
⋮----
.footer-shortcuts { grid-template-columns: repeat(3, 1fr); }
.footer-bottom { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
.footer-main-grid { grid-template-columns: 1fr 1fr !important; }
⋮----
.footer-shortcuts { grid-template-columns: repeat(2, 1fr); }
.footer-main-grid { grid-template-columns: 1fr !important; row-gap: 1.5rem !important; }
⋮----
.footer-brand-block { flex-direction: column !important; align-items: flex-start; justify-content: flex-start; gap: 1.25rem !important; }
.footer-brand-text { width: 100%; min-width: 0; }
.footer-brand-text p { max-width: none !important; }
.footer-qr-row { flex-shrink: 0; gap: 1rem !important; justify-content: flex-start; margin-top: 0.5rem; }
.footer-qr-row img { width: 72px !important; height: 72px !important; }
⋮----
.footer-col { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; }
⋮----
.footer-col-chev { display: block; flex-shrink: 0; color: rgba(255,255,255,0.60); transition: transform 0.2s ease; }
.footer-col-toggle[aria-expanded="true"] .footer-col-chev { transform: rotate(180deg); }
.footer-col-body { display: none; padding-top: 0.9rem; }
.footer-col-body--open { display: flex; }
⋮----
.footer-certs { gap: 0.6rem !important; padding-block: 1rem !important; }
.footer-certs__label { width: 100%; }
.footer-certs__spacer { display: none; }
.footer-certs__stats { width: 100%; }
⋮----
.footer-bar { padding-block: 0.9rem !important; gap: 0.4rem !important; }
.footer-bar p { font-size: 0.66rem !important; }
.footer-bar__legal { gap: 1rem !important; }
.footer-bar__legal a { font-size: 0.62rem !important; }
.footer-bar__company { width: 100%; order: 3; }
⋮----
[data-theme="light"] .footer            { background: #ffffff; border-top-color: rgba(43,191,179,0.18); }
[data-theme="light"] .footer-bg-grid    { -webkit-mask-image: linear-gradient(to bottom, transparent, #000 15%, #000 85%, transparent); opacity: 0.6; }
[data-theme="light"] .footer-bg-glow    { background: radial-gradient(circle, rgba(43,191,179,0.14) 0%, transparent 70%); }
[data-theme="light"] .footer-main-grid  { border-bottom-color: rgba(43,191,179,0.18); }
[data-theme="light"] .footer-logo       { border-color: rgba(43,191,179,0.25); }
[data-theme="light"] .footer-brand      { color: #0d2220; }
[data-theme="light"] .footer-founded    { color: rgba(13,34,32,0.72); }
[data-theme="light"] .footer-founded__dot { background: rgba(13,34,32,0.55); }
[data-theme="light"] .footer-shortcut   { background: #ffffff; }
[data-theme="light"] .footer-shortcut:hover { background: rgba(43,191,179,0.06); }
[data-theme="light"] .footer-shortcut__label { color: rgba(13,34,32,0.72); }
[data-theme="light"] .footer-shortcut:hover .footer-shortcut__label { color: #0d2220; }
[data-theme="light"] .footer-links a    { color: rgba(13,34,32,0.80); }
[data-theme="light"] .footer-links a:hover { color: #0d2220; }
[data-theme="light"] .footer-contact-link  { color: rgba(13,34,32,0.80); }
[data-theme="light"] .footer-contact-link:hover { color: #0d2220; }
[data-theme="light"] .footer-contact-static { color: rgba(13,34,32,0.72); }
[data-theme="light"] .footer-col-link { color: rgba(13,34,32,0.72); }
[data-theme="light"] .footer-col-link:hover { color: #0d2220; }
[data-theme="light"] .footer-col-title { color: #0d2220; }
[data-theme="light"] .footer-col { border-top-color: rgba(43,191,179,0.18); }
[data-theme="light"] .footer-col-chev { color: rgba(13,34,32,0.60); }
[data-theme="light"] .footer-social-icon { background: rgba(13,34,32,0.06); color: rgba(13,34,32,0.72); }
[data-theme="light"] .footer-social-icon:hover { background: rgba(13,34,32,0.12); box-shadow: 0 8px 18px -10px rgba(13,34,32,0.35); }
[data-theme="light"] .footer-bar        { border-top-color: rgba(43,191,179,0.18); }
[data-theme="light"] .footer-bar p      { color: rgba(13,34,32,0.72); }
[data-theme="light"] .footer-blurb      { color: rgba(13,34,32,0.72); }
[data-theme="light"] .footer-qr-label   { color: rgba(13,34,32,0.65); }
[data-theme="light"] .footer-contact-heading { color: #0d2220; }
[data-theme="light"] .footer-certs      { border-bottom-color: rgba(13,34,32,0.1); }
[data-theme="light"] .footer-certs__label { color: rgba(13,34,32,0.70); }
[data-theme="light"] .footer-certs__stats { color: rgba(13,34,32,0.70); }
[data-theme="light"] .footer-cert-badge { color: rgba(13,34,32,0.75); border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .footer-copyright  { color: rgba(13,34,32,0.70); }
[data-theme="light"] .footer-legal-link { color: rgba(13,34,32,0.65); }
[data-theme="light"] .footer-bar__company { color: rgba(13,34,32,0.70); }
⋮----
.marquee-track { animation: none; }
.mr-lens { display: none; }
[data-reveal] { opacity: 1 !important; transform: none !important; clip-path: none !important; }
[data-ts-hex], [data-ts-icon], [data-ts-table], [data-ts-row] {
⋮----
.sr-push { opacity: 1 !important; transform: none !important; filter: none !important; }
⋮----
.wrap { padding-inline: 1rem; }
⋮----
.footer-grid { grid-template-columns: 1fr; gap: 2rem; padding-block: 2.5rem; }
.footer-brand { font-size: 1.3rem; }
.footer-bar { flex-direction: column; gap: 0.35rem; padding-block: 1rem; }
⋮----
.spec-wrap { -webkit-overflow-scrolling: touch; }
.spec-table { min-width: 420px; }
.spec-table th, .spec-table td { padding: 0.6rem 0.7rem; font-size: 0.8rem; }
⋮----
.contact-grid { grid-template-columns: 1fr; gap: 2rem; padding-block: 2.5rem; }
⋮----
.scroll-title { font-size: clamp(2rem, 8vw, 3rem); }
.hero-title   { font-size: clamp(2.5rem, 10vw, 4rem); }
⋮----
.families-scroll { grid-template-columns: 1fr 1fr; }
⋮----
.spec-grid-section .wrap { grid-template-columns: 1fr; gap: 2rem; }
.text-side h2 { font-size: clamp(1.8rem, 8vw, 3rem); }
⋮----
.spec-number-cell b { font-size: clamp(1.4rem, 6vw, 2rem); }
⋮----
.btn { padding: 0.7rem 1.1rem; font-size: 0.72rem; }
⋮----
section, header, footer, main, article {
⋮----
.sh-section, .cj, .trust-section, .mcs, .cc, .fls-layout { overflow-x: hidden; }
⋮----
.sh-full { height: 100vh; }
@media (max-width: 768px) { .sh-full { height: auto !important; min-height: 0 !important; } }
⋮----
.pp-desktop {
⋮----
.sh-spacer {
⋮----
.sh-machine-anchor {
⋮----
.sh-sec, .sh-sec2-text {
⋮----
.sh-section {
⋮----
.sh-hot-head { display: none !important; }
.sh-3col {
⋮----
.sh-3col-center {
⋮----
.sh-mob-carousel { display: block !important; }
⋮----
.cat2-hero { padding-top: 5rem; }
.cat2-hero__h1 { font-size: clamp(2rem, 9vw, 3rem); }
.cat2-search { max-width: none; }
⋮----
.cat2-toolbar { margin-inline: -1rem; padding-inline: 1rem; overflow: hidden; }
.cat2-filter {
.cat2-filter::-webkit-scrollbar { display: none; }
.cat2-filter__pill { font-size: 0.62rem; white-space: nowrap; flex-shrink: 0; }
⋮----
.cat2-feature { grid-template-columns: 1fr !important; }
.cat2-feature__stage { order: -1; max-height: 240px; overflow: hidden; }
.cat2-feature__name { font-size: 1.3rem; }
.cat2-feature__body { padding: 0.5rem 0; }
⋮----
.family-block { padding-block: 2.5rem; }
.family-block__title { font-size: clamp(1.5rem, 7vw, 2.5rem); }
.family-block__layout { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
.family-block__media { position: static !important; top: 0 !important; }
⋮----
.spec-table { font-size: 0.8rem; }
.spec-table th, .spec-table td { padding: 0.55rem 0.65rem; }
⋮----
.gallery-grid { grid-template-columns: repeat(2, 1fr); }
⋮----
.family-block__head { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
⋮----
.mat-badge { font-size: 0.7rem; padding: 0.3rem 0.55rem; }
⋮----
.pdv2-collage { height: clamp(120px, 32vw, 180px); }
.pdv2-collage__panel { clip-path: none !important; margin: 0 !important; z-index: auto !important; }
.pdv2-collage__panel img { width: 62%; height: 62%; }
⋮----
.cat2-hero__h1 { font-size: clamp(1.8rem, 9vw, 2.5rem); }
.gallery-grid { grid-template-columns: 1fr 1fr; }
⋮----
.cat2-grid { grid-template-columns: 1fr 1fr !important; }
.cat2-feature { padding: 1rem; }
⋮----
.cat2-card__body { padding: 0.85rem; gap: 0.35rem; }
.cat2-card__series { font-size: 0.58rem; }
.cat2-card__name { font-size: 1rem; }
.cat2-card__tag { font-size: 0.74rem; line-height: 1.4; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
.cat2-card__models { gap: 0.3rem; padding-top: 0.6rem; }
.cat2-card__models .chip:nth-child(n+3) { display: none; }
.chip { font-size: 0.58rem; padding: 0.22rem 0.45rem; }
⋮----
.spec-number-grid { grid-template-columns: 1fr 1fr; }
⋮----
.pd-cta-row   { flex-direction: column; }
.pd-cta-row .btn { width: 100%; justify-content: center; }
⋮----
.cat2-hero { padding-top: 5.5rem; padding-bottom: 1.5rem; }
⋮----
.ccp-hero {
.ccp-hero::before {
.ccp-hero__mosaic {
.ccp-hero__mosaic-cell {
.ccp-hero__mosaic-cell::after {
.ccp-hero__mosaic-cell img {
.ccp-hero__mosaic-cell:hover img { transform: scale(1.06); }
.ccp-hero__mosaic--single { grid-template-columns: 1fr; grid-template-rows: 1fr; }
.ccp-hero__content {
.ccp-crumb {
.ccp-crumb a { color: var(--ink-35); transition: color 0.15s; }
.ccp-crumb a:hover { color: var(--brand-teal); }
.ccp-crumb__sep { color: var(--ink-15); }
.ccp-crumb__cur { color: var(--ink-60); }
.ccp-hero__tag {
.ccp-hero__tag::before {
.ccp-hero__h1 {
.ccp-hero__blurb {
.ccp-tabs-toggle { display: none; }
.ccp-tabs {
.ccp-tab {
.ccp-tab:hover { color: var(--ink-60); }
.ccp-tab--active { color: var(--brand-teal); border-top-color: var(--brand-teal); }
.ccp-hero__scan {
.ccp-hero__scan::after {
⋮----
@media (prefers-reduced-motion: reduce) { .ccp-hero__scan::after { animation: none; } }
⋮----
/* ── feature badges ── */
.ccp-features { background: var(--bg-surface); border-bottom: 1px solid var(--bg-line); padding: 0; }
.ccp-features__inner {
.ccp-feat {
.ccp-feat:last-child { border-right: none; margin-right: 0; }
.ccp-feat__icon {
.ccp-feat__icon svg { width: 1.15rem; height: 1.15rem; stroke-width: 2; }
.ccp-feat__label {
⋮----
/* ── product grid ── */
.ccp-grid-section { background: var(--bg-base); padding: clamp(3rem, 6vw, 5rem) 0; }
.ccp-grid-section__wrap { max-width: 1280px; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 3rem); }
.ccp-grid-header {
.ccp-grid-header h2 {
.ccp-grid-header h2 em { color: var(--brand-teal); font-style: normal; }
.ccp-count {
.ccp-grid {
⋮----
/* ── card ── */
.ccp-card {
.ccp-card--visible { opacity: 1; transform: translateY(0); }
.ccp-card:hover { background: var(--bg-raise); }
.ccp-card::before {
.ccp-card:hover::before { transform: scaleY(1); }
.ccp-card__img {
.ccp-card__img::after {
.ccp-card__img img {
.ccp-card:hover .ccp-card__img img {
.ccp-card__badge {
.ccp-card__body {
.ccp-card__name {
.ccp-card__tagline {
.ccp-card__specs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem; }
.ccp-spec-pill {
.ccp-spec-pill__label {
.ccp-spec-pill__val {
.ccp-card__models { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.5rem; }
.ccp-card__model {
.ccp-card__footer {
.ccp-card__materials {
.ccp-card__materials::before {
.ccp-card__cta {
.ccp-card:hover .ccp-card__cta { gap: 0.6rem; }
.ccp-card__cta-arrow { display: inline-block; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1); }
.ccp-card:hover .ccp-card__cta-arrow { transform: translateX(4px); }
⋮----
/* ── cta band ── */
.ccp-cta {
.ccp-cta::before {
.ccp-cta__inner {
.ccp-cta__h2 {
.ccp-cta__h2 em { color: var(--brand-teal); font-style: normal; }
.ccp-cta__p { font-size: 0.95rem; color: rgba(255,255,255,0.75); max-width: 44ch; line-height: 1.7; }
⋮----
/* ── light mode ── */
[data-theme="light"] .ccp-hero               { background: #ffffff; }
[data-theme="light"] .ccp-hero::before        { background-image: linear-gradient(rgba(43,191,179,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(43,191,179,0.1) 1px, transparent 1px); }
[data-theme="light"] .ccp-hero__h1            { color: #0d2220; }
[data-theme="light"] .ccp-hero__blurb         { color: rgba(13,34,32,0.72); }
[data-theme="light"] .ccp-hero__tag           { color: var(--brand-teal); }
[data-theme="light"] .ccp-crumb               { color: rgba(13,34,32,0.65); }
[data-theme="light"] .ccp-crumb a             { color: rgba(13,34,32,0.65); }
[data-theme="light"] .ccp-crumb__cur          { color: rgba(13,34,32,0.72); }
[data-theme="light"] .ccp-tab                 { color: rgba(13,34,32,0.65); }
[data-theme="light"] .ccp-tab--active         { color: var(--brand-teal); }
[data-theme="light"] .ccp-features            { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-feat__label         { color: rgba(13,34,32,0.78); }
[data-theme="light"] .ccp-feat                { border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-grid-section        { background: #ffffff; }
[data-theme="light"] .ccp-grid-header h2      { color: #0d2220; }
[data-theme="light"] .ccp-grid-header         { border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-grid                { background: rgba(13,34,32,0.12); border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-card                { background: #fff; }
[data-theme="light"] .ccp-card:hover          { background: #ffffff; }
[data-theme="light"] .ccp-card__img           { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-card__name          { color: #0d2220; }
[data-theme="light"] .ccp-card__tagline       { color: rgba(13,34,32,0.72); }
[data-theme="light"] .ccp-spec-pill           { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-spec-pill__label    { color: rgba(13,34,32,0.65); }
[data-theme="light"] .ccp-spec-pill__val      { color: #0d2220; }
[data-theme="light"] .ccp-card__model         { color: rgba(13,34,32,0.65); border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-card__footer        { border-color: rgba(13,34,32,0.12); }
[data-theme="light"] .ccp-card__materials     { color: rgba(13,34,32,0.65); }
[data-theme="light"] .ccp-hero__mosaic-cell   { background: #fff; }
[data-theme="light"] .ccp-count               { color: rgba(13,34,32,0.65); }
⋮----
.ccp-hero__mosaic { display: none; }
.ccp-hero { min-height: unset; }
.ccp-grid { grid-template-columns: 1fr 1fr; }
⋮----
.ccp-tabs-toggle {
.ccp-tabs-toggle svg { flex-shrink: 0; transition: transform 0.2s ease; }
.ccp-tabs-wrap--open .ccp-tabs-toggle svg { transform: rotate(180deg); }
⋮----
.ccp-tabs-wrap--open .ccp-tabs { display: flex; }
⋮----
.ccp-tab--active { border-left-color: var(--brand-teal); border-top-color: transparent; background: color-mix(in srgb, var(--brand-teal) 6%, transparent); }
⋮----
.ccp-feat { padding: 0.9rem 0.5rem; margin-right: 0; border-right: none; }
.ccp-feat:nth-child(odd) { border-right: 1px solid var(--bg-line); }
.ccp-feat__icon { width: 2.2rem; height: 2.2rem; }
.ccp-feat__icon svg { width: 1rem; height: 1rem; }
.ccp-feat__label { font-size: 0.66rem; white-space: normal; line-height: 1.3; }
⋮----
.ccp-card::after {
⋮----
.ccp-card__img img { width: 78%; height: 78%; }
.ccp-card__badge { display: none; }
.ccp-card__body { padding: 0.65rem 0.75rem; gap: 0.15rem; min-width: 0; }
.ccp-card__name { font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ccp-card__tagline { font-size: 0.68rem; line-height: 1.35; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; max-width: none; }
.ccp-card__specs { margin-top: 0.3rem; }
.ccp-card__specs .ccp-spec-pill:not(:first-child) { display: none; }
.ccp-spec-pill { padding: 0; border: none; background: none; min-width: 0; flex-direction: row; gap: 0.3rem; align-items: baseline; }
.ccp-spec-pill__label { font-size: 0.54rem; margin-bottom: 0; }
.ccp-spec-pill__val { font-size: 0.64rem; color: var(--brand-teal); }
.ccp-card__models { display: none; }
.ccp-card__footer { display: none; }
⋮----
.ccp-cta__inner { flex-direction: column; align-items: flex-start; }
⋮----
.pdv2-wrap {
⋮----
.pdv2-section-head {
.pdv2-section-head__line {
.pdv2-section-head h2 {
.pdv2-section-head h2 em { color: var(--brand-teal); font-style: normal; }
.pdv2-section-head__note {
.pdv2-section-head__link {
.pdv2-section-head__link:hover { border-bottom-color: var(--brand-teal); }
⋮----
.pdv2-hero {
.pdv2-hero__grid {
⋮----
.pdv2-collage {
.pdv2-collage__panel {
.pdv2-collage__panel:last-child { border-right: none; }
.pdv2-collage__panel:nth-child(1) { clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%); margin-right: -6%; }
.pdv2-collage__panel:nth-child(2) { clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%); z-index: 1; }
.pdv2-collage__panel:nth-child(3) { clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%); margin-left: -6%; z-index: 2; }
.pdv2-collage__panel img {
⋮----
.pdv2-crumb {
.pdv2-crumb a { color: var(--ink-35); transition: color 0.15s; }
.pdv2-crumb a:hover { color: var(--brand-teal); }
.pdv2-crumb span { color: var(--ink-15); }
.pdv2-crumb__cur { color: var(--ink-60) !important; }
⋮----
.pdv2-title-block {
.pdv2-title-block__cat {
.pdv2-title-block__cat::before {
.pdv2-title-block__h1 {
.pdv2-title-block__tagline {
⋮----
/* two-col layout */
.pdv2-hero__cols {
⋮----
/* ── LEFT: product photo gallery — one large shot + thumbnail strip
   when the admin has uploaded more than one photo ── */
.pdv2-gallery {
⋮----
/* ── PRODUCT STAGE — mouse-tracked 3D showcase for the hero photo.
   Layered depth planes (grid, glow, ring, pedestal) + a perspective tilt
   and specular sheen driven by --tilt-x/--tilt-y/--glow-x/--glow-y,
   set from ProductStage3D's rAF loop. Static (transform: none) whenever
   that component decides not to attach pointer listeners. ── */
.pstage {
.pstage__grid {
.pstage__glow {
.pstage__ring {
.pstage__pedestal {
.pstage__tilt {
.pstage--interactive .pstage__tilt { transition: transform 0.08s linear; }
.pstage__img {
.pstage__img img {
/* loading skeleton — a soft shimmer instead of a blank/broken-looking tile
   while the lazy-loaded photo is still in flight. */
.pstage__img--loading img { opacity: 0; }
.pstage__img--loading::after {
⋮----
.pstage__img--loading::after { animation: none; }
⋮----
.pstage__sheen {
.pstage--interactive:hover .pstage__sheen { opacity: 1; }
.pstage__badge {
.pstage__corner {
.pstage__corner--tl { top: 0.75rem; left: 0.75rem; border-top: 2px solid; border-left: 2px solid; opacity: 0.55; }
.pstage__corner--br { bottom: 0.75rem; right: 0.75rem; border-bottom: 2px solid; border-right: 2px solid; opacity: 0.55; }
⋮----
.pstage { aspect-ratio: 4 / 3.4; }
.pstage__ring { display: none; }
⋮----
.pstage__tilt { transition: none; }
⋮----
/* ── card variant — same mechanics, leaner staging for a grid tile:
   no ring/corners/pedestal theatrics, tighter perspective so the tilt
   still reads at a smaller size, image sits closer to the surface. ── */
.pstage--card {
.pstage--card .pstage__grid { background-size: 22px 22px; }
.pstage--card .pstage__pedestal { bottom: 4%; height: 10%; }
.pstage--card .pstage__img { transform: translateZ(24px); }
.pstage--card .pstage__img img { filter: drop-shadow(0 14px 26px rgba(0,0,0,0.5)); }
.pstage--card .pstage__sheen { transform: translateZ(26px); }
.pstage--card .pstage__tilt { width: 88%; height: 88%; }
⋮----
/* ── cover variant — full-bleed backdrop use: the parent element owns the
   aspect ratio (e.g. a cinematic hero frame), so the stage fills it edge to
   edge. The photo itself still uses object-fit: contain (see ProductStage3D)
   so the whole machine stays visible instead of being cropped by whatever
   aspect ratio the frame happens to be — a scenic photo can afford to lose
   its edges to a cover-crop, a product shot where "the whole machine" is
   the point cannot. The frame's own background shows in any letterboxed
   gap, so it reads as an intentional stage, not a broken image. ── */
.pstage--cover {
.pstage--cover .pstage__tilt { width: 100%; height: 100%; }
.pstage--cover .pstage__img img { filter: none; }
⋮----
.pdv2-thumbs {
.pdv2-thumb {
.pdv2-thumb:hover {
.pdv2-thumb--on { opacity: 1; border-color: var(--brand-teal); }
.pdv2-thumb img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
⋮----
.pdv2-info-card {
.pdv2-info-card:hover {
⋮----
.pdv2-model-strip {
.pdv2-model-strip__label {
.pdv2-model-strip__chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.pdv2-mchip {
.pdv2-mchip:hover { border-color: rgba(43,191,179,0.4); color: var(--ink); transform: translateY(-1px); }
.pdv2-mchip:active { transform: scale(0.95); }
.pdv2-mchip--on {
⋮----
.pdv2-spec-panel {
.pdv2-spec-panel__head {
.pdv2-spec-row {
.pdv2-spec-row:nth-child(even) { background: rgba(43,191,179,0.025); }
.pdv2-spec-row:last-child { border-bottom: none; }
.pdv2-spec-row:hover { background: rgba(43,191,179,0.06); }
.pdv2-spec-row__label {
.pdv2-spec-row__val {
.pdv2-spec-row--empty {
.pdv2-spec-row--empty .pdv2-spec-row__label {
⋮----
.pdv2-mats {
.pdv2-mats__label {
.pdv2-mats__tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.pdv2-mat-tag {
.pdv2-mat-tag:hover { border-color: rgba(43,191,179,0.4); color: var(--ink); }
⋮----
.pdv2-model-btn {
.pdv2-model-btn:hover { color: #fff; }
.pdv2-model-btn:active { transform: translateY(1px); }
.pdv2-model-btn--on {
.pdv2-model-btn--on:hover { color: #0d2220; }
⋮----
.pdv2-model-btn { transition: none; }
⋮----
.pdv2-panel__ctas { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.pdv2-back-btn {
.pdv2-back-btn:hover { border-color: rgba(43,191,179,0.35); color: var(--ink-60); transform: translateX(-3px); }
.pdv2-back-btn:active { transform: translateX(-3px) scale(0.97); }
⋮----
.pdv2-trust-row {
.pdv2-trust-item {
.pdv2-trust-item svg {
⋮----
.pdv2-breakdown {
.pdv2-breakdown-frame {
.pdv2-breakdown-frame__img {
.pdv2-pin {
.pdv2-pin__dot {
⋮----
.pdv2-pin__card {
.pdv2-pin__label {
.pdv2-pin__value {
⋮----
.pdv2-pin__dot { animation: none; }
⋮----
.pdv2-breakdown-frame { aspect-ratio: 4 / 3; }
.pdv2-pin__card { padding: 0.3rem 0.5rem; }
.pdv2-pin__label { font-size: 0.5rem; }
.pdv2-pin__value { font-size: 0.8rem; }
⋮----
.pdv2-tabsection {
.pdv2-tabbar {
.pdv2-tab {
.pdv2-tab:hover { color: var(--ink-60); transform: translateY(-1px); }
.pdv2-tab--on { color: var(--brand-teal); border-bottom-color: var(--brand-teal); }
.pdv2-tabpane {
⋮----
.pdv2-section-head--tab { margin-bottom: 0; }
.pdv2-section-head--tab h3 {
⋮----
.pdv2-part {
.pdv2-part__head {
.pdv2-part__head::before {
.pdv2-part__shot {
.pdv2-part__shot img {
.pdv2-part__shot:hover img { transform: scale(1.03); }
.pdv2-part__icon {
.pdv2-part__detail {
⋮----
/* Output Sample tab */
.pdv2-sample {
.pdv2-sample__img {
.pdv2-sample__img img {
.pdv2-sample__body h3 {
.pdv2-sample__body p {
⋮----
.pdv2-sample { grid-template-columns: 1fr; }
⋮----
/* ════════════════════════════════════════
   FULL SPEC TABLE SECTION
════════════════════════════════════════ */
.pdv2-specs-section {
.pdv2-table-wrap { overflow-x: auto; }
.pdv2-table {
.pdv2-table thead th {
.pdv2-table thead th:first-child { color: var(--ink); width: 35%; }
.pdv2-table thead th.pdv2-col--on {
.pdv2-table tbody tr {
.pdv2-table tbody tr:hover { background: rgba(43,191,179,0.03); }
.pdv2-table tbody tr:nth-child(even) td { background: rgba(43,191,179,0.018); }
.pdv2-table td {
.pdv2-table__label {
.pdv2-table td.pdv2-col--on {
.pdv2-table td.pdv2-col--dim {
⋮----
/* ── spec comparison chart — animated horizontal bars, one group per
   numeric spec, one bar per model. Visually matches the About page's
   chart treatment (ab-hbar) so the two pages read as one design system. ── */
.pdv2-specchart {
.pdv2-specchart__row { display: flex; flex-direction: column; gap: 0.75rem; }
.pdv2-specchart__title {
.pdv2-specchart__bars { display: flex; flex-direction: column; gap: 0.5rem; }
.pdv2-specchart__bar {
.pdv2-specchart__label {
.pdv2-specchart__track {
.pdv2-specchart__fill {
.pdv2-specchart__val {
.pdv2-specchart__bar--on .pdv2-specchart__label { color: var(--brand-teal); }
.pdv2-specchart__bar--on .pdv2-specchart__fill { opacity: 1; }
.pdv2-specchart__bar--on .pdv2-specchart__track { background: rgba(43,191,179,0.14); }
.pdv2-specchart__hint {
⋮----
.pdv2-specchart__bar { grid-template-columns: 84px 1fr auto; gap: 0.5rem; }
.pdv2-specchart__label { font-size: 0.74rem; }
.pdv2-specchart__val { font-size: 0.72rem; }
⋮----
/* ── mobile spec cards — replaces the table below 700px so every model
   stays readable in one column instead of scrolling sideways through a
   table squeezed to fit a phone screen. One card per spec, one row per
   model inside it; tapping a row highlights that model everywhere else
   on the page, same as clicking a table column header does above. ── */
.pdv2-speccards { display: none; }
⋮----
.pdv2-table-wrap > .pdv2-table { display: none; }
.pdv2-table-wrap { overflow-x: hidden; }
.pdv2-speccards {
.pdv2-speccard {
.pdv2-speccard__label {
.pdv2-speccard__rows { display: flex; flex-direction: column; }
.pdv2-speccard__row {
.pdv2-speccard__row:last-child { border-bottom: none; }
.pdv2-speccard__row--on {
.pdv2-speccard__model {
.pdv2-speccard__row--on .pdv2-speccard__model { color: var(--brand-teal); }
.pdv2-speccard__val {
⋮----
/* ════════════════════════════════════════
   VIDEO SECTION
════════════════════════════════════════ */
.pdv2-video-section {
.pdv2-video-layout {
.pdv2-video-main { position: relative; }
⋮----
/* honest "video coming soon" empty state — never a fake placeholder video */
.pdv2-video-empty {
.pdv2-video-empty p {
.pdv2-video-empty p strong { color: var(--ink); font-weight: 700; }
⋮----
.pdv2-video-poster {
.pdv2-video-poster__img {
.pdv2-video-poster:hover .pdv2-video-poster__img { transform: scale(1.03); }
.pdv2-video-poster__overlay {
.pdv2-play-btn {
.pdv2-video-poster:hover .pdv2-play-btn {
.pdv2-video-poster__meta {
.pdv2-video-poster__tag {
.pdv2-video-poster__title {
⋮----
.pdv2-video-frame {
.pdv2-video-frame iframe {
⋮----
.pdv2-video-list { display: flex; flex-direction: column; gap: 0.75rem; }
.pdv2-vlist-item {
.pdv2-vlist-item:hover { background: var(--bg-raise); border-color: rgba(43,191,179,0.3); transform: translateX(3px); }
.pdv2-vlist-item--on { border-color: var(--brand-teal); background: rgba(43,191,179,0.05); }
.pdv2-vlist-thumb {
.pdv2-vlist-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pdv2-vlist-play {
.pdv2-vlist-title {
.pdv2-vlist-item--on .pdv2-vlist-title { color: var(--ink); }
⋮----
.pico {
.pico__svg {
.pico--drawn .pico__svg {
⋮----
.pico__svg { opacity: 1 !important; transform: scale(1) !important; transition: none; animation: none !important; }
⋮----
.pdv2-roadmap {
⋮----
.pdv2-roadmap::before {
⋮----
.pdv2-roadmap { grid-template-columns: 1fr; row-gap: 2rem; padding-top: 1rem; }
/* vertical rail down the left edge instead of a horizontal one */
⋮----
.pdv2-roadmap-node {
⋮----
.pdv2-roadmap-node { flex-direction: row; align-items: flex-start; gap: 1rem; }
⋮----
/* badge — bare icon, no box/border/shadow; sits centered on the rail */
.pdv2-roadmap-node__marker {
.pdv2-roadmap-node:hover .pdv2-roadmap-node__marker,
⋮----
.pdv2-roadmap-node__num {
/* real step photo instead of an icon, when one is available — small
   round mask so it reads as part of the same marker line, not a photo card */
.pdv2-roadmap-node__photo {
.pdv2-roadmap-node__photo img { object-fit: cover; }
⋮----
/* connecting drop-line from the badge down to its text box (desktop) —
   on mobile the rail itself runs beside the card instead, so this is
   hidden there to avoid a redundant second line */
.pdv2-roadmap-node__drop {
@media (max-width: 860px) { .pdv2-roadmap-node__drop { display: none; } }
⋮----
/* the text box — always visible; a light lift on hover is still a nice
   touch but the card itself no longer hides by default. */
.pdv2-roadmap-node__body {
.pdv2-roadmap-node:hover .pdv2-roadmap-node__body,
⋮----
.pdv2-roadmap-node__body { transition: none; }
⋮----
.pdv2-roadmap-node__top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.pdv2-roadmap-node__stage { font-family: var(--ff-mono); font-size: .64rem; font-weight: 700; color: var(--ink-35); }
.pdv2-roadmap-node__duration {
.pdv2-roadmap-node__title {
.pdv2-roadmap-node__detail {
⋮----
/* running total — sums every stage's duration into one real "days from
   order to install" figure, so the roadmap ends on a concrete answer to
   the buyer's actual question instead of just naming the stages */
.pdv2-roadmap-total {
.pdv2-roadmap-total__label {
.pdv2-roadmap-total__val {
⋮----
.pdv2-rmodal-veil {
⋮----
.pdv2-rmodal {
⋮----
.pdv2-rmodal-veil, .pdv2-rmodal { animation: none; }
⋮----
.pdv2-rmodal__close {
.pdv2-rmodal__close:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
⋮----
.pdv2-rmodal__mark {
.pdv2-rmodal__icon {
.pdv2-rmodal__photo {
.pdv2-rmodal__photo img { object-fit: cover; }
⋮----
.pdv2-rmodal__icon, .pdv2-rmodal__photo { animation: none; }
⋮----
.pdv2-rmodal__stage {
.pdv2-rmodal__title {
.pdv2-rmodal__meta {
.pdv2-rmodal__detail {
⋮----
.pdv2-rmodal__facts {
.pdv2-rmodal__fact {
.pdv2-rmodal__fact dt {
.pdv2-rmodal__fact dd {
⋮----
.pdv2-rmodal__ask {
.pdv2-rmodal__ask:hover { background: var(--brand-teal-dk); transform: translateY(-1px); }
⋮----
.pdv2-mp {
.pdv2-mp-grid {
.pdv2-mp-card {
.pdv2-mp-card:hover {
.pdv2-mp-card__media {
.pdv2-mp-card__media img {
.pdv2-mp-card:hover .pdv2-mp-card__media img { transform: scale(1.05); }
.pdv2-mp-card__media--empty {
.pdv2-mp-thumbs {
.pdv2-mp-thumb {
.pdv2-mp-thumb:hover { opacity: 1; }
.pdv2-mp-thumb--on { opacity: 1; border-color: var(--brand-teal); }
.pdv2-mp-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pdv2-mp-card__body {
.pdv2-mp-card__name {
.pdv2-mp-card__detail {
⋮----
.pdv2-mp-steps {
.pdv2-mp-steps__label {
.pdv2-mp-steps__list {
.pdv2-mp-step {
.pdv2-mp-step__num {
.pdv2-mp-step__body {
.pdv2-mp-step__img {
.pdv2-mp-step__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pdv2-mp-step__title {
.pdv2-mp-step__detail {
⋮----
.pdv2-mp-step__body { flex-direction: column; }
⋮----
.pdv2-delivery {
⋮----
.pdv2-delivery-grid {
.pdv2-delivery-card {
.pdv2-delivery-card:hover {
.pdv2-delivery-card__step {
.pdv2-delivery-card__icon {
.pdv2-delivery-card:hover .pdv2-delivery-card__icon { transform: scale(1.06); }
.pdv2-delivery-card__label {
.pdv2-delivery-card__detail {
.pdv2-delivery-card__duration {
.pdv2-delivery-card__connector {
⋮----
.pdv2-delivery-grid { grid-template-columns: repeat(3, 1fr); }
.pdv2-delivery-card:not(:nth-child(3n)) .pdv2-delivery-card__connector { display: block; }
⋮----
.pdv2-dv-box {
.pdv2-dv-box:first-of-type { border-top: none; }
.pdv2-dv-box__label {
.pdv2-dv-box__label::before {
.pdv2-dv-box__media {
.pdv2-dv-box__media img {
.pdv2-dv-box:hover .pdv2-dv-box__media img { transform: scale(1.02); }
.pdv2-dv-box__icon {
.pdv2-dv-box__icon::before,
.pdv2-dv-box__icon::before { top: 0; left: 0; border-top: 2px solid; border-left: 2px solid; }
.pdv2-dv-box__icon::after  { bottom: 0; right: 0; border-bottom: 2px solid; border-right: 2px solid; }
.pdv2-dv-box:hover .pdv2-dv-box__icon::before,
⋮----
/* multi-photo nav — overlaid bottom-right, same banner/crop never resizes
   as the visitor steps through a stage's photos */
.pdv2-dv-box__nav {
.pdv2-dv-box__nav-btn {
.pdv2-dv-box__nav-btn:hover { border-color: var(--brand-teal); background: rgba(43,191,179,0.25); transform: translateY(-2px); }
.pdv2-dv-box__nav-btn:active { transform: scale(0.94); }
.pdv2-dv-box__nav-count {
⋮----
.pdv2-dv-box__media { aspect-ratio: 4 / 3; }
⋮----
/* ════════════════════════════════════════
   CUSTOM SECTIONS — admin-authored, fixed safe templates.
   Every rule here assumes worst-case content (very long titles/text,
   missing images, many gallery photos) and stays contained regardless.
════════════════════════════════════════ */
.pdv2-cs {
⋮----
overflow: hidden; /* belt-and-braces: nothing inside can push page width */
⋮----
.pdv2-cs-head {
.pdv2-cs-head__line {
.pdv2-cs-head h2 {
⋮----
/* ── banner: full-width image, title above ── */
.pdv2-cs-banner__media {
.pdv2-cs-banner__media img {
.pdv2-cs-banner__text {
⋮----
.pdv2-cs-banner__media { aspect-ratio: 4 / 3; }
⋮----
/* ── text only ── */
.pdv2-cs-text__body {
⋮----
/* ── split: image one side, text the other — always stacks on mobile ── */
.pdv2-cs-split__row {
.pdv2-cs-split__row--rev .pdv2-cs-split__media { order: 2; }
.pdv2-cs-split__row--rev .pdv2-cs-split__text { order: 1; }
.pdv2-cs-split__media {
.pdv2-cs-split__media img {
.pdv2-cs-split__media-empty {
.pdv2-cs-split__text {
⋮----
.pdv2-cs-split__row { grid-template-columns: 1fr; }
.pdv2-cs-split__row--rev .pdv2-cs-split__media,
⋮----
/* ── gallery grid ── */
.pdv2-cs-gallery__grid {
.pdv2-cs-gallery__cell {
.pdv2-cs-gallery__img {
.pdv2-cs-gallery__img img {
.pdv2-cs-gallery__cell:hover .pdv2-cs-gallery__img img { transform: scale(1.05); }
.pdv2-cs-gallery__caption {
⋮----
/* ════════════════════════════════════════
   SITE GALLERY
════════════════════════════════════════ */
.pdv2-gallery-section {
.pdv2-gallery-grid {
.pdv2-gallery-cell {
.pdv2-gallery-cell__img {
.pdv2-gallery-cell__img img {
.pdv2-gallery-cell:hover .pdv2-gallery-cell__img img { transform: scale(1.05); }
.pdv2-gallery-cell__caption {
⋮----
/* ════════════════════════════════════════
   TESTIMONIALS / REVIEWS
════════════════════════════════════════ */
.pdv2-reviews {
.pdv2-reviews__bg {
.pdv2-reviews__bg::before {
.pdv2-reviews--empty .pdv2-reviews__bg::before { display: none; }
.pdv2-reviews__inner {
⋮----
/* honest "no reviews yet" empty state — spans both columns */
.pdv2-reviews-empty {
.pdv2-reviews-empty p {
⋮----
.pdv2-rating-block {
.pdv2-rating-block__score {
.pdv2-stars { display: flex; gap: 2px; margin: 0.5rem 0; }
.pdv2-rating-block__label {
.pdv2-rating-block__sub {
.pdv2-rating-bars { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.45rem; }
.pdv2-rating-bar {
.pdv2-rating-bar__track {
.pdv2-rating-bar__fill { height: 100%; background: #0d2220; }
.pdv2-rating-bar__pct { width: 2.5rem; text-align: right; opacity: 0.85; }
⋮----
.pdv2-reviews__h2 {
.pdv2-reviews__h2 em { color: var(--brand-teal); font-style: normal; }
.pdv2-review-card {
.pdv2-review-card__quote {
.pdv2-review-card__text {
.pdv2-review-card__author {
.pdv2-review-card__meta { min-width: 0; }
.pdv2-review-card__avatar {
.pdv2-review-card__name {
.pdv2-review-card__title {
.pdv2-review-card__stars { margin-left: auto; }
⋮----
.pdv2-review-nav {
.pdv2-review-nav__btn {
.pdv2-review-nav__btn:hover {
.pdv2-review-nav__btn:active { transform: scale(0.94); }
.pdv2-review-nav__btn--next { background: var(--brand-teal); border-color: var(--brand-teal); color: #0d2220; }
.pdv2-review-nav__btn--next:hover {
.pdv2-review-nav__count {
⋮----
.pdv2-related {
.pdv2-related-grid {
.pdv2-rel-card {
.pdv2-rel-card::after {
.pdv2-rel-card:hover { background: var(--bg-raise); }
.pdv2-rel-card:hover::after { transform: scaleX(1); }
.pdv2-rel-card__img {
.pdv2-rel-card__img img {
.pdv2-rel-card:hover .pdv2-rel-card__img img { transform: scale(1.07); }
.pdv2-rel-card__body { padding: 0.85rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.2rem; }
.pdv2-rel-card__series {
.pdv2-rel-card__name {
⋮----
/* ════════════════════════════════════════
   CTA BAND (newsletter / contact)
════════════════════════════════════════ */
.pdv2-cta-band {
.pdv2-cta-band__img-side {
.pdv2-cta-band__img-side img {
.pdv2-cta-band__img-overlay {
.pdv2-cta-band__img-text {
.pdv2-cta-band__form-side {
.pdv2-cta-band__form-side::before {
.pdv2-cta-band__eyebrow {
.pdv2-cta-band__h2 {
.pdv2-cta-band__h2 em { color: var(--brand-teal); font-style: normal; }
.pdv2-cta-band__sub {
.pdv2-cta-band__sub a { color: var(--brand-teal); }
.pdv2-cta-band__sub a:hover { text-decoration: underline; }
.pdv2-cta-band__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; position: relative; align-items: center; }
.pdv2-ghost-btn {
.pdv2-ghost-btn:hover { color: #fff; border-color: rgba(255,255,255,0.55); }
⋮----
/* ── LIGHT MODE ── */
[data-theme=light] .pdv2-hero           { background: #ffffff; }
[data-theme=light] .pdv2-hero__grid     { background-image: linear-gradient(rgba(43,191,179,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(43,191,179,0.1) 1px, transparent 1px); }
[data-theme=light] .pdv2-panel__h1      { color: #0d2220; }
[data-theme=light] .pdv2-panel__tagline { color: rgba(13,34,32,0.72); }
[data-theme=light] .pdv2-panel__cat     { color: var(--brand-teal); }
[data-theme=light] .pdv2-crumb a        { color: rgba(13,34,32,0.65); }
[data-theme=light] .pdv2-crumb__cur     { color: rgba(13,34,32,0.72) !important; }
[data-theme=light] .pdv2-crumb span     { color: rgba(13,34,32,0.72) !important; }
[data-theme=light] .pstage__grid        { background-color: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pstage__ring        { border-color: rgba(43,191,179,0.25); }
[data-theme=light] .pstage__pedestal    { background: radial-gradient(ellipse 50% 100% at 50% 50%, rgba(13,34,32,0.18) 0%, transparent 72%); }
[data-theme=light] .pstage__img img     { filter: drop-shadow(0 24px 48px rgba(13,34,32,0.22)) drop-shadow(0 4px 12px rgba(13,34,32,0.14)); }
[data-theme=light] .pdv2-thumb          { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-thumb:hover    { border-color: rgba(43,191,179,0.6); }
[data-theme=light] .pdv2-thumb--on      { border-color: var(--brand-teal); }
[data-theme=light] .pdv2-model-strip    { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-mchip          { color: rgba(13,34,32,0.72); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-mchip:hover    { color: #0d2220; }
[data-theme=light] .pdv2-mchip--on      { color: #fff; }
[data-theme=light] .pdv2-spec-panel     { border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-spec-row       { border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-spec-row__label { color: rgba(13,34,32,0.78); }
[data-theme=light] .pdv2-spec-row__val  { color: #0d2220; }
[data-theme=light] .pdv2-mat-tag        { background: #fff; border-color: rgba(13,34,32,0.12); color: rgba(13,34,32,0.72); }
[data-theme=light] .pdv2-back-btn       { color: rgba(13,34,32,0.65); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-trust-item     { color: rgba(13,34,32,0.78); }
[data-theme=light] .pdv2-specs-section  { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-table thead th { background: #ffffff; color: rgba(13,34,32,0.78); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-table thead th:first-child { color: #0d2220; }
[data-theme=light] .pdv2-table thead th.pdv2-col--on { color: #0d2220; background: var(--brand-teal) !important; }
[data-theme=light] .pdv2-table__label   { color: rgba(13,34,32,0.78); }
[data-theme=light] .pdv2-table td.pdv2-col--on { color: #0d2220; background: rgba(43,191,179,0.12) !important; }
[data-theme=light] .pdv2-table td.pdv2-col--dim { color: rgba(13,34,32,0.7); }
[data-theme=light] .pdv2-speccard         { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-speccard__label  { background: #f7fafa; color: rgba(13,34,32,0.78); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-speccard__row    { border-color: rgba(13,34,32,0.08); }
[data-theme=light] .pdv2-speccard__model  { color: rgba(13,34,32,0.5); }
[data-theme=light] .pdv2-speccard__val    { color: #0d2220; }
[data-theme=light] .pdv2-speccard__row--on { background: rgba(43,191,179,0.12); }
[data-theme=light] .pdv2-specchart        { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-specchart__title { color: rgba(13,34,32,0.6); }
[data-theme=light] .pdv2-specchart__label { color: rgba(13,34,32,0.6); }
[data-theme=light] .pdv2-specchart__val   { color: #0d2220; }
[data-theme=light] .pdv2-specchart__hint  { color: rgba(13,34,32,0.4); }
[data-theme=light] .pdv2-specchart__bar--on .pdv2-specchart__label { color: var(--brand-teal); }
[data-theme=light] .pdv2-install        { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-guide-card     { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-guide-card__media { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-guide-card__title  { color: #0d2220; }
[data-theme=light] .pdv2-guide-card__detail { color: rgba(13,34,32,0.7); }
[data-theme=light] .pdv2-guide-card__num::before { color: rgba(13,34,32,0.4); }
[data-theme=light] .pdv2-mp             { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-mp-card        { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-mp-card__media { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-mp-card__name  { color: #0d2220; }
[data-theme=light] .pdv2-mp-card__detail { color: rgba(13,34,32,0.7); }
[data-theme=light] .pdv2-mp-steps       { border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-mp-step__title { color: #0d2220; }
[data-theme=light] .pdv2-mp-step__detail { color: rgba(13,34,32,0.7); }
[data-theme=light] .pdv2-mp-step__img   { border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-delivery       { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-delivery-card  { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-delivery-card:hover { border-color: rgba(43,191,179,0.4); }
[data-theme=light] .pdv2-delivery-card__step { color: #0d2220; }
[data-theme=light] .pdv2-delivery-card__label { color: #0d2220; }
[data-theme=light] .pdv2-delivery-card__detail { color: rgba(13,34,32,0.65); }
[data-theme=light] .pdv2-delivery-card__connector { color: rgba(13,34,32,0.25); }
[data-theme=light] .pdv2-dv-box         { border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-dv-box__media  { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-dv-box__label  { color: #0d2220; }
[data-theme=light] .pdv2-cs             { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-cs-head h2     { color: #0d2220; }
[data-theme=light] .pdv2-cs-banner__media,
[data-theme=light] .pdv2-cs-banner__text,
[data-theme=light] .pdv2-cs-gallery__grid { background: rgba(13,34,32,0.12); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-cs-gallery__cell { background: #fff; }
[data-theme=light] .pdv2-gallery-section { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-gallery-grid   { background: rgba(13,34,32,0.12); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-gallery-cell   { background: #ffffff; }
[data-theme=light] .pdv2-gallery-cell__img { background: #ffffff; }
[data-theme=light] .pdv2-gallery-cell__caption { color: rgba(13,34,32,0.72); }
[data-theme=light] .pdv2-video-section  { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-video-empty    { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-video-empty p  { color: rgba(13,34,32,0.72); }
[data-theme=light] .pdv2-video-empty p strong { color: #0d2220; }
[data-theme=light] .pdv2-vlist-item     { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-vlist-item:hover { background: #ffffff; }
[data-theme=light] .pdv2-vlist-title    { color: rgba(13,34,32,0.78); }
[data-theme=light] .pdv2-reviews__bg::before { background: var(--brand-teal); }
[data-theme=light] .pdv2-review-card    { background: #fff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-review-card__text { color: rgba(13,34,32,0.65); }
[data-theme=light] .pdv2-reviews__h2   { color: #0d2220; }
[data-theme=light] .pdv2-review-nav__btn { color: rgba(13,34,32,0.7); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-review-card__name { color: #0d2220; }
[data-theme=light] .pdv2-related        { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-related-grid   { background: rgba(13,34,32,0.12); border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-rel-card       { background: #fff; }
[data-theme=light] .pdv2-rel-card:hover { background: #ffffff; }
[data-theme=light] .pdv2-rel-card__img  { background: #ffffff; border-color: rgba(13,34,32,0.12); }
[data-theme=light] .pdv2-rel-card__name { color: #0d2220; }
[data-theme=light] .pdv2-section-head h2 { color: #0d2220; }
⋮----
/* ── RESPONSIVE ── */
⋮----
.pdv2-hero__cols { grid-template-columns: 1fr; }
.pdv2-video-layout { grid-template-columns: 1fr; }
.pdv2-video-list { flex-direction: row; overflow-x: auto; }
.pdv2-vlist-item { flex-shrink: 0; width: 220px; }
.pdv2-reviews__inner { grid-template-columns: 1fr; }
.pdv2-reviews__bg::before { display: none; }
.pdv2-reviews { background: var(--bg-surface); }
.pdv2-rating-block { color: var(--ink); padding: 0; }
.pdv2-rating-block__score { color: var(--ink); }
.pdv2-rating-block__label { color: var(--ink); }
.pdv2-rating-block__sub { color: var(--ink-35); }
.pdv2-rating-bar { color: var(--ink-60); }
.pdv2-rating-bar__fill { background: var(--brand-teal); }
.pdv2-cta-band { grid-template-columns: 1fr; }
.pdv2-cta-band__img-side { min-height: 200px; }
⋮----
.pdv2-related-grid { grid-template-columns: 1fr 1fr; }
.pdv2-review-card { padding: 1.25rem; }
.pdv2-cta-band__form-side { padding: 2rem 1.25rem; }
.pdv2-gallery-grid { grid-template-columns: 1fr 1fr; }
⋮----
.pdv2-related-grid { grid-template-columns: 1fr; }
.pdv2-panel__ctas { flex-direction: column; align-items: stretch; }
.pdv2-gallery-grid { grid-template-columns: 1fr; }
⋮----
/* ════════════════════════════════════════
   FLOATING CONTACT STACK (product page only)
════════════════════════════════════════ */
.pdv2-float {
.pdv2-float__icn {
.pdv2-float__icn:hover { transform: translateY(-2px) scale(1.05); color: var(--brand-teal); border-color: var(--brand-teal); }
.pdv2-float__icn--whatsapp { background: #25d366; color: #fff; border-color: #25d366; }
.pdv2-float__icn--whatsapp:hover { color: #fff; border-color: #25d366; }
.pdv2-float__icn--quote { background: var(--brand-teal); color: #04211e; border-color: var(--brand-teal); }
.pdv2-float__icn--quote:hover { color: #04211e; }
⋮----
/* On mobile the bottom nav + chat widget already cover quick contact —
   hide the floating stack so it doesn't collide with them */
⋮----
/* Move to left side on mobile to avoid chat widget collision */
⋮----
/* ── Sonner toasts — matched to .ci-error / .ci-review-card surface language ── */
.cx-toast {
.cx-toast[data-type="success"] { border-color: rgba(43,191,179,0.35); }
.cx-toast[data-type="error"]   { border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); }
.cx-toast__icon { flex-shrink: 0; margin-top: 0.15rem; color: var(--brand-teal); }
.cx-toast[data-type="error"] .cx-toast__icon { color: #fca5a5; }
.cx-toast__title { font-size: 0.85rem; font-weight: 600; color: var(--ink); line-height: 1.4; }
.cx-toast__desc  { font-size: 0.78rem; color: var(--ink-60); line-height: 1.5; margin-top: 0.15rem; }
[data-theme="light"] .cx-toast { background: #ffffff; border-color: rgba(13,34,32,0.12); box-shadow: 0 12px 32px rgba(13,34,32,0.12); }
[data-theme="light"] .cx-toast[data-type="error"] { background: rgba(239,68,68,0.06); }
````
