import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { staticPageMetadata } from "@/lib/pageSeo";
import AboutClient from "./AboutClient";

import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  return staticPageMetadata("/about", params.locale);
}

export default async function AboutPage() {
  // the root layout's provider omits the "about" namespace (see layout.tsx)
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <AboutClient />
    </NextIntlClientProvider>
  );
}
