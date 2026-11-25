"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Media } from "@/lib/types";
import { MediaImage } from "@/components/media/media-image";

import { KIND_LABEL as KIND } from "@/lib/media-kind-labels";

/** Snap-scrolling artwork strip with a keyboard-navigable lightbox. */
export function Gallery({ items, accent }: { items: Media[]; accent: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const m = open !== null ? items[open] : null;

  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8" data-lenis-prevent>
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => setOpen(i)}
            data-cursor="View"
            className="variant-hover group relative h-[58vh] max-h-[520px] min-h-[340px] shrink-0 snap-start overflow-hidden border border-white/10 transition hover:border-[var(--accent)]"
            style={{ aspectRatio: `${it.width} / ${it.height}`, "--accent": accent } as React.CSSProperties}
            aria-label={`View larger: ${it.alt}`}
          >
            <MediaImage m={it} sizes="(min-width: 640px) 40vw, 80vw" className="transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
              {KIND[it.kind]}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {m && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={m.alt}
            className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between p-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
              <span>
                {open! + 1} / {items.length} · {KIND[m.kind]}
              </span>
              <button onClick={close} className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white hover:text-ink" autoFocus>
                Close · Esc
              </button>
            </div>
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-4 flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={m.src} alt={m.alt} fill sizes="100vw" className="object-contain" placeholder="blur" blurDataURL={m.blur} />
            </motion.div>
            <div className="flex items-center justify-between gap-4 p-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => step(-1)} className="rounded-full border border-white/20 px-4 py-2 font-mono text-xs hover:bg-white hover:text-ink" aria-label="Previous image">
                ←
              </button>
              <p className="text-center text-sm text-white/70">{m.alt}</p>
              <button onClick={() => step(1)} className="rounded-full border border-white/20 px-4 py-2 font-mono text-xs hover:bg-white hover:text-ink" aria-label="Next image">
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
