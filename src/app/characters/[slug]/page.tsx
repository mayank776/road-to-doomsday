import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Claim } from "@/lib/types";
import { characters, cluesForCharacter, getCharacter, getProject } from "@/lib/content";
import { ArtHero } from "@/components/visual/art-hero";
import { SplitHeadline } from "@/components/visual/reveal";
import { SigilStage } from "@/components/three/sigil-stage";
import { BasisTag, EvidenceBadge, STATUS_HEX, SupersededNote } from "@/components/evidence";
import { FlipClue } from "@/components/clue-card";
import { ConnectionList } from "@/components/connection-list";
import { Kicker } from "@/components/site-chrome";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCharacter((await params).slug);
  return { title: c ? (c.alias ?? c.name) : "Not found" };
}

const LANES = [
  { key: "mcu", title: "On screen", sub: "MCU & official Marvel", color: STATUS_HEX.confirmed },
  { key: "comics", title: "In the comics", sub: "Not MCU canon", color: "#7dd3fc" },
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
  const isDoom = slug === "doctor-doom";
  const related = cluesForCharacter(slug);
  const lanes = LANES.map((l) => ({ ...l, claims: (c[l.key] ?? []) as Claim[] })).filter((l) => l.claims.length);

  return (
    <>
      {isDoom ? (
        <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
          <SigilStage />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
          <div className="relative px-4 pb-14 pt-32 sm:px-8">
            <Link href="/characters" className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 hover:text-doom-bright">
              ← Characters
            </Link>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.3em] text-doom-bright">Dossier · The central threat</p>
            <SplitHeadline as="h1" immediate className="mt-2 font-display text-[22vw] uppercase leading-[0.78] sm:text-[14vw]">
              Doctor Doom
            </SplitHeadline>
            <p className="mt-4 font-mono text-sm uppercase tracking-[0.25em] text-white/60">{c.name}</p>
          </div>
        </section>
      ) : (
        <ArtHero seed={c.slug} art={c.art} back={{ href: "/characters", label: "Characters" }} kicker="Character file" title={c.name} subtitle={c.alias} />
      )}

      <section className="px-4 py-16 sm:px-8">
        <p className="max-w-4xl font-display text-3xl uppercase leading-tight sm:text-5xl">{c.summary}</p>
      </section>

      <section className="px-4 pb-20 sm:px-8">
        <div className={`grid gap-4 ${lanes.length === 3 ? "lg:grid-cols-3" : lanes.length === 2 ? "lg:grid-cols-2" : ""}`}>
          {lanes.map((l) => (
            <Lane key={l.key} title={l.title} sub={l.sub} color={l.color} claims={l.claims} />
          ))}
        </div>
      </section>

      {c.openQuestions && c.openQuestions.length > 0 && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <Kicker>Unanswered</Kicker>
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
          <Kicker>Related clues</Kicker>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((cl) => (
              <FlipClue key={cl.slug} clue={cl} art={getProject(cl.project ?? "")?.art ?? c.art} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line px-4 py-20 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <Kicker>Threads</Kicker>
          <Link href={`/connections?focus=character:${slug}`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
            See it in the constellation →
          </Link>
        </div>
        <ConnectionList refId={`character:${slug}`} />
      </section>
    </>
  );
}
