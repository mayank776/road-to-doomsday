import type { Metadata } from "next";
import Link from "next/link";
import { trailers } from "@/lib/content";
import { mediaAbout } from "@/lib/media";
import { Gallery } from "@/components/characters/gallery";
import { EvidenceBadge } from "@/components/evidence-labels";
import { SectionLabel } from "@/components/layout/section-label";
import { SplitHeadline } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = { title: "Trailer breakdown" };

const toSeconds = (ts: string) => {
  const [m, s] = ts.split(":").map(Number);
  return m * 60 + s;
};
const REVIEW_LABEL = { pending: "Awaiting frame-by-frame review", "in-review": "In review", reviewed: "Reviewed" } as const;

export default function TrailerPage() {
  const stills = mediaAbout("avengers-doomsday", "still");
  return (
    <div className="pt-32">
      <div className="px-4 sm:px-8">
        <SectionLabel>Frame by frame</SectionLabel>
        <SplitHeadline as="h1" immediate className="mt-2 font-display text-[16vw] uppercase leading-[0.82] sm:text-[10vw]">
          The trailer
        </SplitHeadline>
      </div>

      {trailers.map((t) => (
        <section key={t.slug} className="mt-12">
          {/* cinema frame: letterbox bars + HUD */}
          <div className="relative bg-black py-[4vw]">
            <div className="hud relative mx-auto aspect-video w-full max-w-[1400px] border border-white/10 sm:w-[92vw]">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${t.youtubeId}?rel=0`}
                title={t.title}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mx-auto mt-3 flex max-w-[1400px] flex-wrap justify-between gap-2 px-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 sm:w-[92vw] sm:px-0">
              <span>
                {t.official && <span className="text-official">● Official · </span>}
                {t.publisher}
              </span>
              <span>REC ▸ {t.title}</span>
            </div>
          </div>

          <div className="px-4 py-16 sm:px-8">
            {t.observations.length > 0 ? (
              <ol className="border-l border-line">
                {t.observations.map((o) => (
                  <li key={o.timestamp + o.shown} className="relative grid gap-4 py-8 pl-8 sm:grid-cols-[140px_1fr_1fr]">
                    <span className="absolute -left-[5px] top-10 h-2.5 w-2.5 rounded-full bg-doom-bright shadow-[0_0_12px_#7dffb0]" />
                    <a href={`https://youtu.be/${t.youtubeId}?t=${toSeconds(o.timestamp)}`} target="_blank" rel="noreferrer" className="font-display text-5xl text-doom-bright hover:text-white">
                      {o.timestamp}
                    </a>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Shown</p>
                      <p className="mt-1 text-lg">{o.shown}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Interpretation</p>
                      {o.interpretation ? (
                        <>
                          <div className="mt-1"><EvidenceBadge status={o.status} short /></div>
                          <p className="mt-2 text-muted">{o.interpretation}</p>
                        </>
                      ) : (
                        <p className="mt-1 text-faint">None recorded</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-supported">● {REVIEW_LABEL[t.reviewStatus]}</p>
                  <p className="mt-4 font-display text-4xl uppercase leading-tight sm:text-6xl">
                    No second-hand claims. <span className="text-outline">Timestamps land here once an editor has watched it.</span>
                  </p>
                </div>
                {/* empty timeline scaffold */}
                <div className="relative h-40 border-y border-line" aria-hidden>
                  {Array.from({ length: 24 }, (_, i) => (
                    <span key={i} className="absolute bottom-0 w-px bg-line" style={{ left: `${(i / 23) * 100}%`, height: i % 4 === 0 ? "40%" : "18%" }} />
                  ))}
                  <span className="absolute inset-y-0 left-0 w-px animate-pulse-slow bg-doom-bright shadow-[0_0_12px_#7dffb0]" />
                  <p className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
                    0:00 → observation track
                  </p>
                </div>
                <p className="font-mono text-[11px] text-faint lg:col-span-2">
                  Editors: add entries to content/research.json → trailers[].observations ·{" "}
                  <Link href="/sources" className="underline hover:text-white">editorial rules</Link>
                </p>
              </div>
            )}
          </div>
        </section>
      ))}

      {stills.length > 0 && (
        <section className="border-t border-line px-4 py-20 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>Stills · {stills.length}</SectionLabel>
              <h2 className="mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">From the footage</h2>
            </div>
            <p className="max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-faint">
              Frames gathered for this guide. Not yet matched to trailer timestamps, so nothing here is read as evidence.
            </p>
          </div>
          <Gallery items={stills} accent="#7dffb0" />
        </section>
      )}
    </div>
  );
}
