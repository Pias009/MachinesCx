"use client";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";

export default function InquiryButton({ slug, name }: { slug: string; name: string }) {
  const href = `/contact?machine=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
  return (
    <AetherBtn>
      <TransitionLink href={href}>Request a quote →</TransitionLink>
    </AetherBtn>
  );
}
