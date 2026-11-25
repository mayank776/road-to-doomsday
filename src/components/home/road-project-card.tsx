import Link from "next/link";
import type { Media, Project } from "@/lib/types";
import { ImageOrArt } from "@/components/media/image-or-art";
import { EvidenceDots } from "@/components/evidence-labels";

export function RoadProjectCard({ p, i, total, cover }: { p: Project; i: number; total: number; cover?: Media }) {
  return (
    <Link
      href={`/timeline/${p.slug}`}
      data-cursor="Open"
      className={`variant-hover group relative h-full min-h-[420px] w-[82vw] shrink-0 snap-center motion-reduce:h-[70svh] overflow-hidden border sm:w-[52vw] lg:w-[36vw] motion-reduce:w-full ${
        p.upcoming ? "border-doom-bright/70" : "border-line"
      }`}
    >
      <div className="road-art absolute -inset-x-[10%] inset-y-0">
        <ImageOrArt media={cover} seed={p.slug} art={p.art} sizes="(min-width: 1024px) 36vw, (min-width: 640px) 52vw, 82vw" className="transition duration-[1.2s] ease-out group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <span className="font-display text-7xl leading-none text-outline sm:text-8xl">{p.releaseDate.slice(0, 4)}</span>
        <span className="font-mono text-[11px] text-white/60">
          {String(i + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
          {p.kind}
          {p.detail ? ` · ${p.detail}` : ""}
          {p.upcoming ? " · Upcoming" : ""}
        </p>
        <h3 className="mt-2 font-display text-4xl uppercase leading-[0.9] sm:text-5xl">{p.title}</h3>
        <p className="mt-2 font-mono text-sm uppercase tracking-wider text-doom-bright">{p.tagline}</p>
        <div className="mt-4 flex items-center justify-between">
          <EvidenceDots statuses={p.events.map((e) => (e.superseded ? "superseded" : e.status))} />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 transition group-hover:text-doom-bright">
            Open file →
          </span>
        </div>
      </div>
    </Link>
  );
}
