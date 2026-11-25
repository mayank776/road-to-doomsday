import type { Metadata } from "next";
import { clues, getProject, projects } from "@/lib/content";
import { coverFor } from "@/lib/media";
import { SectionLabel } from "@/components/layout/section-label";
import { SplitHeadline } from "@/components/effects/scroll-reveal";
import { ClueWall } from "./clue-wall";

export const metadata: Metadata = { title: "Clues" };

export default function CluesPage() {
  const order = new Map(projects.map((p, i) => [p.slug, i]));
  const sorted = clues.slice().sort((a, b) => (order.get(a.project ?? "") ?? 99) - (order.get(b.project ?? "") ?? 99));
  const items = sorted.map((c) => ({ clue: c, art: getProject(c.project ?? "")?.art ?? { hue: 140, motif: "eclipse" as const }, cover: coverFor(c.slug, c.project) }));

  return (
    <div className="px-4 pb-20 pt-32 sm:px-8">
      <SectionLabel>Evidence locker</SectionLabel>
      <SplitHeadline as="h1" immediate className="mt-2 font-display text-[16vw] uppercase leading-[0.82] sm:text-[10vw]">
        The clues
      </SplitHeadline>
      <ClueWall items={items} />
    </div>
  );
}
