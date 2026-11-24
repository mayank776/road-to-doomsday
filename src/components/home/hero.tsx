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

const EarthsScene = dynamic(() => import("@/components/three/earths-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,#141a17,#040605_60%)]" />,
});

export type HeroEarth = { designation: string; name: string; color: string };

export function Hero({ release, stats, earths }: { release: string; stats: { label: string; value: number }[]; earths: HeroEarth[] }) {
  const releaseLabel = new Date(release + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
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
      gsap.fromTo(".hero-fade", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.9, stagger: 0.12, ease: "expo.out" });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[140svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <EarthsScene earths={earths} progress={progress} />

        {/* Readability: darken behind the copy without hiding the scene */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink via-ink/70 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/3 bg-gradient-to-r from-ink/80 to-transparent lg:block" aria-hidden />

        <div className="hero-copy pointer-events-none absolute inset-0 flex flex-col px-4 pb-8 pt-20 sm:px-8 sm:pb-10 sm:pt-24">
          {/* top HUD row */}
          <div className="hero-fade flex items-start justify-between gap-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] sm:text-[11px]">
              <p className="text-doom-bright">Case file 001 · Multiverse</p>
              <p className="mt-1 text-white/40">{earths.map((e) => e.designation).join(" · ")}</p>
            </div>
            <dl className="hidden gap-8 text-right sm:flex">
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-4xl leading-none">{s.value}</dd>
                  <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-auto">
            <SplitHeadline
              as="h1"
              immediate
              className="max-w-[11ch] font-display text-[18vw] uppercase leading-[0.84] tracking-tight sm:text-[12vw] lg:text-[9.5vw]"
            >
              Worlds collide.
            </SplitHeadline>

            <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="hero-fade max-w-md">
                <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                  Heroes from three universes. One enemy. Explore how the MCU reached{" "}
                  <span className="text-white">Avengers: Doomsday</span>, and what&apos;s actually confirmed.
                </p>
                <Link
                  href="#universes"
                  className="pointer-events-auto group mt-6 inline-flex items-center gap-3 rounded-full bg-doom-bright px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-ink transition hover:bg-white"
                >
                  Explore the universes
                  <span className="transition group-hover:translate-y-1">↓</span>
                </Link>
              </div>

              <div className="hero-fade">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Until Doomsday · {releaseLabel}
                </p>
                <Countdown target={release} />
              </div>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="hero-fade pointer-events-none absolute bottom-0 left-1/2 hidden h-16 w-px -translate-x-1/2 overflow-hidden bg-white/10 lg:block" aria-hidden>
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-doom-bright" />
        </div>
      </div>
    </section>
  );
}
