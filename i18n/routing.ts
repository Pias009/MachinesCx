import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar", "hi"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/* Arabic reads right-to-left — every other supported locale is LTR */
export const rtlLocales: Locale[] = ["ar"];

export const routing = defineRouting({
  locales,
  defaultLocale,
  // english stays un-prefixed ("/products") so existing links/SEO don't break;
  // other locales get a prefix ("/ar/products", "/hi/products")
  localePrefix: "as-needed",
});
