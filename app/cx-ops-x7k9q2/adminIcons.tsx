import {
  Home, Inbox, Sparkles, LayoutGrid, Wrench, Printer,
  ShoppingBag, Newspaper, Factory, Recycle, Film, Package,
  type LucideIcon,
} from "lucide-react";

/** CMS section slug → icon, mirrors SECTION_SCHEMAS in lib/cmsSchemas.ts */
export const SECTION_ICON: Record<string, LucideIcon> = {
  "products": Factory,
  "home-hero": Sparkles,
  "machine-catalog": LayoutGrid,
  "production-line": Wrench,
  "flexo-strip": Printer,
  "printing-showcase": Film,
  "scrollhome-bags": ShoppingBag,
  "news": Newspaper,
};

/** products collection category slug → icon, mirrors CATEGORY_ICON in Editor.tsx */
export const CATEGORY_ICON: Record<string, LucideIcon> = {
  "film-blowing": Film,
  "bag-making": ShoppingBag,
  "recycling": Recycle,
  "printing": Printer,
};

export const NAV_ICON = { Home, Inbox } as const;

export function SectionIcon({ slug, ...props }: { slug: string } & React.ComponentProps<LucideIcon>) {
  const Icon = SECTION_ICON[slug] ?? Package;
  return <Icon {...props} />;
}
