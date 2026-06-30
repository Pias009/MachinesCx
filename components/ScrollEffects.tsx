"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollEffects() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const ctx = gsap.context(() => {
      gsap.to(".pipeline .pipe", {
        scrollTrigger: {
          trigger: ".pipeline",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.set(".pipeline .pipe", { y: 30, opacity: 0 });
    });

    return () => ctx.revert();
  }, []);

  return <div ref={heroRef} />;
}
