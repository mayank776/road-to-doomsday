import Link from "next/link";
import type { Metadata } from "next";
import { formatDate, projects } from "@/lib/content";
import { coverFor } from "@/lib/media";
import { Visual } from "@/components/media/visual";
import { EvidenceDots } from "@/components/evidence";
import { Kicker } from "@/components/site-chrome";
import { SplitHeadline } from "@/components/visual/reveal";

export const metadata: Metadata = { title: "Timeline" };

export default function TimelinePage() {
  return (
    <div className="px-4 pt-32 sm:px-8">
      <Kicker>Follow the road · {projects.length} stops</Kicker>
      <SplitHeadline as="h1" immediate className="mt-2 font-display text-[16vw] uppercase leading-[0.82] sm:text-[10vw]">
        The timeline
      </SplitHeadline>

      {/* Sticky stacking cards: each stop slides over the last. */}
      <ol className="relative mt-16 pb-[20vh]">
        {projects.map((p, i) => (
          <li key={p.slug} className="sticky mb-[12vh]" style={{ top: `calc(80px + ${i * 14}px)` }}>
            <Link
              href={`/timeline/${p.slug}`}
              className={`group relative block h-[72svh] overflow-hidden border bg-ink ${p.upcoming ? "border-doom-bright/70" : "border-line"}`}
            >
              <Visual media={coverFor(p.slug)} seed={p.slug} art={p.art} sizes="100vw" className="transition duration-[1.4s] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

              <div className="relative flex h-full flex-col justify-between p-5 sm:p-10">
                <div className="flex items-start justify-between">
                  <span className="font-display text-[22vw] leading-[0.75] text-outline sm:text-[12vw]">{p.releaseDate.slice(0, 4)}</span>
                  <span className="font-mono text-xs text-white/60">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="max-w-3xl">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
                    {p.kind}
                    {p.detail ? ` · ${p.detail}` : ""} · {formatDate(p.releaseDate)}
                  </p>
                  <h2 className="mt-2 font-display text-5xl uppercase leading-[0.85] sm:text-8xl">{p.title}</h2>
                  <p className="mt-3 font-mono text-sm uppercase tracking-wider text-doom-bright">{p.tagline}</p>
                  <div className="mt-5 flex items-center gap-5">
                    <EvidenceDots statuses={p.events.map((e) => (e.superseded ? "superseded" : e.status))} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 group-hover:text-doom-bright">Open file →</span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
