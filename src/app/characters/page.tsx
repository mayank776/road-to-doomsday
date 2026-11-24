import Link from "next/link";
import type { Metadata } from "next";
import { universes } from "@/lib/content";
import { castByUniverse, filmstrip, rosterCard, spotlight } from "@/lib/roster";
import { MediaImage } from "@/components/media/media-image";
import { Spotlight } from "@/components/characters/spotlight";
import { Portrait } from "@/components/universe/portrait";
import { EvidenceBadge } from "@/components/evidence";
import { Kicker } from "@/components/site-chrome";
import { Reveal, SplitHeadline } from "@/components/visual/reveal";

export const metadata: Metadata = {
  title: "Characters",
  description: "Everyone in Avengers: Doomsday: the official cast by universe and team, with what's confirmed about each.",
};

export default function CharactersPage() {
  const strip = filmstrip();
  const doom = rosterCard("doctor-doom");
  const cast = castByUniverse();
  const officialCount = cast.reduce((n, u) => n + u.teams.reduce((k, t) => k + t.members.length, 0), 0) + 1; // + Doom
  const central = universes.filter((u) => u.role === "central").map((u) => ({ slug: u.slug, designation: u.designation, color: u.color }));

  return (
    <>
      {/* header: a slow, tilted filmstrip of every piece of character art */}
      <section className="relative overflow-hidden pb-16 pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-24 -z-0 -rotate-3 scale-110 opacity-40" aria-hidden>
          {[0, 1].map((row) => (
            <div key={row} className="mb-3 flex overflow-hidden">
              <div className={`flex w-max animate-marquee gap-3 ${row ? "[animation-direction:reverse]" : ""}`} style={{ animationDuration: "70s" }}>
                {[...strip, ...strip].map((m, i) => (
                  <div key={`${m.id}-${i}`} className="relative h-44 w-32 shrink-0 overflow-hidden sm:h-56 sm:w-40">
                    <MediaImage m={m} sizes="160px" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" aria-hidden />

        <div className="relative px-4 sm:px-8">
          <Kicker>The players</Kicker>
          <SplitHeadline as="h1" immediate className="mt-2 font-display text-[19vw] uppercase leading-[0.8] sm:text-[12vw]">
            Characters
          </SplitHeadline>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { v: officialCount, l: "In the official cast" },
              { v: central.length, l: "Universes" },
              { v: cast.reduce((n, u) => n + u.teams.length, 0), l: "Teams" },
            ].map((s) => (
              <div key={s.l}>
                <dd className="font-display text-5xl leading-none sm:text-6xl">{s.v}</dd>
                <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-8">
        <Spotlight cards={spotlight()} universes={central} />
      </section>

      {/* the complete official cast, by universe → team */}
      <section className="border-t border-line px-4 py-24 sm:px-8">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>Full cast</Kicker>
            <SplitHeadline className="mt-2 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">Who&apos;s fighting, and where from</SplitHeadline>
          </div>
          <p className="max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-white/40">
            Source: marvel.com official cast list, 5 Nov 2026
          </p>
        </div>

        <div className="space-y-20">
          {cast.map((u) => (
            <div key={u.slug} className="relative">
              <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b pb-4" style={{ borderColor: `${u.color}55` }}>
                <h3 className="whitespace-nowrap font-display text-5xl uppercase leading-none sm:text-8xl" style={{ color: u.color }}>
                  {u.designation}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{u.name}</p>
                <Link href="/universes" className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white sm:block">
                  On the map →
                </Link>
              </div>

              <div className="space-y-10">
                {u.teams.map((t) => (
                  <div key={t.slug} className="grid gap-5 lg:grid-cols-[280px_1fr]">
                    <div className="relative">
                      {t.cover ? (
                        <div className="relative hidden aspect-[3/4] overflow-hidden border border-line lg:block">
                          <MediaImage m={t.cover} sizes="280px" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                      ) : null}
                      <div className={t.cover ? "lg:absolute lg:inset-x-0 lg:bottom-0 lg:p-4" : ""}>
                        <h4 className="font-display text-3xl uppercase leading-none">{t.name}</h4>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{t.members.length} members</p>
                        {t.universeStatus && (
                          <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-white/50">
                            universe <EvidenceBadge status={t.universeStatus} short />
                          </div>
                        )}
                      </div>
                    </div>

                    <Reveal className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4" stagger={0.04}>
                      {t.members.map((m) => {
                        const inner = (
                          <>
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 sm:h-14 sm:w-14">
                              {m.portrait ? <MediaImage m={m.portrait} sizes="56px" /> : <Portrait name={m.name} color={u.color} size={56} />}
                            </div>
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">{m.name.split("·")[0].trim()}</p>
                              {m.name.includes("·") && (
                                <p className="line-clamp-1 font-mono text-[9px] uppercase tracking-wider sm:text-[10px]" style={{ color: u.color }}>
                                  {m.name.split("·")[1].trim()}
                                </p>
                              )}
                              <p className="truncate font-mono text-[10px] text-white/40">{m.actor}</p>
                            </div>
                          </>
                        );
                        return m.href ? (
                          <Link key={m.name} href={m.href} title={m.note} className="flex items-center gap-2.5 border border-line bg-surface/60 p-2 sm:gap-3 sm:p-2.5 transition hover:border-white/30 hover:bg-raised">
                            {inner}
                          </Link>
                        ) : (
                          <div key={m.name} title={m.note} className="flex items-center gap-2.5 border border-line/60 p-2 sm:gap-3 sm:p-2.5">
                            {inner}
                          </div>
                        );
                      })}
                    </Reveal>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-center gap-4 border border-line p-5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-doom/60 bg-ink">
            {doom?.portrait ? <MediaImage m={doom.portrait} sizes="56px" /> : <Portrait name="Doctor Doom" color="#3dff8f" size={56} />}
          </div>
          <div>
            <p className="font-display text-2xl uppercase">Doctor Doom · Robert Downey Jr.</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">The threat to all three. Home universe not established.</p>
          </div>
          <Link href="/characters/doctor-doom" className="ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-doom-bright hover:text-white">
            Dossier →
          </Link>
        </div>
      </section>
    </>
  );
}
