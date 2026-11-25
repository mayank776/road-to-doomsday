import Link from "next/link";
import { PAGES } from "@/lib/site-map";
import { getMedia } from "@/lib/media";
import { MediaImage } from "@/components/media/media-image";
import { SectionLabel } from "@/components/layout/section-label";

/**
 * "What's inside": one picture tile per page, right under the hero, so a
 * first-time visitor sees the whole site at a glance and can jump anywhere.
 */
export function WhatsInside() {
  return (
    <section aria-labelledby="guide-title" className="px-4 py-16 sm:px-8 sm:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>Start here · {PAGES.length} sections</SectionLabel>
          <h2 id="guide-title" className="mt-2 font-display text-5xl uppercase leading-[0.9] sm:text-7xl">
            What&apos;s inside
          </h2>
        </div>
        <p className="max-w-sm text-sm text-white/55">Pick a section, or keep scrolling for the guided tour: the map, the incursions, Steve, the road and Doom.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {PAGES.map((p, i) => {
          const m = getMedia(p.image);
          return (
            <Link
              key={p.href}
              href={p.href}
              className={`group relative isolate flex min-h-[200px] flex-col justify-end overflow-hidden border border-white/10 p-4 transition hover:border-doom-bright/60 sm:min-h-[240px] sm:p-5 ${
                i === 0 ? "col-span-2 lg:row-span-2 lg:min-h-0" : ""
              }`}
            >
              {m && (
                <div className="absolute inset-0 -z-10 transition duration-700 group-hover:scale-105">
                  <MediaImage m={m} sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} />
                </div>
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/10" />
              <span className="absolute left-4 top-4 font-mono text-[11px] text-doom-bright sm:left-5 sm:top-5">{p.n}</span>
              <span className="absolute right-4 top-3 text-xl text-white/60 transition group-hover:translate-x-1 group-hover:text-doom-bright sm:right-5">→</span>
              <h3 className={`font-display uppercase leading-none ${i === 0 ? "text-5xl sm:text-7xl" : "text-3xl sm:text-4xl"}`}>{p.label}</h3>
              <p className={`mt-2 text-white/70 ${i === 0 ? "max-w-md text-sm sm:text-base" : "line-clamp-3 text-xs sm:text-sm"}`}>{p.blurb}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
