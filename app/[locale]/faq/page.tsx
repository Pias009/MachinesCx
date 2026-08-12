import { pageMetadata } from "@/lib/seo";
import { FAQ_ITEMS } from "@/lib/faqData";
import JsonLd from "@/components/JsonLd";
import FaqClient from "./FaqClient";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return pageMetadata({
    locale: params.locale,
    path: "/faq",
    title: "FAQ — Wenzhou Ashal Innomach Technology",
    description: "Answers to common questions about ordering, lead times, customization, and support for our blown-film, bag-making, recycling, and printing machinery.",
  });
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
