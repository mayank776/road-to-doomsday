"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { Media } from "@/lib/types";
import { MediaImage } from "@/components/media/media-image";
import { Countdown } from "@/components/effects/countdown";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export type HeroEarth = { designation: string; name: string; color: string };

const FRAME_MS = 6500;

/**
 * The landing: a cinematic cut between real frames, opened like a projector
 * (letterbox shutters part, the title rises), with the countdown, the three
 * Earths and the poster on hand. Scrolling pushes the copy away.
 */
export function LandingHero({
  release,
  stats,
  earths,
  slides,
  poster,
}: {
  release: string;
  stats: { label: string; value: number }[];
  earths: HeroEarth[];
  slides: Media[];
  poster?: Media;
}) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const releaseLabel = new Date(release + "T00:00:00Z")
    .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    .replaceAll("/", ".");

  // auto-advance; paused for reduced motion, hidden tabs, or when the visitor picks a frame
  useEffect(() => {
    if (!playing || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), FRAME_MS);
    return () => clearTimeout(id);
  }, [active, playing, slides.length]);

  useEffect(() => {
    const onVis = () => setPlaying(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const pick = useCallback((i: number) => {
    setActive(i);
    setPlaying(true);
  }, []);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const split = SplitText.create(".hero-title", { type: "chars", mask: "chars", charsClass: "hero-char" });
      if (!reduce) {
        gsap
          .timeline({ defaults: { ease: "expo.inOut" } })
          .fromTo(".shutter-top", { yPercent: 0 }, { yPercent: -100, duration: 1.6 }, 0.15)
          .fromTo(".shutter-bottom", { yPercent: 0 }, { yPercent: 100, duration: 1.6 }, 0.15)
          .fromTo(split.chars, { yPercent: 115 }, { yPercent: 0, duration: 1.3, stagger: 0.045, ease: "expo.out" }, 0.9)
          .fromTo(".hero-in", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: "expo.out" }, 1.25)
          .fromTo(".hero-poster", { opacity: 0, y: 60, rotate: 4 }, { opacity: 1, y: 0, rotate: -3, duration: 1.6, ease: "expo.out" }, 1.1);

        // scroll: copy drifts up and fades, the frame sinks back
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to(".hero-copy", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "70% top" } });
        gsap.to(".hero-stage", { scale: 1.08, yPercent: 12, ease: "none", scrollTrigger: st });
        gsap.to(".hero-poster-wrap", { yPercent: -30, ease: "none", scrollTrigger: st });
      } else {
        gsap.set([".shutter-top", ".shutter-bottom"], { display: "none" });
      }
      return () => split.revert();
    },
    { scope: root },
  );

  // a gentle parallax tilt on the poster, desktop pointers only
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = root.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(".hero-poster", { rotateY: x * 10, rotateX: -y * 8, x: x * 14, y: y * 10, duration: 1, ease: "power3.out", overwrite: "auto" });
    gsap.to(".hero-stage-inner", { x: -x * 18, y: -y * 12, duration: 1.4, ease: "power3.out", overwrite: "auto" });
  };

  const current = slides[active];

  return (
    <section
      ref={root}
      onPointerMove={onMove}
      className="relative isolate h-svh min-h-[620px] overflow-hidden bg-black"
      aria-label="Avengers: Doomsday, the road there"
    >
      {/* ── the frames ── */}
      <div className="hero-stage absolute inset-0 -z-10 origin-top">
        <div className="hero-stage-inner absolute -inset-6">
          {slides.map((m, i) => (
            <div
              key={m.id}
              className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${i === active ? "opacity-100" : "opacity-0"}`}
              aria-hidden={i !== active}
            >
              {/* remount the active frame's zoom so each cut starts its push-in fresh */}
              <div key={i === active ? `on-${active}` : "off"} className={`absolute inset-0 ${i === active ? "animate-[kenburns_9s_ease-out_forwards]" : ""}`}>
                <MediaImage m={m} sizes="100vw" priority={i === 0} />
              </div>
            </div>
          ))}
        </div>
        {/* grade: crush to ink at the edges, a doom-green cast, legible bottom-left */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_40%,transparent_25%,rgba(4,6,5,0.35)_65%,rgba(4,6,5,0.9)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent sm:via-ink/20" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="absolute inset-0 bg-[#0f3d22] opacity-20 mix-blend-color" />
        {/* scanlines */}
        <div className="absolute inset-0 opacity-[0.07] [background:repeating-linear-gradient(0deg,#000_0px,#000_1px,transparent_1px,transparent_3px)]" />
      </div>

      {/* ── projector shutters, opened on load ── */}
      <div className="shutter-top pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 bg-black" aria-hidden />
      <div className="shutter-bottom pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1/2 bg-black" aria-hidden />

      {/* ── poster, desktop ── */}
      {poster && (
        <div className="hero-poster-wrap pointer-events-none absolute right-[5vw] top-1/2 hidden -translate-y-[54%] [perspective:1200px] xl:block">
          <div className="hero-poster relative aspect-[var(--ar)] h-[62svh] max-h-[640px] border border-white/15 shadow-[0_40px_120px_-20px_rgba(61,255,143,0.35)]" style={{ "--ar": `${poster.width} / ${poster.height}` } as React.CSSProperties}>
            <MediaImage m={poster} sizes="28vw" priority />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10" />
          </div>
          <p className="hero-in mt-3 text-right font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Poster · {releaseLabel}</p>
        </div>
      )}

      {/* ── copy ── */}
      <div className="hero-copy relative flex h-full flex-col px-4 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-24">
        <div className="hero-in flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] sm:text-[11px]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-doom-bright shadow-[0_0_12px_#7dffb0]" />
          <span className="text-doom-bright">Evidence-labelled guide</span>
          <span className="hidden text-white/40 sm:inline">In cinemas {releaseLabel}</span>
        </div>

        <div className="mt-auto max-w-[min(100%,62rem)]">
          {/* title lockup: a spaced-out franchise line over the one word that matters */}
          <p className="hero-in flex items-center gap-4 font-mono text-xs uppercase tracking-[0.6em] text-white/75 sm:text-sm" aria-hidden>
            <span className="h-px w-10 bg-doom-bright shadow-[0_0_8px_#7dffb0] sm:w-16" />
            Avengers
          </p>
          {/* sized to fit one line: DOOMSDAY is ~3.9em wide; on xl the poster's width is subtracted */}
          <h1
            aria-label="Avengers: Doomsday"
            className="hero-title mt-2 -ml-[0.04em] whitespace-nowrap font-display text-[min(calc((100vw_-_2rem)/4.1),15rem)] uppercase leading-[0.8] tracking-tight [filter:drop-shadow(0_0_50px_rgba(125,255,176,0.22))] sm:text-[min(calc((100vw_-_4rem)/4.1),15rem)] xl:text-[min(calc((95vw_-_min(41.85svh,432px)_-_6rem)/4.1),14rem)]"
          >
            Doomsday
          </h1>

          <div className="mt-5 grid max-w-3xl sm:mt-6 gap-x-8 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <p className="hero-in font-display text-3xl uppercase leading-[0.92] sm:text-4xl">
              Three universes.
              <br />
              <span className="text-doom-bright">One Doom.</span>
            </p>
            <p className="hero-in max-w-md text-[15px] leading-relaxed text-white/65 sm:border-l sm:border-white/15 sm:pl-8 sm:text-base">
              Every film, clue and cast member on the road to December 18, each marked by how sure we actually are:{" "}
              <span className="text-official">official</span>, <span className="text-trailer">trailer</span>,{" "}
              <span className="text-canon">canon</span>, <span className="text-supported">supported</span> or{" "}
              <span className="text-theory">theory</span>.
            </p>
          </div>

          <div className="hero-in mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
            <Link
              href="#universes"
              className="group inline-flex items-center gap-3 rounded-full bg-doom-bright px-6 py-3.5 font-mono text-xs uppercase tracking-[0.25em] text-ink shadow-[0_0_40px_-8px_#7dffb0] transition hover:bg-white"
            >
              Explore the multiverse
              <span className="transition group-hover:translate-y-0.5">↓</span>
            </Link>
            <Link
              href="/trailer"
              className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/30 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.25em] backdrop-blur transition hover:border-white hover:bg-white hover:text-ink"
            >
              <span aria-hidden>▶</span> The trailer
            </Link>
          </div>
        </div>

        {/* ── bottom console ── */}
        <div className="hero-in mt-6 grid gap-4 border-t border-white/10 pt-4 sm:mt-8 sm:gap-5 sm:pt-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-end md:gap-10">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">Until Doomsday</p>
            <Countdown target={release} />
          </div>

          <div className="flex min-w-0 flex-col gap-4 md:items-end">
          <div className="hidden flex-wrap gap-2 sm:flex md:justify-end">
            {earths.map((e) => (
              <Link
                key={e.designation}
                href="/universes"
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur transition hover:border-white/40"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: e.color, boxShadow: `0 0 10px ${e.color}` }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: e.color }}>
                  {e.designation}
                </span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 2xl:inline">{e.name}</span>
              </Link>
            ))}
            <dl className="ml-1 hidden items-center gap-4 pl-2 xl:flex">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <dd className="font-display text-2xl leading-none">{s.value}</dd>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* frame index: what you're looking at, and a way to step through */}
          {current && (
            <div className="w-full min-w-0 md:max-w-md">
              <div className="flex gap-1.5" role="tablist" aria-label="Frames">
                {slides.map((m, i) => (
                  <button
                    key={m.id}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Frame ${i + 1}: ${m.alt}`}
                    onClick={() => pick(i)}
                    className="relative h-6 flex-1 cursor-pointer"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
                      {i < active && <span className="absolute inset-0 bg-white/60" />}
                      {i === active && (
                        <span
                          key={`bar-${active}-${playing}`}
                          className="absolute inset-0 origin-left bg-doom-bright"
                          style={{ animation: playing ? `fillbar ${FRAME_MS}ms linear forwards` : undefined }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-white/45" aria-live="polite">
                <span className="text-white/70">{String(active + 1).padStart(2, "0")}</span> / {String(slides.length).padStart(2, "0")} · {current.alt}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
