import type { Metadata } from "next";
import { getCharacter, getProject, theories } from "@/lib/content";
import { getMedia } from "@/lib/media";
import { TheoryVault } from "@/components/theories/theory-vault";
import type { TheoryItem } from "@/components/theories/theory-file";
import { SectionLabel } from "@/components/layout/section-label";
import { SplitHeadline } from "@/components/effects/scroll-reveal";
import { MediaImage } from "@/components/media/media-image";

export const metadata: Metadata = {
  title: "The Theory Vault",
  description: "Fan theories and conspiracies about Avengers: Doomsday, sealed until you choose to read them. Each lists the real evidence fans point to, and the case against.",
};

export default function TheoriesPage() {
  const items: TheoryItem[] = theories.map((t) => ({
    theory: t,
    image: getMedia(t.image),
    related: [
      ...(t.characters ?? []).map((s) => ({ label: getCharacter(s)!.name, href: `/characters/${s}` })),
      ...(t.projects ?? []).map((s) => {
        const p = getProject(s)!;
        return { label: p.title + (p.detail ? ` ${p.detail.replace("Season ", "S")}` : ""), href: `/timeline/${s}` };
      }),
    ],
  }));
  const backdrop = getMedia("doom-throne");

  return (
    <div className="relative isolate px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
      {backdrop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80svh] overflow-hidden" aria-hidden>
          <div className="absolute inset-0 opacity-25 grayscale">
            <MediaImage m={backdrop} sizes="100vw" priority />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(196,161,255,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/80 to-ink" />
        </div>
      )}

      <SectionLabel>08 · Fan theories &amp; conspiracies</SectionLabel>
      <SplitHeadline as="h1" immediate className="mt-2 font-display text-[17vw] uppercase leading-[0.82] sm:text-[10vw]">
        The Theory Vault
      </SplitHeadline>
      <p className="mt-4 max-w-xl text-white/65">
        The internet&apos;s best guesses about what happens in Doomsday. They&apos;re here for fun, kept apart from the facts, and sealed until you choose
        to open them.
      </p>

      <div className="mt-10">
        <TheoryVault items={items} />
      </div>
    </div>
  );
}
