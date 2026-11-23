"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import type { Art, Clue } from "@/lib/types";
import { GenerativeArt } from "@/components/visual/generative-art";
import { EvidenceBadge, STATUS_HEX } from "@/components/evidence";

export const KIND_LABEL: Record<Clue["kind"], string> = {
  "post-credit": "Post-credit",
  scene: "Scene",
  dialogue: "Dialogue",
  reference: "Reference",
  announcement: "Announcement",
};

export function KindGlyph({ kind, className = "h-10 w-10" }: { kind: Clue["kind"]; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {kind === "post-credit" && (
        <g {...common}>
          <rect x="4" y="10" width="40" height="28" rx="2" />
          {[8, 16, 24, 32, 40].map((x) => (
            <g key={x}>
              <rect x={x - 1.5} y="12" width="3" height="3" />
              <rect x={x - 1.5} y="33" width="3" height="3" />
            </g>
          ))}
          <path d="M20 19 L29 24 L20 29 Z" fill="currentColor" />
        </g>
      )}
      {kind === "scene" && (
        <g {...common}>
          <circle cx="24" cy="24" r="18" />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            // rounded: server (Node) and browser trig can differ in the last digit → hydration mismatch
            const r = (n: number) => Math.round(n * 100) / 100;
            return <line key={i} x1={r(24 + Math.cos(a) * 18)} y1={r(24 + Math.sin(a) * 18)} x2={r(24 + Math.cos(a + 2.1) * 8)} y2={r(24 + Math.sin(a + 2.1) * 8)} />;
          })}
        </g>
      )}
      {kind === "dialogue" && (
        <g {...common}>
          {[6, 11, 16, 21, 26, 31, 36, 41].map((x, i) => {
            const h = [6, 14, 22, 10, 18, 26, 12, 6][i];
            return <line key={x} x1={x} y1={24 - h / 2} x2={x} y2={24 + h / 2} />;
          })}
        </g>
      )}
      {kind === "reference" && (
        <g {...common}>
          <path d="M14 6 H34 V42 L24 34 L14 42 Z" />
          <line x1="19" y1="14" x2="29" y2="14" />
          <line x1="19" y1="20" x2="29" y2="20" />
        </g>
      )}
      {kind === "announcement" && (
        <g {...common}>
          <circle cx="24" cy="24" r="3" fill="currentColor" />
          <path d="M16 16 A11 11 0 0 0 16 32 M32 16 A11 11 0 0 1 32 32" />
          <path d="M10 10 A20 20 0 0 0 10 38 M38 10 A20 20 0 0 1 38 38" />
        </g>
      )}
    </svg>
  );
}

export function FlipClue({ clue, art }: { clue: Clue; art: Art }) {
  const [flipped, setFlipped] = useState(false);
  const glow = STATUS_HEX[clue.status];

  return (
    <div
      className="group h-[440px] [perspective:1400px]"
      onPointerEnter={(e) => e.pointerType === "mouse" && setFlipped(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setFlipped(false)}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* front */}
        <button
          onClick={() => setFlipped((f) => !f)}
          className="absolute inset-0 overflow-hidden border border-line text-left [backface-visibility:hidden]"
          aria-label={`${clue.title}: show evidence`}
        >
          <GenerativeArt seed={clue.slug} art={art} className="absolute inset-0 h-full w-full" grain={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute left-5 top-5 text-white/90" style={{ filter: `drop-shadow(0 0 12px ${glow})` }}>
            <KindGlyph kind={clue.kind} className="h-12 w-12" />
          </div>
          <span className="absolute right-5 top-5 h-3 w-3 rounded-full" style={{ background: glow, boxShadow: `0 0 16px ${glow}` }} />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
              {KIND_LABEL[clue.kind]}
              {clue.superseded ? " · Superseded" : ""}
            </p>
            <h3 className={`mt-2 font-display text-4xl uppercase leading-[0.9] ${clue.superseded ? "text-white/50 line-through decoration-2" : ""}`}>
              {clue.title}
            </h3>
          </div>
        </button>

        {/* back */}
        <div
          className="absolute inset-0 flex flex-col border bg-surface p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ borderColor: glow + "66", boxShadow: `inset 0 0 60px ${glow}14` }}
        >
          <EvidenceBadge status={clue.status} />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Shown</p>
          <p className="mt-1 text-sm">{clue.observation}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Why it matters</p>
          <p className="mt-1 text-sm text-muted">{clue.relevance}</p>
          <p className="mt-auto pt-4 font-mono text-[10px] text-faint">{clue.citation}</p>
          <Link href={`/clues/${clue.slug}`} className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-doom-bright hover:text-white">
            Open clue →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
