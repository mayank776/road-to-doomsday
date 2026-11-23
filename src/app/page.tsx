import Link from "next/link";
import { clues, getCharacter, getProject, projects, updates, formatDate } from "@/lib/content";
import { buildGraph } from "@/lib/graph";
import { Hero } from "@/components/home/hero";
import { HorizontalPin } from "@/components/home/horizontal-pin";
import { RoadPanel } from "@/components/home/road-panel";
import { DoomSection } from "@/components/home/doom-section";
import { ConstellationExplorer } from "@/components/constellation-explorer";
import { FlipClue } from "@/components/clue-card";
import { Marquee } from "@/components/visual/marquee";
import { Reveal, SplitHeadline } from "@/components/visual/reveal";
import { Kicker } from "@/components/site-chrome";
import { STATUS_HEX, STATUS_META } from "@/components/evidence";

const KEY_CLUES = ["doom-mask-with-franklin", "ship-from-another-dimension", "clea-incursion", "loki-holds-the-tree", "council-of-kangs", "rdj-is-doom"];

export default function Home() {
  const doomsday = getProject("avengers-doomsday")!;
  const doom = getCharacter("doctor-doom")!;
  const graph = buildGraph();
  const featured = KEY_CLUES.map((s) => clues.find((c) => c.slug === s)!);
  const artFor = (slug?: string) => getProject(slug ?? "")?.art ?? doomsday.art;

  return (
    <>
      <Hero release={doomsday.releaseDate} />

      <Marquee
        items={[
          { text: "Confirmed", color: STATUS_HEX.confirmed },
          { text: "Supported", color: STATUS_HEX.supported },
          { text: "Fan theory", color: STATUS_HEX.theory },
          { text: "Never confused" },
        ]}
      />

      <HorizontalPin
        ticks={projects.map((p) => p.releaseDate.slice(2, 4) === "26" ? "DOOMSDAY" : `'${p.releaseDate.slice(2, 4)}`)}
        header={
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker>01 · The road</Kicker>
              <h2 className="mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">Ten stops to Doomsday</h2>
            </div>
            <Link href="/timeline" className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 hover:text-doom-bright">
              Full timeline →
            </Link>
          </div>
        }
      >
        {projects.map((p, i) => (
          <RoadPanel key={p.slug} p={p} i={i} total={projects.length} />
        ))}
      </HorizontalPin>

      <DoomSection
        stats={[
          { label: "Actor", value: "Confirmed", tone: "confirmed" },
          { label: "Face shown", value: "Not yet", tone: "muted" },
          { label: "Named on screen", value: "Not yet", tone: "muted" },
          { label: "Seen with", value: "Franklin", tone: "supported" },
        ]}
        lanes={[
          { label: "MCU on-screen & official", count: doom.mcu.length, color: STATUS_HEX.confirmed },
          { label: "Comics background", count: doom.comics?.length ?? 0, color: "#7dd3fc" },
          { label: "Interpretations & theories", count: doom.open?.length ?? 0, color: STATUS_HEX.theory },
        ]}
      />

      <section className="relative h-[100svh] overflow-hidden border-b border-line">
        <ConstellationExplorer nodes={graph.nodes} edges={graph.edges} />
        <div className="pointer-events-none absolute inset-x-0 bottom-14 z-10 px-4 sm:bottom-auto sm:top-40 sm:px-8">
          <Kicker>03 · Connections</Kicker>
          <h2 className="mt-2 max-w-xl font-display text-5xl uppercase leading-[0.9] sm:text-7xl">
            {graph.edges.length} threads.
            <br />
            <span className="text-outline">One destination.</span>
          </h2>
          <Link href="/connections" className="pointer-events-auto mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
            Explore full screen →
          </Link>
        </div>
      </section>

      <section className="px-4 py-28 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>04 · Evidence locker</Kicker>
            <SplitHeadline className="mt-2 font-display text-6xl uppercase leading-[0.85] sm:text-8xl">Read the clues</SplitHeadline>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Hover or tap a card to flip it</p>
            <Link href="/clues" className="font-mono text-[11px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
              All {clues.length} clues →
            </Link>
          </div>
        </div>
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <FlipClue key={c.slug} clue={c} art={artFor(c.project)} />
          ))}
        </Reveal>
      </section>

      <section className="border-t border-line px-4 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Kicker>05 · The labels</Kicker>
            <SplitHeadline className="mt-2 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">Know what you&apos;re looking at</SplitHeadline>
          </div>
          <Reveal className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => (
              <div key={s} className="flex min-h-56 flex-col bg-ink p-5">
                <span className="h-4 w-4 rounded-full" style={{ background: STATUS_HEX[s], boxShadow: `0 0 24px ${STATUS_HEX[s]}` }} />
                <p className="mt-auto font-display text-3xl uppercase" style={{ color: STATUS_HEX[s] }}>
                  {STATUS_META[s].short}
                </p>
                <p className="mt-2 text-sm text-muted">{STATUS_META[s].description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line px-4 py-16 sm:px-8">
        <Kicker>Latest additions</Kicker>
        <ul className="mt-6">
          {updates.map((u) => (
            <li key={u.title}>
              <Link href={u.href} className="group grid gap-1 border-b border-line py-5 sm:grid-cols-[180px_1fr_auto] sm:items-baseline sm:gap-6">
                <time className="font-mono text-[11px] text-faint" dateTime={u.date}>
                  {formatDate(u.date)}
                </time>
                <span className="font-display text-2xl uppercase transition group-hover:translate-x-2 group-hover:text-doom-bright sm:text-3xl">{u.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-faint">{u.source}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
