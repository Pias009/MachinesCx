"use client";
import { useEffect, useRef, useState, type ComponentType } from "react";

interface Props<P extends object> {
  /** The dynamic import call itself — e.g. `() => import("@/components/TrustSection")`.
   *  Must NOT be passed through `next/dynamic` first: in the App Router,
   *  `next/dynamic(..., { ssr: false })` still emits the chunk as an eager
   *  `<script async>` tag in the server-rendered HTML (the browser's HTML
   *  parser preloads it immediately), so it only defers the *render*, not
   *  the *fetch*. Calling `import()` ourselves, only once this component is
   *  actually near the viewport, is what defers the fetch itself. */
  loader: () => Promise<{ default: ComponentType<P> }>;
  props?: P;
  /** Extra margin added to the viewport root — start loading this far
   *  before the placeholder actually scrolls into view. */
  rootMargin?: string;
}

export default function LazyMount<P extends object>({ loader, props, rootMargin = "600px 0px" }: Props<P>) {
  const ref = useRef<HTMLDivElement>(null);
  const [Comp, setComp] = useState<ComponentType<P> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          obs.disconnect();
          loader().then(mod => setComp(() => mod.default));
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin]);

  if (Comp) return <Comp {...(props as P)} />;
  return <div ref={ref} aria-hidden="true" />;
}
