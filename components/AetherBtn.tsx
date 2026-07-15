"use client";
import type { ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

export default function AetherBtn({ children, style }: Props) {
  return (
    <span className="aether-btn" style={style}>
      {children}
    </span>
  );
}
