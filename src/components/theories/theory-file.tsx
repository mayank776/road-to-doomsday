"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Media, Theory } from "@/lib/types";
import { MediaImage } from "@/components/media/media-image";
import { BasisTag, EvidenceBadge, STATUS_HEX } from "@/components/evidence-labels";
import { ScrambleText } from "@/components/effects/scramble-text";

export type TheoryItem = { theory: Theory; image?: Media; related: { label: string; href: string }[] };

const EASE = [0.16, 1, 0.3, 1] as const;
const VIOLET = STATUS_HEX.theory;
export const PLAUSIBILITY = ["", "Long shot", "Unlikely", "Possible", "Plausible", "Likely"] as const;

/** Five bars filled to the editor's plausibility rating. */
export function PlausibilityMeter({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-2" title={`Plausibility: ${PLAUSIBILITY[value]} (${value} of 5)`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="h-3 w-1.5 rounded-[1px]" style={{ background: i <= value ? VIOLET : "rgba(255,255,255,0.12)", boxShadow: i <= value ? `0 0 6px ${VIOLET}` : undefined }} />
        ))}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{PLAUSIBILITY[value]}</span>
    </span>
  );
}

/**
 * One sealed dossier. Sealed: the title sits under redaction bars and the
 * image is drained of colour. Declassified: the bars wipe away, the title
 * decodes, and the file opens to show the claim, the evidence fans point to
 * (each with its real evidence label), the case against, and the sources.
 */
export function TheoryFile({ item, open, onToggle }: { item: TheoryItem; open: boolean; onToggle: () => void }) {
  const { theory: t, image, related } = item;

  return (
    <article
      id={t.slug}
      className={`relative scroll-mt-24 overflow-hidden border transition-colors duration-700 ${open ? "border-theory/50 bg-[#0d0a14]" : "border-white/10 bg-surface"}`}
      style={{ boxShadow: open ? `0 30px 80px -40px ${VIOLET}80` : undefined }}
    >
      {/* file tab */}
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <p className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
          <span className="text-theory">File {t.file}</span> · {t.codename}
        </p>
        <PlausibilityMeter value={t.plausibility} />
      </header>

      {/* image: drained while sealed */}
      {image && (
        <div className="variant-hover relative h-40 overflow-hidden sm:h-48">
          <div className={`absolute inset-0 transition-[filter,transform] duration-[1.2s] ${open ? "scale-100 grayscale-0" : "scale-105 grayscale"}`}>
            <MediaImage m={image} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-700 ${open ? "opacity-0" : "opacity-60"}`} style={{ background: `linear-gradient(180deg, transparent, #0b0f0d), ${VIOLET}33` }} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          <AnimatePresence>
            {!open && (
              <motion.span
                initial={{ opacity: 0, scale: 1.4, rotate: -14 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute right-4 top-4 border-2 border-[#ff5a5a] px-2 py-0.5 font-display text-xl uppercase tracking-wider text-[#ff5a5a] [text-shadow:0_0_12px_rgba(255,90,90,0.5)]"
              >
                Classified
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* title: redacted until opened */}
        <div className="relative min-h-[4.5rem]">
          <h3 className="font-display text-3xl uppercase leading-[0.95] sm:text-4xl">
            {open ? <ScrambleText text={t.title} trigger="manual" play duration={700} /> : <span className="invisible">{t.title}</span>}
          </h3>
          {/* redaction bars sized to the hidden title */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-start gap-2 pt-1" aria-hidden>
            {[92, 74, 48].map((w, i) => (
              <motion.span
                key={w}
                className="block h-6 origin-right bg-black sm:h-7"
                style={{ width: `${w}%` }}
                initial={false}
                animate={{ scaleX: open ? 0 : 1 }}
                transition={{ duration: 0.5, delay: open ? i * 0.08 : 0, ease: EASE }}
              />
            ))}
          </div>
          {!open && <span className="sr-only">Sealed file: {t.title}</span>}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-theory/40 bg-theory/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-theory">
                  <span className="h-1.5 w-1.5 rounded-full bg-theory" /> Fan theory · not confirmed
                </span>
                <p className="mt-3 text-[15px] leading-relaxed text-white/85 sm:text-base">{t.claim}</p>

                <h4 className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">What fans point to</h4>
                <ul className="mt-2 space-y-2">
                  {t.evidence.map((c) => (
                    <li key={c.text} className="border-l-2 bg-white/[0.03] p-3" style={{ borderColor: STATUS_HEX[c.status] }}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <EvidenceBadge status={c.status} short />
                        <BasisTag basis={c.basis} />
                      </div>
                      <p className="mt-1.5 text-sm leading-snug">{c.text}</p>
                      {c.citation && <p className="mt-1 font-mono text-[10px] text-white/40">{c.citation}</p>}
                    </li>
                  ))}
                </ul>

                <h4 className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">The case against</h4>
                <ul className="mt-2 space-y-1.5">
                  {t.against.map((a) => (
                    <li key={a} className="flex gap-2 text-sm leading-snug text-white/70">
                      <span className="text-[#ff5a5a]" aria-hidden>✕</span>
                      {a}
                    </li>
                  ))}
                </ul>

                {related.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {related.map((r) => (
                      <Link key={r.href} href={r.href} className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 transition hover:border-white/50 hover:text-white">
                        {r.label} →
                      </Link>
                    ))}
                  </div>
                )}

                <p className="mt-5 font-mono text-[10px] leading-relaxed text-white/40">
                  Discussed by{" "}
                  {t.sources.map((s, i) => (
                    <span key={s.url}>
                      {i > 0 && ", "}
                      <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white">
                        {s.label}
                      </a>
                    </span>
                  ))}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          aria-expanded={open}
          data-cursor={open ? "Seal" : "Declassify"}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full border py-3 font-mono text-[11px] uppercase tracking-[0.25em] transition ${
            open ? "border-white/15 text-white/60 hover:border-white/40 hover:text-white" : "border-theory/60 bg-theory/10 text-theory hover:bg-theory hover:text-ink"
          }`}
        >
          {open ? "Seal the file" : "Declassify ▸"}
        </button>
      </div>
    </article>
  );
}
