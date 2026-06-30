"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

export default function TransitionLink({ href, children, ...rest }: Props) {
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
