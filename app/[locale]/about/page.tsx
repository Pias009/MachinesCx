import { pageMetadata } from "@/lib/seo";
import AboutClient from "./AboutClient";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return pageMetadata({
    locale: params.locale,
    path: "/about",
    title: "About — Wenzhou Ashal Innomach Technology",
    description: "Founded in 2008, we design and manufacture blown-film lines, bag-making converters, and recycling systems from a 12,000 m² Wenzhou facility, with 18+ machine families running across six continents.",
  });
}

export default function AboutPage() {
  return <AboutClient />;
}
