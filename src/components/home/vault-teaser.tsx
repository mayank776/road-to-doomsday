import Link from "next/link";
import { theories } from "@/lib/content";
import { getMedia } from "@/lib/media";
import { MediaImage } from "@/components/media/media-image";
import { SectionLabel } from "@/components/layout/section-label";
import { PlausibilityMeter } from "@/components/theories/theory-file";

/**
 * The homepage's door to the Theory Vault: three sealed files with their
 * titles redacted. Nothing is revealed here; tapping a file opens it in the vault.
 */
export function VaultTeaser() {
  const top = theories.slice(0, 3);
  return (
    <section className="relative isolate overflow-hidden border-y border-theory/20 bg-[#08060d] px-4 py-20 sm:px-8 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_0%,rgba(196,161,255,0.14),transparent_55%)]" aria-hidden />
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionLabel className="text-theory!">Optional · Fan theories</SectionLabel>
          <h2 className="mt-2 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">
            Want the <span className="text-theory">conspiracies</span>?
          </h2>
          <p className="mt-4 max-w-lg text-white/60">
            {theories.length} of the internet&apos;s best guesses, sealed in the vault, kept apart from the facts, and only opened if you choose to.
          </p>
        </div>
        <Link
          href="/theories"
          data-cursor="Enter"
          data-magnetic
          className="inline-flex items-center gap-3 rounded-full border border-theory/60 bg-theory/10 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.25em] text-theory transition hover:bg-theory hover:text-ink"
        >
          Enter the vault →
        </Link>
      </div>

      {/* phones: a swipeable row; tablets up: three across */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
        {top.map((t) => {
          const m = getMedia(t.image);
          return (
            <Link
              key={t.slug}
              href={`/theories#${t.slug}`}
              data-cursor="Declassify"
              className="group relative w-[78vw] shrink-0 snap-center overflow-hidden border border-white/10 bg-surface transition hover:border-theory/60 sm:w-auto"
            >
              <div className="variant-hover relative h-40 overflow-hidden">
                {m && (
                  <div className="absolute inset-0 grayscale transition duration-700 group-hover:grayscale-0">
                    <MediaImage m={m} sizes="(min-width: 640px) 33vw, 78vw" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <span className="absolute right-3 top-3 -rotate-6 border-2 border-[#ff5a5a] px-2 py-0.5 font-display text-base uppercase text-[#ff5a5a]">Classified</span>
              </div>
              <div className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                  <span className="text-theory">File {t.file}</span> · {t.codename}
                </p>
                <div className="mt-3 space-y-2" aria-hidden>
                  <span className="block h-5 w-[90%] bg-black" />
                  <span className="block h-5 w-[60%] bg-black" />
                </div>
                <span className="sr-only">Sealed fan theory, code name {t.codename}</span>
                <div className="mt-4">
                  <PlausibilityMeter value={t.plausibility} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
