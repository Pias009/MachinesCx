import { staticPageMetadata } from "@/lib/pageSeo";
import { FAQ_ITEMS } from "@/lib/faqData";
import JsonLd from "@/components/JsonLd";
import FaqClient from "./FaqClient";

import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  return staticPageMetadata("/faq", params.locale);
}

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
      <FaqClient />
    </>
  );
}
