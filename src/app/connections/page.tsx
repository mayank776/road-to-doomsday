import type { Metadata } from "next";
import { connections } from "@/lib/content";
import { buildConnectionThreads } from "@/lib/connection-threads";
import type { NodeRef } from "@/lib/types";
import { ThreadExplorer } from "@/components/threads/thread-explorer";
import { SectionLabel } from "@/components/layout/section-label";
import { SplitHeadline } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = {
  title: "Connections",
  description: "Follow every documented thread between the films, characters and ideas that lead to Avengers: Doomsday, each with its evidence.",
};

export default async function ConnectionsPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const { nodes, edges } = buildConnectionThreads();
  const confirmed = connections.filter((c) => c.status === "official" || c.status === "canon" || c.status === "trailer").length;

  return (
    <div className="px-4 pb-24 pt-32 sm:px-8">
      <SectionLabel>Connections · {connections.length} threads</SectionLabel>
      <SplitHeadline as="h1" immediate className="mt-2 font-display text-[15vw] uppercase leading-[0.82] sm:text-[9vw]">
        Pull a thread
      </SplitHeadline>
      <p className="mt-4 max-w-xl text-white/60">
        Every documented link on the road to Doomsday: {confirmed} confirmed on screen or by Marvel, the rest clearly marked. Pick anything and follow
        where it leads.
      </p>

      <div className="mt-10">
        <ThreadExplorer nodes={nodes} edges={edges} initialFocus={(focus ?? "project:avengers-doomsday") as NodeRef} />
      </div>
    </div>
  );
}
