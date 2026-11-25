import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { clues, getCharacter, getClue, getProject } from "@/lib/content";
import { PageHero } from "@/components/layout/page-hero";
import { coverFor } from "@/lib/media";
import { BasisTag, EvidenceBadge, STATUS_HEX, STATUS_META, SupersededNote } from "@/components/evidence-labels";
import { KindGlyph, KIND_LABEL } from "@/components/clue-card";
import { SectionLabel } from "@/components/layout/section-label";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return clues.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getClue((await params).slug);
  return { title: c ? c.title : "Not found" };
}

export default async function CluePage({ params }: Props) {
  const { slug } = await params;
  const c = getClue(slug);
  if (!c) notFound();
  const project = c.project ? getProject(c.project) : undefined;
  const col = STATUS_HEX[c.status];

  return (
    <>
      <PageHero
        seed={c.slug}
        media={coverFor(c.slug, c.project)}
        art={project?.art ?? { hue: 140, motif: "eclipse" }}
        back={{ href: "/clues", label: "All clues" }}
        kicker={`${KIND_LABEL[c.kind]}${project ? ` · ${project.title}` : ""}`}
        title={c.title}
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-white" style={{ filter: `drop-shadow(0 0 10px ${col})` }}>
            <KindGlyph kind={c.kind} className="h-10 w-10" />
          </span>
          <EvidenceBadge status={c.status} />
          <BasisTag basis={c.basis} />
        </div>
      </PageHero>

      <section className="grid gap-px border-y border-line bg-line lg:grid-cols-2">
        <div className="bg-ink px-4 py-14 sm:px-8">
          <SectionLabel>Shown</SectionLabel>
          <p className="mt-4 font-display text-3xl uppercase leading-tight sm:text-5xl">{c.observation}</p>
        </div>
        <div className="bg-ink px-4 py-14 sm:px-8" style={{ boxShadow: `inset 0 0 120px -60px ${col}` }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: col }}>
            Why it matters · {STATUS_META[c.status].label}
          </p>
          <p className="mt-4 text-xl leading-relaxed text-text/90 sm:text-2xl">{c.relevance}</p>
          {c.superseded && <SupersededNote s={c.superseded} />}
        </div>
      </section>

      <section className="flex flex-wrap items-end justify-between gap-6 px-4 py-14 sm:px-8">
        <div>
          <SectionLabel>Source</SectionLabel>
          <p className="mt-2 font-mono text-sm text-muted">{c.citation}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {project && (
            <Link href={`/timeline/${project.slug}`} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:border-doom-bright hover:text-doom-bright">
              {project.title} →
            </Link>
          )}
          {c.characters?.map((s) => {
            const ch = getCharacter(s)!;
            return (
              <Link key={s} href={`/characters/${s}`} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:border-doom-bright hover:text-doom-bright">
                {s === "doctor-doom" ? ch.alias : ch.name}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
