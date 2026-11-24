import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cluesForProject, formatDate, getProject, projects } from "@/lib/content";
import { ArtHero } from "@/components/visual/art-hero";
import { coverFor, mediaAbout } from "@/lib/media";
import { Visual } from "@/components/media/visual";
import { Gallery } from "@/components/characters/gallery";
import { ClaimStack } from "@/components/claim-stack";
import { FlipClue } from "@/components/clue-card";
import { ConnectionList } from "@/components/connection-list";
import { EvidenceDots } from "@/components/evidence";
import { Kicker } from "@/components/site-chrome";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return { title: p ? `${p.title}${p.detail ? ` ${p.detail}` : ""}` : "Not found" };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const idx = projects.findIndex((x) => x.slug === slug);
  const next = projects[idx + 1];
  const projectClues = cluesForProject(slug);
  const cover = coverFor(slug);
  const images = mediaAbout(slug);

  return (
    <>
      <ArtHero
        seed={p.slug}
        art={p.art}
        media={cover}
        back={{ href: "/timeline", label: "Timeline" }}
        kicker={`Stop ${String(idx + 1).padStart(2, "0")} · ${p.kind}${p.detail ? ` · ${p.detail}` : ""} · ${formatDate(p.releaseDate)}`}
        title={p.title}
        subtitle={p.tagline}
      >
        <div className="mt-6 flex items-center gap-4">
          <EvidenceDots statuses={p.events.map((e) => (e.superseded ? "superseded" : e.status))} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{p.events.length} key events</span>
        </div>
      </ArtHero>

      <section className="px-4 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Kicker>Why it matters</Kicker>
            <p className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">{p.whyItMatters}</p>
          </div>
          <ClaimStack claims={p.events} />
        </div>
      </section>

      {images.length > 1 && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <Kicker>In pictures · {images.length}</Kicker>
          <div className="mt-8">
            <Gallery items={images} accent={cover?.color ?? "#7dffb0"} />
          </div>
        </section>
      )}

      {projectClues.length > 0 && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <Kicker>Clues from this stop</Kicker>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectClues.map((c) => (
              <FlipClue key={c.slug} clue={c} art={p.art} cover={coverFor(c.slug, slug)} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line px-4 py-20 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <Kicker>Threads</Kicker>
          <Link href={`/connections?focus=project:${slug}`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
            See it in the constellation →
          </Link>
        </div>
        <ConnectionList refId={`project:${slug}`} />
      </section>

      {next && (
        <Link href={`/timeline/${next.slug}`} className="group relative block h-[60svh] overflow-hidden border-t border-line">
          <Visual media={coverFor(next.slug)} seed={next.slug} art={next.art} sizes="100vw" className="opacity-60 transition duration-1000 group-hover:scale-105 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-12 sm:px-8">
            <Kicker>Next stop →</Kicker>
            <p className="mt-2 font-display text-[12vw] uppercase leading-[0.85] sm:text-[8vw]">{next.title}</p>
          </div>
        </Link>
      )}
    </>
  );
}
