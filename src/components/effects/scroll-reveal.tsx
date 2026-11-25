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
      gsap.fromTo(split.chars, { yPercent: 110, rotate: 6 }, {
        yPercent: 0,
        rotate: 0,
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
      // fromTo (not from): explicit end values, so a re-run can never "end" at opacity 0
      gsap.fromTo(ref.current!.children, { y: 60, opacity: 0 }, {
        y: 0,
        opacity: 1,
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

/**
 * Each child is uncovered by a mask wiping upward (and settles from a slight
 * zoom) as it scrolls into view, one after another. Good for image tiles.
 */
export function MaskReveal({ children, className = "", stagger = 0.09 }: { children: React.ReactNode; className?: string; stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ref.current!.children,
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.06 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger,
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        },
      );
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
