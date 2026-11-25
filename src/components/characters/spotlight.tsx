"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { RosterCard } from "@/lib/cast-roster";
import { CharacterCard } from "./character-card";

type Filter = { id: string; label: string; color?: string; test: (c: RosterCard) => boolean };

/** Filterable bento grid of character cards; the first card is featured. */
export function Spotlight({ cards, universes }: { cards: RosterCard[]; universes: { slug: string; designation: string; color: string }[] }) {
  const filters: Filter[] = useMemo(
    () => [
      { id: "all", label: "Everyone", test: () => true },
      ...universes.map((u) => ({ id: u.slug, label: u.designation, color: u.color, test: (c: RosterCard) => c.universe?.slug === u.slug })),
      { id: "out", label: "Not in the cast", color: "#fbbf24", test: (c: RosterCard) => c.castStatus === "not-announced" },
    ],
    [universes],
  );
  const [active, setActive] = useState("all");
  const shown = cards.filter(filters.find((f) => f.id === active)!.test);

  return (
    <>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter characters">
        {filters.map((f) => {
          const on = f.id === active;
          const count = cards.filter(f.test).length;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(f.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                on ? "border-white/40 bg-white text-ink" : "border-line text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {f.color && <span className="h-2 w-2 rounded-full" style={{ background: f.color, boxShadow: `0 0 8px ${f.color}` }} />}
              {f.label}
              <span className={on ? "text-ink/50" : "text-white/30"}>{count}</span>
            </button>
          );
        })}
      </div>

      <motion.div layout className="grid auto-rows-[min(62vh,440px)] grid-cols-1 gap-3 sm:auto-rows-[340px] sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map((c, i) => {
            const featured = i === 0 && active === "all";
            return (
              <motion.div
                key={c.slug}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.03 }}
                className={featured ? "sm:col-span-2 sm:row-span-2" : i === 1 || i === 2 ? "lg:row-span-2" : ""}
              >
                <CharacterCard c={c} size={featured ? "lg" : "md"} priority={i < 3} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
