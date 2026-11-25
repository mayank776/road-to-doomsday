"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TheoryFile, type TheoryItem } from "./theory-file";

const EASE = [0.76, 0, 0.24, 1] as const;

function onHashChange(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/**
 * The opt-in part: a sealed door you choose to open, then the files.
 * Visiting /theories#<slug> skips the door and opens that one file.
 */
export function TheoryVault({ items }: { items: TheoryItem[] }) {
  const hash = useSyncExternalStore(onHashChange, () => decodeURIComponent(window.location.hash.slice(1)), () => "");
  const linked = items.some((i) => i.theory.slug === hash) ? hash : "";

  const [entered, setEntered] = useState(false);
  // a file the visitor toggled overrides the link; otherwise only the linked file starts open
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isOpen = (slug: string) => toggled[slug] ?? slug === linked;
  const inside = entered || !!linked;
  const allOpen = items.every((i) => isOpen(i.theory.slug));

  useEffect(() => {
    if (linked) document.getElementById(linked)?.scrollIntoView({ block: "start" });
  }, [linked]);

  const setAll = (v: boolean) => setToggled(Object.fromEntries(items.map((i) => [i.theory.slug, v])));

  return (
    <div className="relative">
      {/* mode="wait": the door finishes opening before the files appear in its place */}
      <AnimatePresence mode="wait">
        {!inside ? (
          <motion.div key="door" className="relative grid min-h-[56svh] place-items-center overflow-hidden border border-white/10" exit={{ opacity: 0, transition: { delay: 0.75, duration: 0.2 } }}>
            {/* two halves of the vault door */}
            {[0, 1].map((side) => (
              <motion.div
                key={side}
                className={`absolute inset-y-0 w-1/2 bg-[repeating-linear-gradient(135deg,#0d0a14_0_14px,#120d1c_14px_28px)] ${side ? "right-0 border-l" : "left-0 border-r"} border-theory/30`}
                exit={{ x: side ? "100%" : "-100%" }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            ))}
            <motion.div className="relative z-10 max-w-md px-6 py-12 text-center" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#ff5a5a]">Restricted · Unverified</p>
              <p className="mt-3 font-display text-5xl uppercase leading-[0.9] sm:text-6xl">
                {items.length} sealed
                <br />
                <span className="text-theory">files</span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
                Everything behind this door is fan speculation, and none of it is confirmed by Marvel. Inside each file, the facts fans point to keep their real
                evidence labels.
              </p>
              <button
                onClick={() => setEntered(true)}
                data-cursor="Enter"
                data-magnetic
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-theory px-7 py-3.5 font-mono text-xs uppercase tracking-[0.25em] text-ink shadow-[0_0_40px_-6px_#c4a1ff] transition hover:bg-white"
              >
                Open the vault
              </button>
            </motion.div>
          </motion.div>
        ) : (
        <motion.div key="files" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
              {items.filter((i) => isOpen(i.theory.slug)).length} / {items.length} declassified · most plausible first
            </p>
            <button
              onClick={() => setAll(!allOpen)}
              className="rounded-full border border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition hover:border-theory hover:text-theory"
            >
              {allOpen ? "Seal all" : "Declassify all"}
            </button>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <TheoryFile
                key={item.theory.slug}
                item={item}
                open={isOpen(item.theory.slug)}
                onToggle={() => setToggled((t) => ({ ...t, [item.theory.slug]: !isOpen(item.theory.slug) }))}
              />
            ))}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
