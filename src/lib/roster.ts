import { characters, getUniverse, teams, universes } from "./content";
import { getMedia, mediaFor } from "./media";
import type { Art, Media } from "./types";

export type RosterCard = {
  slug: string;
  name: string;
  alias?: string;
  actor?: string;
  summary: string;
  castStatus?: "official" | "not-announced";
  universe?: { slug: string; designation: string; color: string };
  team?: string;
  portrait?: Media;
  art: Art;
  accent: string;
};

const NEUTRAL = "#7dffb0";

/** Each character's team, from the roster. */
function teamOf(slug: string) {
  return teams.find((t) => t.members.some((m) => m.character === slug))?.name;
}

export function rosterCard(slug: string): RosterCard | undefined {
  const c = characters.find((x) => x.slug === slug);
  if (!c) return undefined;
  const u = c.universe ? getUniverse(c.universe) : undefined;
  const portrait = getMedia(c.media?.[0]);
  return {
    slug: c.slug,
    name: c.alias && ["doctor-doom", "cyclops", "gambit"].includes(c.slug) ? c.alias : c.name,
    alias: c.alias && ["doctor-doom", "cyclops", "gambit"].includes(c.slug) ? c.name : c.alias,
    actor: c.actor,
    summary: c.summary,
    castStatus: c.castStatus,
    universe: u ? { slug: u.slug, designation: u.designation, color: u.color } : undefined,
    team: teamOf(c.slug),
    portrait,
    art: c.art,
    accent: portrait?.color ?? u?.color ?? NEUTRAL,
  };
}

/** Spotlight order: the story's key players first. */
const SPOTLIGHT = [
  "doctor-doom", "steve-rogers", "thor", "cyclops", "reed-richards", "loki", "bucky-barnes",
  "gambit", "franklin-richards", "sam-wilson", "he-who-remains", "doctor-strange", "scarlet-witch", "bruce-banner",
];

export function spotlight(): RosterCard[] {
  return SPOTLIGHT.map(rosterCard).filter((c): c is RosterCard => !!c);
}

/** The full official cast, grouped universe → team, with art where a character file has it. */
export function castByUniverse() {
  return universes
    .filter((u) => u.role === "central")
    .map((u) => ({
      slug: u.slug,
      designation: u.designation,
      name: u.name,
      color: u.color,
      teams: teams
        .filter((t) => t.universe === u.slug)
        .map((t) => ({
          slug: t.slug,
          name: t.name,
          universeStatus: t.universeStatus,
          cover: mediaFor(t.media)[0],
          members: t.members.map((m) => {
            const c = m.character ? characters.find((x) => x.slug === m.character) : undefined;
            return {
              name: m.name,
              actor: m.actor,
              note: m.note,
              href: m.character ? `/characters/${m.character}` : null,
              portrait: c ? getMedia(c.media?.[0]) : undefined,
            };
          }),
        })),
    }));
}

export const notAnnounced = () =>
  characters.filter((c) => c.castStatus === "not-announced").map((c) => rosterCard(c.slug)!);

/** Every piece of artwork in the roster, for the header filmstrip. */
export function filmstrip(): Media[] {
  const seen = new Set<string>();
  return characters.flatMap((c) => mediaFor(c.media)).filter((m) => !seen.has(m.id) && seen.add(m.id));
}
