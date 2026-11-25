import Link from "next/link";
import type { Art, EvidenceStatus, Media } from "@/lib/types";
import { ImageOrArt } from "@/components/media/image-or-art";
import { EvidenceBadge, STATUS_HEX } from "@/components/evidence-labels";
import { Reveal, SplitHeadline } from "@/components/effects/scroll-reveal";

export type StoryBeat = { when: string; title: string; status: EvidenceStatus; citation: string; art: Art; media?: Media; href: string };

/** A character's road told as connected cinematic panels, one beat each. */
export function StoryPanels({ kicker, title, beats, href }: { kicker: string; title: string; beats: StoryBeat[]; href: string }) {
  return (
    <section className="px-4 py-24 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright">{kicker}</p>
          <SplitHeadline className="mt-2 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">{title}</SplitHeadline>
        </div>
        <Link href={href} className="font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
          Full file →
        </Link>
      </div>

      <Reveal className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {beats.map((b, i) => (
          <Link key={b.title} href={b.href} data-cursor={b.href === "/trailer" ? "Play" : "Open"} className="variant-hover group relative block h-[52svh] min-h-[360px] overflow-hidden border border-line transition hover:border-white/30">
            <ImageOrArt media={b.media} seed={`arc-${b.title}`} art={b.art} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="transition duration-[1.2s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
            <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-5">
              <span className="h-3 w-3 rounded-full" style={{ background: STATUS_HEX[b.status], boxShadow: `0 0 14px ${STATUS_HEX[b.status]}` }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-5xl uppercase leading-none text-outline">{b.when}</p>
              <h3 className="mt-3 font-display text-3xl uppercase leading-[0.95]">{b.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <EvidenceBadge status={b.status} short />
                <span className="font-mono text-[9px] text-white/50">{b.citation}</span>
              </div>
            </div>
            <span className="absolute right-5 top-4 text-lg text-white/60 transition group-hover:translate-x-1 group-hover:text-white" aria-hidden>→</span>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
