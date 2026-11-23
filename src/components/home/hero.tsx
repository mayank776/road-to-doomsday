"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SplitHeadline } from "@/components/visual/reveal";
import { Countdown } from "@/components/visual/countdown";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MultiverseScene = dynamic(() => import("@/components/three/multiverse-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f2a1b,#040605_60%)]" />,
});

export function Hero({ release }: { release: string }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (s) => (progress.current = s.progress),
      });
      gsap.to(".hero-copy", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true },
      });
      gsap.from(".hero-fade", { opacity: 0, y: 20, duration: 1.2, delay: 0.9, stagger: 0.12, ease: "expo.out" });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[140svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <MultiverseScene progress={progress} />

        <div className="hero-copy pointer-events-none absolute inset-0 flex flex-col justify-end px-4 pb-10 sm:px-8 sm:pb-14">
          <div className="hero-fade mb-6 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright">
            <span>Case file 001</span>
            <span className="text-white/50">Earth-616 ↔ Earth-828</span>
          </div>
          <SplitHeadline as="h1" immediate className="font-display text-[17vw] uppercase leading-[0.82] tracking-tight sm:text-[13vw]">
            Everything is connected
          </SplitHeadline>

          <div className="hero-fade mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Countdown target={release} />
            <Link
              href="#road"
              className="pointer-events-auto group inline-flex items-center gap-3 self-start rounded-full border border-doom-bright/60 bg-doom-bright/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-doom-bright backdrop-blur transition hover:bg-doom-bright hover:text-ink"
            >
              Start the investigation
              <span className="transition group-hover:translate-y-1">↓</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
