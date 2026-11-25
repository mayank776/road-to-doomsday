import type { Metadata } from "next";
import { buildUniverseMapData } from "@/lib/universe-map-data";
import { getMedia } from "@/lib/media";
import { MediaImage } from "@/components/media/media-image";
import { UniverseMap } from "@/components/universe/universe-map";
import { SectionLabel } from "@/components/layout/section-label";
import { SplitHeadline } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = {
  title: "Universes",
  description: "Earth-616, Earth-828 and Earth-10005: who lives where, how they connect, and what's confirmed.",
};

export default function UniversesPage() {
  const sky = getMedia("starfield-nebula");
  return (
    <div className="relative isolate px-4 pb-20 pt-32 sm:px-8">
      {sky && (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[90svh]" aria-hidden>
          <MediaImage m={sky} sizes="100vw" priority className="opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        </div>
      )}
      <SectionLabel>The multiverse map</SectionLabel>
      <SplitHeadline as="h1" immediate className="mt-2 font-display text-[16vw] uppercase leading-[0.82] sm:text-[10vw]">
        The universes
      </SplitHeadline>
      <p className="mb-10 mt-4 max-w-xl text-white/60">
        Marvel says Doomsday&apos;s heroes come from three distinct universes. Here they are, plus two others the story touches.
      </p>
      <UniverseMap atlas={buildUniverseMapData()} />
    </div>
  );
}
