import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Claim } from "@/lib/types";
import { characters, cluesForCharacter, getCharacter, getProject, getUniverse, teams } from "@/lib/content";
import { mediaFor } from "@/lib/media";
import { rosterCard, spotlight } from "@/lib/cast-roster";
import { CharacterHero } from "@/components/characters/character-hero";
import { CharacterCard } from "@/components/characters/character-card";
import { Gallery } from "@/components/characters/gallery";
import { MediaImage } from "@/components/media/media-image";
import { InitialsPortrait } from "@/components/universe/initials-portrait";
import { GenerativeArt } from "@/components/effects/generative-art";
import { BasisTag, EvidenceBadge, STATUS_HEX, SupersededNote } from "@/components/evidence-labels";
import { FlipClue } from "@/components/clue-card";
import { ConnectionList } from "@/components/connection-list";
import { SectionLabel } from "@/components/layout/section-label";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCharacter((await params).slug);
  return { title: c ? (c.alias ?? c.name) : "Not found" };
}

const LANES = [
  { key: "mcu", title: "On screen", sub: "MCU & official Marvel", color: STATUS_HEX.canon },
  { key: "comics", title: "In the comics", sub: "Not MCU canon", color: "#f472b6" },
  { key: "open", title: "Open readings", sub: "Interpretations & theories", color: STATUS_HEX.theory },
] as const;

function Lane({ title, sub, color, claims }: { title: string; sub: string; color: string; claims: Claim[] }) {
  return (
    <div className="flex flex-col border-t-2 bg-surface/60" style={{ borderColor: color, boxShadow: `0 -12px 40px -20px ${color}` }}>
      <div className="flex items-baseline justify-between p-5">
        <div>
          <h3 className="font-display text-3xl uppercase" style={{ color }}>{title}</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">{sub}</p>
        </div>
        <span className="font-display text-6xl leading-none text-outline">{claims.length}</span>
      </div>
      <ul className="flex-1 divide-y divide-line">
        {claims.map((c) => (
          <li key={c.text} className="p-5">
            <div className="flex flex-wrap gap-1.5">
              <EvidenceBadge status={c.status} short />
              {c.basis !== "comics" && <BasisTag basis={c.basis} />}
            </div>
            <p className={`mt-2 ${c.superseded ? "text-white/50" : ""}`}>{c.text}</p>
            {c.citation && <p className="mt-1.5 font-mono text-[10px] text-faint">{c.citation}</p>}
            {c.note && <p className="mt-1.5 text-xs italic text-muted">{c.note}</p>}
            {c.superseded && <SupersededNote s={c.superseded} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function CharacterPage({ params }: Props) {
  const { slug } = await params;
  const c = getCharacter(slug);
  if (!c) notFound();
  const card = rosterCard(slug)!;
  const gallery = mediaFor(c.media);
  const related = cluesForCharacter(slug);
  const lanes = LANES.map((l) => ({ ...l, claims: (c[l.key] ?? []) as Claim[] })).filter((l) => l.claims.length);

  // teammates: every team this character is rostered on, minus themselves
  const myTeams = teams.filter((t) => t.members.some((m) => m.character === slug));
  const mates = myTeams.flatMap((t) => t.members.filter((m) => m.character !== slug).map((m) => ({ ...m, team: t.name, color: getUniverse(t.universe)?.color ?? "#7dffb0" })));
  const mateCards = [...new Set(mates.map((m) => m.character).filter((x): x is string => !!x))].map(rosterCard).filter((x) => !!x);
  const mateChips = mates.filter((m) => !m.character);

  // previous / next, in spotlight order
  const order = [...new Set([...spotlight().map((x) => x.slug), ...characters.map((x) => x.slug)])];
  const idx = order.indexOf(slug);
  const prev = rosterCard(order[(idx - 1 + order.length) % order.length])!;
  const next = rosterCard(order[(idx + 1) % order.length])!;

  return (
    <>
      <CharacterHero c={c} card={card} />

      <section className="px-4 pb-20 pt-6 sm:px-8">
        <SectionLabel>The evidence</SectionLabel>
        <div className={`mt-6 grid gap-4 ${lanes.length === 3 ? "lg:grid-cols-3" : lanes.length === 2 ? "lg:grid-cols-2" : ""}`}>
          {lanes.map((l) => (
            <Lane key={l.key} title={l.title} sub={l.sub} color={l.color} claims={l.claims} />
          ))}
        </div>
      </section>

      {gallery.length > 1 && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>Gallery</SectionLabel>
              <h2 className="mt-2 font-display text-5xl uppercase leading-none sm:text-6xl">{gallery.length} artworks</h2>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Select an image to enlarge it · artwork, not official stills</p>
          </div>
          <Gallery items={gallery} accent={card.accent} />
        </section>
      )}

      {(mateCards.length > 0 || mateChips.length > 0) && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <SectionLabel>Fights alongside</SectionLabel>
          <h2 className="mt-2 font-display text-5xl uppercase leading-none sm:text-6xl">{myTeams.map((t) => t.name).join(" · ")}</h2>
          {mateCards.length > 0 && (
            <div className="mt-8 grid auto-rows-[320px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {mateCards.map((m) => (
                <CharacterCard key={m.slug} c={m} />
              ))}
            </div>
          )}
          {mateChips.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {mateChips.map((m) => (
                <div key={m.name} className="flex items-center gap-3 border border-line p-2.5">
                  <InitialsPortrait name={m.name} color={m.color} size={44} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{m.name.split("·")[0].trim()}</p>
                    <p className="truncate font-mono text-[10px] text-white/40">{m.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {c.openQuestions && c.openQuestions.length > 0 && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <SectionLabel>Unanswered</SectionLabel>
          <ul className="mt-6 space-y-6">
            {c.openQuestions.map((q) => (
              <li key={q} className="font-display text-3xl uppercase leading-tight text-outline transition hover:text-white sm:text-6xl">
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <SectionLabel>Related clues</SectionLabel>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((cl) => (
              <FlipClue key={cl.slug} clue={cl} art={getProject(cl.project ?? "")?.art ?? c.art} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line px-4 py-20 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionLabel>Threads</SectionLabel>
          <Link href={`/connections?focus=character:${slug}`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
            Follow its threads →
          </Link>
        </div>
        <ConnectionList refId={`character:${slug}`} />
      </section>

      <nav className="grid border-t border-line sm:grid-cols-2" aria-label="More characters">
        {[
          { c: prev, label: "← Previous" },
          { c: next, label: "Next →" },
        ].map(({ c: o, label }) => (
          <Link key={label} href={`/characters/${o.slug}`} className="group relative h-[42svh] min-h-[260px] overflow-hidden border-line sm:even:border-l">
            <div className="absolute inset-0 opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-80">
              {o.portrait ? <MediaImage m={o.portrait} sizes="50vw" /> : <GenerativeArt seed={o.slug} art={o.art} className="h-full w-full" grain={false} />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-8 ${label.startsWith("Next") ? "sm:text-right" : ""}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: o.accent }}>
                {label}
              </p>
              <p className="mt-2 font-display text-5xl uppercase leading-none sm:text-6xl">{o.name}</p>
            </div>
          </Link>
        ))}
      </nav>
    </>
  );
}
