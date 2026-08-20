import { pageMetadata } from "@/lib/seo";
import LegalClient from "./LegalClient";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  return pageMetadata({
    locale: params.locale,
    path: "/legal",
    title: "Legal & Privacy — Wenzhou Ashal Innomech Technology",
    description: "Terms of service, privacy policy, data security protocols, and export compliance standards for Wenzhou Ashal Innomech Technology Co., Ltd.",
  });
}

export default function LegalPage() {
  return <LegalClient />;
}
