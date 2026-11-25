"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { RosterCard } from "@/lib/cast-roster";
import { MediaImage } from "@/components/media/media-image";
import { GenerativeArt } from "@/components/effects/generative-art";

/** Poster card with pointer-driven 3D tilt, accent glow and hover reveal. */
export function CharacterCard({ c, size = "md", priority = false }: { c: RosterCard; size?: "lg" | "md"; priority?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 180, damping: 18 });
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.14), transparent 45%)`);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const notAnnounced = c.castStatus === "not-announced";

  return (
    <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }} className="h-full">
      <Link
        ref={ref}
        href={`/characters/${c.slug}`}
        onPointerMove={move}
        onPointerLeave={reset}
        className="group relative block h-full overflow-hidden border border-white/10 bg-surface transition-[border-color,box-shadow] duration-500 hover:border-[var(--accent)]"
        style={{ "--accent": c.accent, boxShadow: `0 30px 60px -30px ${c.accent}40` } as React.CSSProperties}
      >
        <div className={`absolute inset-0 transition duration-[1.2s] ease-out group-hover:scale-[1.06] ${notAnnounced ? "grayscale-[60%] group-hover:grayscale-0" : ""}`}>
          {c.portrait ? (
            <MediaImage m={c.portrait} sizes={size === "lg" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"} priority={priority} />
          ) : (
            <GenerativeArt seed={c.slug} art={c.art} className="h-full w-full" grain={false} />
          )}
        </div>

        {/* accent tint + legibility gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div className="absolute inset-0 opacity-0 mix-blend-color transition-opacity duration-700 group-hover:opacity-25" style={{ background: c.accent }} />
        {/* pointer glare */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glare }}
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
          {c.universe ? (
            <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] backdrop-blur" style={{ color: c.universe.color }}>
              {c.universe.designation}
            </span>
          ) : (
            <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 backdrop-blur">Origin unknown</span>
          )}
          {notAnnounced && (
            <span className="rounded-full border border-supported/40 bg-black/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-supported backdrop-blur">Not in cast</span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {c.team && <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: c.accent }}>{c.team}</p>}
          <h3 className={`mt-1 font-display uppercase leading-[0.85] ${size === "lg" ? "text-6xl sm:text-8xl" : "text-4xl"}`}>{c.name}</h3>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            {c.alias && c.alias !== c.name ? `${c.alias} · ` : ""}
            {c.actor}
          </p>
          <p className="grid grid-rows-[0fr] text-sm text-white/75 transition-[grid-template-rows,margin] duration-500 group-hover:mt-3 group-hover:grid-rows-[1fr]">
            <span className="overflow-hidden">{c.summary}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
