import type { Metadata } from "next";
import { buildGraph } from "@/lib/graph";
import { ConstellationExplorer } from "@/components/constellation-explorer";

export const metadata: Metadata = { title: "Story connections" };

export default async function ConnectionsPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const { nodes, edges } = buildGraph();
  return (
    <section className="relative h-svh overflow-hidden">
      <h1 className="sr-only">Story connections</h1>
      <ConstellationExplorer nodes={nodes} edges={edges} initialFocus={focus ?? null} full />
    </section>
  );
}
