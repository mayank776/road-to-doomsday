import { characters, concepts, connections, projects, resolveRef } from "./content";
import type { Connection, NodeRef } from "./types";

export type GNode = {
  id: string;
  kind: "project" | "character" | "concept";
  label: string;
  href: string | null;
  degree: number;
  pos: [number, number, number];
  focal?: boolean;
};

export type GEdge = Pick<Connection, "id" | "from" | "to" | "status" | "reason" | "citation" | "basis" | "superseded">;

/** Deterministic 3D force layout (springs + repulsion), computed at build time. */
export function buildGraph(): { nodes: GNode[]; edges: GEdge[] } {
  const ids: string[] = [
    ...projects.map((p) => `project:${p.slug}`),
    ...characters.map((c) => `character:${c.slug}`),
    ...concepts.map((c) => `concept:${c.slug}`),
  ];
  const idx = new Map(ids.map((id, i) => [id, i]));
  const n = ids.length;
  let seed = 7;
  const R = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // Seed positions: projects along a helix in release order, which keeps the "road" readable in 3D.
  const P = ids.map((id, i) => {
    if (id.startsWith("project:")) {
      const t = i / (projects.length - 1);
      return [Math.cos(t * Math.PI * 2.2) * 4, (t - 0.5) * 10, Math.sin(t * Math.PI * 2.2) * 4];
    }
    return [(R() - 0.5) * 12, (R() - 0.5) * 10, (R() - 0.5) * 12];
  });
  const isProject = ids.map((id) => id.startsWith("project:"));
  const targetY = P.map((p) => p[1]);
  const E = connections.map((e) => [idx.get(e.from)!, idx.get(e.to)!]);

  for (let iter = 0; iter < 400; iter++) {
    const F = ids.map(() => [0, 0, 0]);
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const d = [P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]];
        const dist2 = Math.max(0.5, d[0] ** 2 + d[1] ** 2 + d[2] ** 2);
        const f = 6 / dist2;
        for (let k = 0; k < 3; k++) {
          F[i][k] += d[k] * f;
          F[j][k] -= d[k] * f;
        }
      }
    for (const [a, b] of E) {
      const d = [P[b][0] - P[a][0], P[b][1] - P[a][1], P[b][2] - P[a][2]];
      const dist = Math.hypot(...d) || 1;
      const f = (dist - 3.2) * 0.08;
      for (let k = 0; k < 3; k++) {
        F[a][k] += (d[k] / dist) * f;
        F[b][k] -= (d[k] / dist) * f;
      }
    }
    const step = 0.5 * (1 - iter / 400);
    for (let i = 0; i < n; i++) {
      // projects are pulled toward their release-order height so the road reads bottom→top
      if (isProject[i]) F[i][1] += (targetY[i] - P[i][1]) * 0.15;
      for (let k = 0; k < 3; k++) {
        F[i][k] -= P[i][k] * 0.02; // gravity to centre
        P[i][k] += Math.max(-1, Math.min(1, F[i][k])) * step;
      }
    }
  }

  // Normalise: centre and scale so the whole constellation fits a fixed radius.
  const centre = [0, 1, 2].map((k) => P.reduce((s, p) => s + p[k], 0) / n);
  P.forEach((p) => [0, 1, 2].forEach((k) => (p[k] -= centre[k])));
  const maxR = Math.max(...P.map((p) => Math.hypot(p[0], p[1], p[2])));
  const scale = 7.5 / maxR;
  P.forEach((p) => [0, 1, 2].forEach((k) => (p[k] *= scale)));

  const degree = new Map<string, number>();
  connections.forEach((e) => {
    degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
    degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
  });

  const nodes: GNode[] = ids.map((id, i) => {
    const r = resolveRef(id as NodeRef);
    return {
      id,
      kind: r.type,
      label: r.label,
      href: r.type === "concept" ? null : r.href,
      degree: degree.get(id) ?? 0,
      pos: P[i].map((v) => Math.round(v * 100) / 100) as [number, number, number],
      focal: id === "project:avengers-doomsday" || id === "character:doctor-doom",
    };
  });
  const edges: GEdge[] = connections.map(({ id, from, to, status, reason, citation, basis, superseded }) => ({ id, from, to, status, reason, citation, basis, superseded }));
  return { nodes, edges };
}
