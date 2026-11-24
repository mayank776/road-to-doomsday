"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Art, Clue, EvidenceStatus, Media } from "@/lib/types";
import { FlipClue, KindGlyph, KIND_LABEL } from "@/components/clue-card";
import { STATUS_HEX, STATUS_META } from "@/components/evidence";

const chip = (on: boolean) =>
  `flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
    on ? "border-doom-bright/60 bg-doom-bright/10 text-white" : "border-line text-white/50 hover:text-white"
  }`;

export function ClueWall({ items }: { items: { clue: Clue; art: Art; cover?: Media }[] }) {
  const [status, setStatus] = useState<EvidenceStatus | "all">("all");
  const [kind, setKind] = useState<Clue["kind"] | "all">("all");
  const shown = useMemo(
    () => items.filter(({ clue }) => (status === "all" || clue.status === status) && (kind === "all" || clue.kind === kind)),
    [items, status, kind],
  );

  return (
    <>
      <div className="mt-10 flex flex-col gap-3 border-y border-line py-4">
        <div className="flex flex-wrap gap-2">
          <button className={chip(status === "all")} onClick={() => setStatus("all")}>All evidence</button>
          {(Object.keys(STATUS_META) as EvidenceStatus[]).map((s) => (
            <button key={s} className={chip(status === s)} onClick={() => setStatus(s)} aria-pressed={status === s}>
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_HEX[s], boxShadow: `0 0 8px ${STATUS_HEX[s]}` }} />
              {STATUS_META[s].short}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={chip(kind === "all")} onClick={() => setKind("all")}>All types</button>
          {(Object.keys(KIND_LABEL) as Clue["kind"][]).map((k) => (
            <button key={k} className={chip(kind === k)} onClick={() => setKind(k)} aria-pressed={kind === k}>
              <KindGlyph kind={k} className="h-4 w-4" />
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint" aria-live="polite">
        {shown.length} / {items.length} clues · hover or tap to flip
      </p>

      <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map(({ clue, art, cover }) => (
            <motion.div
              key={clue.slug}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <FlipClue clue={clue} art={art} cover={cover} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
