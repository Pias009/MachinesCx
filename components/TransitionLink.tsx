"use client";

import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

/* Locale-aware — automatically prefixes href with the current locale
   (e.g. /products → /ar/products) so every existing call site gets
   correct routing without change. */
export default function TransitionLink({ href, children, ...rest }: Props) {
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
