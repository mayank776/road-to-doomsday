import { crossings, getCharacter, getProject, teamsFor, universes } from "./content";
import { bannerFor, coverFor, getMedia } from "./media";
import type { Art, Claim, Crossing, EvidenceStatus, Media, Universe } from "./types";

export type AtlasMember = { name: string; actor: string; href: string | null; note?: string; portrait?: Media };
export type AtlasTeam = { slug: string; name: string; summary: string; universeStatus?: EvidenceStatus; members: AtlasMember[] };
export type AtlasProject = { slug: string; title: string; year: string; art: Art; cover?: Media };
export type AtlasUniverse = Omit<Universe, "teams" | "projects"> & { teams: AtlasTeam[]; projects: AtlasProject[]; castCount: number; cover?: Media };
export type Atlas = {
  universes: AtlasUniverse[];
  crossings: Crossing[];
  doom: { name: string; actor: string; href: string; facts: Claim[] };
};

/** Everything the universe map needs, resolved to plain serialisable data. */
export function buildAtlas(): Atlas {
  const doom = getCharacter("doctor-doom")!;
  return {
    universes: universes.map((u) => {
      const teams = teamsFor(u.slug).map((t) => ({
        slug: t.slug,
        name: t.name,
        summary: t.summary,
        universeStatus: t.universeStatus,
        members: t.members.map((m) => ({
          name: m.name,
          actor: m.actor,
          note: m.note,
          href: m.character ? `/characters/${m.character}` : null,
          portrait: m.character ? getMedia(getCharacter(m.character)?.media?.[0]) : undefined,
        })),
      }));
      return {
        ...u,
        teams,
        castCount: teams.reduce((n, t) => n + t.members.length, 0),
        cover: bannerFor(u.slug),
        projects: u.projects.map((s) => {
          const p = getProject(s)!;
          return { slug: p.slug, title: p.title + (p.detail ? ` (${p.detail})` : ""), year: p.releaseDate.slice(0, 4), art: p.art, cover: coverFor(p.slug) };
        }),
      };
    }),
    crossings,
    doom: {
      name: "Doctor Doom",
      actor: doom.actor ?? "Robert Downey Jr.",
      href: "/characters/doctor-doom",
      facts: doom.mcu.filter((c) => c.status === "official" || c.status === "trailer").slice(0, 3),
    },
  };
}
