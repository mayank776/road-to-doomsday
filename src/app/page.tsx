import Link from "next/link";
import { clues, getCharacter, getProject, projects, teams, universes, updates, formatDate } from "@/lib/content";
import { buildAtlas } from "@/lib/atlas";
import { coverFor, getMedia, mediaFor } from "@/lib/media";
import { Hero } from "@/components/home/hero";
import { HorizontalPin } from "@/components/home/horizontal-pin";
import { RoadPanel } from "@/components/home/road-panel";
import { DoomSection } from "@/components/home/doom-section";
import { Incursion } from "@/components/home/incursion";
import { StoryArc } from "@/components/home/steve-arc";
import { UniverseMap } from "@/components/universe/universe-map";
import { FlipClue } from "@/components/clue-card";
import { Marquee } from "@/components/visual/marquee";
import { Reveal, SplitHeadline } from "@/components/visual/reveal";
import { Kicker } from "@/components/site-chrome";
import { STATUS_HEX, STATUS_META } from "@/components/evidence";

// the landing's cut: open in Doom's hall, end on two Earths in our sky
const HERO_FRAMES = ["doom-court", "avengers-team-up", "doom-still", "steve-f4", "cyclops-still", "doom-sentinels", "steve-peggy-lamplight", "incursion-sky"];
const KEY_CLUES = ["doom-mask-with-franklin", "ship-from-another-dimension", "clea-incursion", "loki-holds-the-tree", "council-of-kangs", "rdj-is-doom"];

export default function Home() {
  const doomsday = getProject("avengers-doomsday")!;
  const doom = getCharacter("doctor-doom")!;
  const atlas = buildAtlas();
  const central = universes.filter((u) => u.role === "central");
  const officialCast = teams.reduce((n, t) => n + t.members.length, 0) + 1; // + Doom
  const featured = KEY_CLUES.map((s) => clues.find((c) => c.slug === s)!);
  const artFor = (slug?: string) => getProject(slug ?? "")?.art ?? doomsday.art;

  return (
    <>
      <Hero
        release={doomsday.releaseDate}
        earths={central.map((u) => ({ designation: u.designation, name: u.name, color: u.color }))}
        stats={[
          { label: "Universes", value: central.length },
          { label: "Official cast", value: officialCast },
          { label: "Projects", value: projects.length },
        ]}
        slides={mediaFor(HERO_FRAMES)}
        poster={getMedia("doomsday-official-poster")}
      />

      <Marquee items={(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => ({ text: STATUS_META[s].label, color: STATUS_HEX[s] }))} />

      {/* the centrepiece */}
      <section id="universes" className="scroll-mt-16 px-4 py-24 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>01 · The multiverse map</Kicker>
            <SplitHeadline className="mt-2 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">Three Earths. One Doom.</SplitHeadline>
          </div>
          <p className="max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-white/50">
            Select a world, a crossing or Doom himself. Every line shows its evidence.
          </p>
        </div>
        <UniverseMap atlas={atlas} />
        <div className="mt-6 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.25em]">
          <Link href="/universes" className="text-doom-bright hover:text-white">Open the full map →</Link>
          <Link href="/connections" className="text-white/50 hover:text-white">Follow every thread →</Link>
        </div>
      </section>

      <Incursion
        backdrop={getMedia("starfield-mono")}
        sky={getMedia("incursion-sky")}
        steps={[
          { title: "Every choice branches", text: "When He Who Remains died, the single Sacred Timeline split into a multiverse.", status: "canon", citation: "Loki S1 E6" },
          { title: "Worlds drift together", text: "Each universe is separate, until two of them touch.", status: "canon", citation: "Doctor Strange in the Multiverse of Madness" },
          { title: "Incursion", text: "When two universes collide, one of them is destroyed. Strange was told he had caused one.", status: "canon", citation: "Multiverse of Madness: Illuminati; mid-credits scene" },
          { title: "Nothing survives it", text: "The other universe and everything in it is gone.", status: "canon", citation: "Multiverse of Madness: Earth-838's account" },
          { title: "Now: our sky", text: "Two planets loom over Earth, and Doom blames the heroes' \"stolen lives\".", status: "trailer", citation: "Avengers: Doomsday final trailer (23 Nov 2026)" },
        ]}
      />

      <StoryArc
        kicker="03 · The return"
        title="Steve Rogers comes back"
        href="/characters/steve-rogers"
        beats={[
          { when: "2019", title: "He stays with Peggy", status: "canon", citation: "Avengers: Endgame", art: { hue: 12, motif: "shield" }, media: getMedia("steve-peggy-dance") },
          { when: "2026", title: "They have a son", status: "canon", citation: "Endgame Encore, per Variety", art: { hue: 28, motif: "branch" }, media: getMedia("steve-peggy-lamplight") },
          { when: "Trailer", title: "The Fantastic Four come for him", status: "trailer", citation: "Final trailer, per Variety", art: { hue: 210, motif: "orbit" }, media: getMedia("steve-f4") },
          { when: "Dec 18", title: "Chris Evans returns", status: "official", citation: "marvel.com", art: { hue: 140, motif: "eclipse" }, media: getMedia("steve-mjolnir") },
        ]}
      />

      <HorizontalPin
        ticks={projects.map((p) => (p.upcoming ? "DOOMSDAY" : `'${p.releaseDate.slice(2, 4)}`))}
        header={
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker>04 · The road</Kicker>
              <h2 className="mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">{projects.length} stops to Doomsday</h2>
            </div>
            <Link href="/timeline" className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 hover:text-doom-bright">
              Full timeline →
            </Link>
          </div>
        }
      >
        {projects.map((p, i) => (
          <RoadPanel key={p.slug} p={p} i={i} total={projects.length} cover={coverFor(p.slug)} />
        ))}
      </HorizontalPin>

      <DoomSection
        backdrop={getMedia("doom-court")}
        stats={[
          { label: "Actor", value: "Official", tone: "official" },
          { label: "Home universe", value: "Unknown", tone: "muted" },
          { label: "Named on screen", value: "Trailer", tone: "official" },
          { label: "Seen with", value: "Franklin", tone: "supported" },
        ]}
        lanes={[
          { label: "On screen, trailers & official", count: doom.mcu.length, color: STATUS_HEX.canon },
          { label: "Comics background", count: doom.comics?.length ?? 0, color: "#f472b6" },
          { label: "Interpretations & theories", count: doom.open?.length ?? 0, color: STATUS_HEX.theory },
        ]}
      />

      <section className="px-4 py-28 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>06 · Evidence locker</Kicker>
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
            <FlipClue key={c.slug} clue={c} art={artFor(c.project)} cover={coverFor(c.slug, c.project)} />
          ))}
        </Reveal>
      </section>

      <section className="border-t border-line px-4 py-24 sm:px-8">
        <Kicker>07 · The labels</Kicker>
        <SplitHeadline className="mt-2 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">Know what you&apos;re looking at</SplitHeadline>
        <Reveal className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => (
            <div key={s} className="flex min-h-52 flex-col bg-ink p-5">
              <span className="h-4 w-4 rounded-full" style={{ background: STATUS_HEX[s], boxShadow: `0 0 24px ${STATUS_HEX[s]}` }} />
              <p className="mt-auto font-display text-3xl uppercase" style={{ color: STATUS_HEX[s] }}>
                {STATUS_META[s].short}
              </p>
              <p className="mt-2 text-sm text-muted">{STATUS_META[s].description}</p>
            </div>
          ))}
        </Reveal>
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
