import { pageMetadata } from "@/lib/seo";
import { SITE_URL, BRAND } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import ContactClient from "./ContactClient";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return pageMetadata({
    locale: params.locale,
    path: "/contact",
    title: "Contact — Wenzhou Ashal Innomach Technology",
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
          url: SITE_URL,
          image: `${SITE_URL}/logo.jpeg`,
          telephone: "+86 159 8877 5831",
          email: "ashal@ashalinnomech.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Wenzhou",
            addressRegion: "Zhejiang",
            addressCountry: "CN",
          },
        }}
      />
      <ContactClient />
    </>
  );
}
