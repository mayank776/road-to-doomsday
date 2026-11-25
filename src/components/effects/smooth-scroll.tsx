"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

/** The one Lenis instance, so other components can scroll through it (see scrollToTop). */
let lenis: Lenis | null = null;

/**
 * Scroll to the top of the page. Goes through Lenis when it's running:
 * a plain window.scrollTo would be undone by Lenis easing back to where it was.
 */
export function scrollToTop(smooth = true) {
  if (lenis) lenis.scrollTo(0, { immediate: !smooth, force: true });
  else window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
}

/**
 * Lenis smooth scrolling (mouse wheel only; touch keeps native scrolling), driven by GSAP's ticker so ScrollTrigger stays in sync.
 * Also publishes the scroll speed as the CSS variable --scroll-skew (see .skew-on-scroll in globals.css).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    // scroll speed → a CSS variable, so elements with .skew-on-scroll lean as you scroll fast
    const root = document.documentElement;
    let skew = 0;
    lenis.on("scroll", (l: Lenis) => {
      const target = Math.max(-5, Math.min(5, l.velocity * 0.12));
      skew += (target - skew) * 0.25;
      root.style.setProperty("--scroll-skew", `${skew.toFixed(2)}deg`);
    });
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // every new page starts at the top
  useEffect(() => {
    scrollToTop(false);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
