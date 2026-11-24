"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Media } from "@/lib/types";
import { MediaImage } from "@/components/media/media-image";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IronSigil = dynamic(() => import("@/components/three/iron-sigil"), { ssr: false });

export type DossierStat = { label: string; value: string; tone: "official" | "canon" | "supported" | "theory" | "comics" | "muted" };
export type Lane = { label: string; count: number; color: string };

const TONE: Record<DossierStat["tone"], string> = {
  official: "text-official",
  canon: "text-canon",
  supported: "text-supported",
  theory: "text-theory",
  comics: "text-comics",
  muted: "text-white/40",
};

export function DoomSection({ stats, lanes, backdrop }: { stats: DossierStat[]; lanes: Lane[]; backdrop?: Media }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const max = Math.max(...lanes.map((l) => l.count));

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (s) => (progress.current = s.progress),
      });
      gsap.fromTo(".doom-word", { xPercent: 15 }, { xPercent: -25, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(".lane-bar", { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.out", stagger: 0.15, scrollTrigger: { trigger: ".lanes", start: "top 85%" } });
      gsap.fromTo(".stat", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".stats", start: "top 85%" } });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden border-y border-line bg-[radial-gradient(circle_at_50%_40%,#0c2417,#040605_65%)]">
      {backdrop && (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <MediaImage m={backdrop} sizes="100vw" className="opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,transparent_20%,#040605cc_90%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#040605] via-transparent via-60% to-[#040605]" />
        </div>
      )}
      <div className="doom-word pointer-events-none absolute left-0 top-[8%] whitespace-nowrap font-display text-[34vw] uppercase leading-none text-outline-doom opacity-30 select-none" aria-hidden>
        Victor von Doom
      </div>

      <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-8 px-4 py-24 sm:px-8 lg:grid-cols-2">
        <div className="relative order-2 aspect-square w-full lg:order-1">
          <IronSigil progress={progress} />
          <div className="pointer-events-none absolute inset-6 hud" />
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright">Dossier · The central threat</p>
          <h2 className="mt-3 font-display text-7xl uppercase leading-[0.85] sm:text-9xl">
            Doctor
            <br />
            <span className="text-doom-bright">Doom</span>
          </h2>

          <dl className="stats mt-10 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line">
            {stats.map((s) => (
              <div key={s.label} className="stat bg-ink/90 p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{s.label}</dt>
                <dd className={`mt-1 font-display text-3xl uppercase sm:text-4xl ${TONE[s.tone]}`}>{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="lanes mt-10 space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">What we know, by source</p>
            {lanes.map((l) => (
              <div key={l.label}>
                <div className="mb-1 flex justify-between font-mono text-[11px] uppercase tracking-wider">
                  <span>{l.label}</span>
                  <span style={{ color: l.color }}>{l.count}</span>
                </div>
                <div className="h-2 bg-line">
                  <div className="lane-bar h-full origin-left" style={{ width: `${(l.count / max) * 100}%`, background: l.color, boxShadow: `0 0 18px ${l.color}` }} />
                </div>
              </div>
            ))}
          </div>

          <Link href="/characters/doctor-doom" className="mt-10 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-doom-bright hover:text-white">
            Open the full dossier →
          </Link>
        </div>
      </div>
    </section>
  );
}
