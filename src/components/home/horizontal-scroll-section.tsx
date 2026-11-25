"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pins its section and converts vertical scroll into horizontal travel along the track (768px and up).
 * On phones the track is an ordinary horizontal scroller you swipe, snapping panel by panel.
 * Server-rendered children keep the heavy SVG art out of the client bundle.
 */
export function HorizontalScrollSection({ children, header, ticks }: { children: React.ReactNode; header: React.ReactNode; ticks: string[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // pinned travel on tablets and up; phones get a native swipeable row instead (see the track classes)
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
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
    <section ref={section} id="road" className="relative flex flex-col overflow-hidden md:h-svh motion-reduce:h-auto">
      <div className="px-4 pt-20 sm:px-8">{header}</div>
      <p className="px-4 pt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/45 md:hidden" aria-hidden>
        Swipe →
      </p>
      <div
        ref={track}
        className="flex min-h-0 flex-1 snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-4 py-6 [scrollbar-width:none] sm:gap-6 sm:px-8 md:snap-none md:overflow-visible md:will-change-transform motion-reduce:flex-col motion-reduce:items-stretch"
      >
        {children}
      </div>
      <div className="hidden px-4 pb-6 sm:px-8 md:block motion-reduce:hidden">
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
