import Link from "next/link";
import type { Character, EvidenceStatus } from "@/lib/types";
import type { RosterCard } from "@/lib/roster";
import { isWide, mediaFor } from "@/lib/media";
import { MediaImage } from "@/components/media/media-image";
import { GenerativeArt } from "@/components/visual/generative-art";
import { SplitHeadline } from "@/components/visual/reveal";
import { STATUS_HEX, STATUS_META } from "@/components/evidence";
import { TiltFrame } from "./tilt-frame";

/**
 * Split hero: identity on the left, the artwork in a tilting frame on the right,
 * over a blurred, accent-tinted wash of the same image.
 */
export function CharacterHero({ c, card }: { c: Character; card: RosterCard }) {
  const p = card.portrait;
  // a wide film still makes a far richer backdrop than a blurred copy of the portrait
  const wide = mediaFor(c.media).find((m) => m.id !== p?.id && isWide(m));
  const claims = [...c.mcu, ...(c.open ?? [])];
  const tally = (Object.keys(STATUS_META) as EvidenceStatus[])
    .map((s) => ({ s, n: claims.filter((x) => x.status === s).length }))
    .filter((t) => t.n > 0);

  return (
    <section className="relative isolate overflow-hidden">
      {/* backdrop wash */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {wide ? (
          <div className="absolute inset-0 opacity-45">
            <MediaImage m={wide} sizes="100vw" />
          </div>
        ) : p ? (
          <div className="absolute inset-0 scale-125 opacity-45 blur-2xl saturate-150">
            <MediaImage m={p} sizes="40vw" />
          </div>
        ) : (
          <GenerativeArt seed={c.slug} art={c.art} className="absolute inset-0 h-full w-full opacity-50" grain={false} />
        )}
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 75% 40%, ${card.accent}33, transparent 60%)` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="grid min-h-svh items-center gap-10 px-4 pb-14 pt-28 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        {/* art */}
        <div className="order-first flex justify-center lg:order-last lg:justify-end">
          <TiltFrame accent={card.accent} className="h-[54svh] w-auto max-w-full sm:h-[64svh] lg:h-[74svh]">
            <div className="relative h-full" style={{ aspectRatio: p ? `${p.width} / ${p.height}` : "3 / 4" }}>
              {p ? (
                <MediaImage m={p} sizes="(min-width: 1024px) 40vw, 80vw" priority />
              ) : (
                <GenerativeArt seed={c.slug} art={c.art} className="absolute inset-0 h-full w-full" />
              )}
            </div>
          </TiltFrame>
        </div>

        {/* identity */}
        <div>
          <Link href="/characters" className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 hover:text-white">
            ← All characters
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {card.universe ? (
              <Link
                href="/universes"
                className="rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur hover:border-white/40"
                style={{ color: card.universe.color }}
              >
                {card.universe.designation}
              </Link>
            ) : (
              <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                Home universe not established
              </span>
            )}
            {card.team && (
              <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: card.accent }}>
                {card.team}
              </span>
            )}
          </div>

          <SplitHeadline as="h1" immediate className="mt-4 font-display text-[19vw] uppercase leading-[0.8] sm:text-[11vw] lg:text-[8.5vw]">
            {card.name}
          </SplitHeadline>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-white/60">
            {card.alias && card.alias !== card.name ? `${card.alias} · ` : ""}
            {c.actor ?? ""}
          </p>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">{c.summary}</p>

          {c.castStatus && (
            <p
              className={`mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] ${
                c.castStatus === "official" ? "border-official/50 bg-official/10 text-official" : "border-supported/50 bg-supported/10 text-supported"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.castStatus === "official" ? "bg-official" : "bg-supported"}`} />
              {c.castStatus === "official" ? "In the official Doomsday cast" : "Not in the official Doomsday cast"}
              <span className="text-white/40">· marvel.com</span>
            </p>
          )}

          {tally.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5">
              {tally.map(({ s, n }) => (
                <div key={s} className="flex items-baseline gap-2">
                  <span className="font-display text-3xl leading-none" style={{ color: STATUS_HEX[s] }}>
                    {n}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{STATUS_META[s].short}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
