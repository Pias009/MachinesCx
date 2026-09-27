import { staticPageMetadata } from "@/lib/pageSeo";
import InquiriesClient from "./InquiriesClient";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return staticPageMetadata("/inquiries", params.locale);
}

export default function InquiriesPage() {
  return <InquiriesClient />;
}
