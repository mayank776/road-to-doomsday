import { characters, concepts, connections, projects, resolveRef } from "./content";
import { coverFor, getMedia } from "./media";
import type { Art, Connection, Media, NodeRef } from "./types";

export type ThreadNode = {
  id: NodeRef;
  kind: "project" | "character" | "concept";
  label: string;
  /** Year for a project, alias or actor for a character. */
  sub?: string;
  /** The node's own page; concepts have none. */
  href: string | null;
  image?: Media;
  art: Art;
  degree: number;
};

export type ThreadEdge = Pick<Connection, "id" | "from" | "to" | "status" | "reason" | "citation" | "basis" | "superseded">;

const CONCEPT_ART: Art = { hue: 150, motif: "branch" };

function describe(ref: NodeRef): Omit<ThreadNode, "degree"> {
  const r = resolveRef(ref);
  if (r.type === "project") {
    const p = projects.find((x) => x.slug === r.slug)!;
    return { id: ref, kind: r.type, label: r.label, sub: p.releaseDate.slice(0, 4), href: r.href, image: coverFor(r.slug), art: p.art };
  }
  if (r.type === "character") {
    const c = characters.find((x) => x.slug === r.slug)!;
    return { id: ref, kind: r.type, label: r.label, sub: c.actor, href: r.href, image: getMedia(c.media?.[0]), art: c.art };
  }
  return { id: ref, kind: r.type, label: r.label, sub: "Concept", href: null, image: coverFor(r.slug), art: CONCEPT_ART };
}

/** Every node that takes part in a documented connection, with the edges between them. */
export function buildThreads(): { nodes: ThreadNode[]; edges: ThreadEdge[] } {
  const degree = new Map<NodeRef, number>();
  for (const e of connections) for (const id of [e.from, e.to]) degree.set(id, (degree.get(id) ?? 0) + 1);

  const order = new Map<string, number>([
    ...projects.map((p, i) => [`project:${p.slug}`, i] as const),
    ...characters.map((c, i) => [`character:${c.slug}`, 100 + i] as const),
    ...concepts.map((c, i) => [`concept:${c.slug}`, 200 + i] as const),
  ]);

  const nodes = [...degree.keys()]
    .map((id) => ({ ...describe(id), degree: degree.get(id)! }))
    .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));

  const edges = connections.map(({ id, from, to, status, reason, citation, basis, superseded }) => ({ id, from, to, status, reason, citation, basis, superseded }));
  return { nodes, edges };
}
