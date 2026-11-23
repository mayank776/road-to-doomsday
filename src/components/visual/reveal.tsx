"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/** Giant display headline whose characters rise into place when scrolled into view. */
export function SplitHeadline({
  children,
  className = "",
  as: Tag = "h2",
  immediate = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  immediate?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const split = SplitText.create(ref.current!, { type: "lines,chars", linesClass: "split-line", mask: "lines" });
      gsap.from(split.chars, {
        yPercent: 110,
        rotate: 6,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.025,
        delay: immediate ? 0.2 : 0,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 85%" },
      });
      return () => split.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Fades and lifts children into view, staggered. */
export function Reveal({ children, className = "", stagger = 0.08 }: { children: React.ReactNode; className?: string; stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(ref.current!.children, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
