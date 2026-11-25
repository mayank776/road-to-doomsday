"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { EvidenceStatus, Media } from "@/lib/types";
import { MediaImage } from "@/components/media/media-image";
import { EvidenceBadge } from "@/components/evidence-labels";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type IncursionStep = { title: string; text: string; status: EvidenceStatus; citation: string };

const A = "#ff6a3d";
const B = "#4da3ff";

// Debris from the destroyed universe: fixed, so server and client agree.
const SHARDS = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2;
  const d = 140 + ((i * 53) % 90);
  return { dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d), r: 2 + (i % 4) };
});

export function IncursionStory({ steps, backdrop, sky }: { steps: IncursionStep[]; backdrop?: Media; sky?: Media }) {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const last = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // the pinned, scroll-driven story runs on tablets and up; phones read the steps as a list
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: 0.6,
            onUpdate: (s) => {
              const i = Math.min(steps.length - 1, Math.floor(s.progress * steps.length * 0.999));
              if (i !== last.current) {
                last.current = i;
                setStep(i);
              }
            },
          },
        });
        // 0 → 1: branches fade, two universes appear far apart
        tl.to(".inc-branches", { opacity: 0, duration: 1 }, 0.6)
          .fromTo(".inc-a", { x: -140, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, 0.8)
          .fromTo(".inc-b", { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, 0.8)
          // 1 → 2: they drift into contact
          .to(".inc-a", { x: 70, duration: 1.2 }, 2)
          .to(".inc-b", { x: -70, duration: 1.2 }, 2)
          .to(".inc-lens", { opacity: 0.9, duration: 0.6 }, 2.8)
          .to(".inc-crack", { strokeDashoffset: 0, duration: 0.7 }, 3)
          // 2 → 3: one universe is destroyed
          .to(".inc-b-body", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", duration: 0.8 }, 3.9)
          .to(".inc-lens", { opacity: 0, duration: 0.4 }, 3.9)
          .fromTo(".inc-shard", { x: 0, y: 0, opacity: 1 }, { x: (i) => SHARDS[i].dx, y: (i) => SHARDS[i].dy, opacity: 0, duration: 1.2, ease: "power2.out" }, 3.9)
          // 3 → 4: our sky — two worlds over Earth
          .to(".inc-a", { opacity: 0, duration: 0.6 }, 5.2)
          .to(".inc-crack", { opacity: 0, duration: 0.4 }, 5.2)
          .fromTo(".inc-sky", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, 5.4)
          .fromTo(".inc-photo", { opacity: 0, scale: 1.08 }, { opacity: 0.7, scale: 1, duration: 1.2 }, 5.2)
          .to({}, { duration: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const s = steps[step];

  return (
    // React-owned wrapper: ScrollTrigger re-parents the pinned section inside it.
    <div>
      <section ref={root} className="relative isolate flex flex-col overflow-hidden border-y border-line md:h-svh motion-reduce:h-auto">
        {/* deep space throughout; the real "two Earths in our sky" image arrives on the last step */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          {backdrop && <MediaImage m={backdrop} sizes="100vw" className="opacity-25" />}
          {sky && (
            <div className="inc-photo absolute inset-0 opacity-40 md:opacity-0">
              <MediaImage m={sky} sizes="100vw" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/40 to-ink" />
        </div>
        <div className="px-4 pt-20 sm:px-8 sm:pt-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright">02 · Why worlds collide</p>
          <h2 className="mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">Incursions</h2>
        </div>

        <div className="grid min-h-0 flex-1 items-center gap-6 px-4 pb-8 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
          <svg viewBox="0 0 800 500" className="hidden h-full max-h-[56svh] w-full md:block motion-reduce:hidden" aria-hidden>
            <defs>
              <radialGradient id="inc-ga" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor={A} stopOpacity="0.55" />
                <stop offset="100%" stopColor={A} stopOpacity="0.04" />
              </radialGradient>
              <radialGradient id="inc-gb" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor={B} stopOpacity="0.55" />
                <stop offset="100%" stopColor={B} stopOpacity="0.04" />
              </radialGradient>
              <clipPath id="inc-clip">
                <circle cx="330" cy="250" r="150" />
              </clipPath>
            </defs>

            {/* step 0: the timeline branching into a multiverse */}
            <g className="inc-branches" stroke="#7dffb0" strokeLinecap="round" fill="none">
              <path d="M400 480 L400 330" strokeWidth="4" />
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <path d={`M400 330 Q ${400 + sd * 40} 280 ${400 + sd * 120} 240`} strokeWidth="3" />
                  <path d={`M${400 + sd * 120} 240 Q ${400 + sd * 150} 190 ${400 + sd * 230} 150`} strokeWidth="2" opacity="0.8" />
                  <path d={`M${400 + sd * 120} 240 Q ${400 + sd * 110} 170 ${400 + sd * 90} 100`} strokeWidth="2" opacity="0.8" />
                  <path d={`M${400 + sd * 230} 150 L ${400 + sd * 300} 90`} strokeWidth="1.2" opacity="0.6" />
                  <path d={`M${400 + sd * 230} 150 L ${400 + sd * 330} 170`} strokeWidth="1.2" opacity="0.6" />
                  <path d={`M${400 + sd * 90} 100 L ${400 + sd * 60} 40`} strokeWidth="1.2" opacity="0.6" />
                </g>
              ))}
              <path d="M400 330 L400 60" strokeWidth="2" opacity="0.6" />
            </g>

            {/* universe A survives */}
            <g className="inc-a" opacity="0">
              <circle cx="330" cy="250" r="150" fill="url(#inc-ga)" stroke={A} strokeWidth="2" />
              {[-60, 0, 60].map((k) => (
                <ellipse key={k} cx="330" cy={250 + k} rx={Math.round(Math.sqrt(150 * 150 - k * k))} ry="16" fill="none" stroke={A} strokeOpacity="0.25" />
              ))}
            </g>

            {/* universe B is destroyed */}
            <g className="inc-b" opacity="0">
              <g className="inc-b-body">
                <circle cx="470" cy="250" r="150" fill="url(#inc-gb)" stroke={B} strokeWidth="2" />
                {[-60, 0, 60].map((k) => (
                  <ellipse key={k} cx="470" cy={250 + k} rx={Math.round(Math.sqrt(150 * 150 - k * k))} ry="16" fill="none" stroke={B} strokeOpacity="0.25" />
                ))}
              </g>
              {SHARDS.map((sh, i) => (
                <circle key={i} className="inc-shard" cx="470" cy="250" r={sh.r} fill={B} opacity="0" />
              ))}
            </g>

            {/* the zone where both universes overlap */}
            <g clipPath="url(#inc-clip)">
              <circle className="inc-lens" cx="400" cy="250" r="150" fill="#ffffff" opacity="0" style={{ mixBlendMode: "screen" }} />
            </g>
            <path
              className="inc-crack"
              d="M400 110 L392 170 L410 215 L388 260 L408 310 L395 390"
              stroke="#ffffff"
              strokeWidth="3"
              fill="none"
              strokeDasharray="320"
              strokeDashoffset="320"
            />

            {/* step 4: the trailer image — two worlds over Earth */}
            <g className="inc-sky" opacity="0">
              <circle cx="300" cy="150" r="90" fill="url(#inc-gb)" stroke={B} strokeOpacity="0.6" />
              <circle cx="520" cy="120" r="70" fill="url(#inc-ga)" stroke="#ffd23f" strokeOpacity="0.6" />
              <path d="M-20 500 Q 400 330 820 500" fill="#0b120e" stroke="#7dffb0" strokeOpacity="0.6" strokeWidth="2" />
              {Array.from({ length: 14 }, (_, i) => (
                <rect key={i} x={120 + i * 42} y={448 - ((i * 37) % 50)} width="14" height={52 + ((i * 37) % 50)} fill="#0b120e" stroke="#7dffb0" strokeOpacity="0.25" />
              ))}
            </g>
          </svg>

          {/* phones (and reduced motion): every step, in order */}
          <ol className="space-y-6 py-4 md:hidden motion-reduce:block">
            {steps.map((st, i) => (
              <li key={st.title} className="border-l-2 border-doom-bright/50 pl-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-faint">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-3xl uppercase leading-none">{st.title}</h3>
                <p className="mt-2 text-text/85">{st.text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <EvidenceBadge status={st.status} short />
                  <span className="font-mono text-[10px] text-faint">{st.citation}</span>
                </div>
              </li>
            ))}
          </ol>

          <div className="hidden min-h-[220px] md:block motion-reduce:hidden">
            <div className="mb-4 flex gap-1.5" aria-hidden>
              {steps.map((_, i) => (
                <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-doom-bright" : "bg-line"}`} />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                aria-live="polite"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
                  Step {step + 1} / {steps.length}
                </p>
                <h3 className="mt-2 font-display text-4xl uppercase leading-none sm:text-5xl">{s.title}</h3>
                <p className="mt-3 text-lg text-text/85">{s.text}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <EvidenceBadge status={s.status} />
                  <span className="font-mono text-[10px] text-faint">{s.citation}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
