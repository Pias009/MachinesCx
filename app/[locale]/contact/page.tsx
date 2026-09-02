import { pageMetadata } from "@/lib/seo";
import { SITE_URL, BRAND } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import ContactClient from "./ContactClient";

import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  return pageMetadata({
    locale: params.locale,
    path: "/contact",
    title: "Contact — Wenzhou Ashal Innomech Technology",
    description: "Reach our engineering team directly by phone, WhatsApp, or email, or send an inquiry — based in Wenzhou, Zhejiang, China, with a 24-hour response time.",
  });
}

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: BRAND,
          legalName: "Wenzhou Ashal Innomach Technology Co., Ltd.",
          url: SITE_URL,
          image: `${SITE_URL}/logo.jpeg`,
          telephone: "+86 159 8877 5831",
          email: "ashal@ashalinnomech.com",
          priceRange: "$$$$",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Wenzhou",
            addressRegion: "Zhejiang",
            addressCountry: "CN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "27.9943",
            longitude: "120.6994",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "08:00",
              closes: "18:00",
            },
          ],
        }}
      />
      <ContactClient />
    </>
  );
}
