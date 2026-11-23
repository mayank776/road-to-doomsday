"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pins its section and converts vertical scroll into horizontal travel along the track.
 * Server-rendered children keep the heavy SVG art out of the client bundle.
 */
export function HorizontalPin({ children, header, ticks }: { children: React.ReactNode; header: React.ReactNode; ticks: string[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const distance = () => track.current!.scrollWidth - window.innerWidth;
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (s) => gsap.set(bar.current, { scaleX: s.progress }),
          },
        });
        // Each panel's art drifts against the travel direction for depth.
        gsap.utils.toArray<HTMLElement>(".road-art").forEach((el) => {
          gsap.fromTo(el, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: el.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  // The outer div is React-owned: ScrollTrigger inserts its pin-spacer *inside* it, so on
  // unmount React removes this wrapper instead of a <section> that GSAP has re-parented.
  return (
    <div>
    <section ref={section} id="road" className="relative flex h-svh flex-col overflow-hidden motion-reduce:h-auto">
      <div className="px-4 pt-20 sm:px-8">{header}</div>
      <div ref={track} className="flex min-h-0 flex-1 items-stretch gap-4 px-4 py-6 will-change-transform sm:gap-6 sm:px-8 motion-reduce:flex-col motion-reduce:items-stretch">
        {children}
      </div>
      <div className="px-4 pb-6 sm:px-8 motion-reduce:hidden">
        <div className="relative h-px bg-line">
          <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-doom-bright" />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
          {ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}
