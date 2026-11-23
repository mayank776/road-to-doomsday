import projectsJson from "../../content/projects.json";
import charactersJson from "../../content/characters.json";
import conceptsJson from "../../content/concepts.json";
import cluesJson from "../../content/clues.json";
import connectionsJson from "../../content/connections.json";
import researchJson from "../../content/research.json";
import { validateContent } from "./validate-content.mjs";
import type {
  Character,
  Clue,
  Concept,
  Connection,
  NodeRef,
  Project,
  ResearchSource,
  Trailer,
  Update,
} from "./types";

export const projects = (projectsJson as Project[])
  .slice()
  .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
export const characters = charactersJson as Character[];
export const concepts = conceptsJson as Concept[];
export const clues = cluesJson as Clue[];
export const connections = connectionsJson as Connection[];
export const trailers = researchJson.trailers as Trailer[];
export const sources = researchJson.sources as ResearchSource[];
export const updates = (researchJson.updates as Update[])
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));

// Fail the build on broken content rather than shipping a bad link or unlabelled claim.
const problems = validateContent({
  projects,
  characters,
  concepts,
  clues,
  connections,
  research: researchJson,
});
if (problems.length) {
  throw new Error("Content validation failed:\n- " + problems.join("\n- "));
}

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const getCharacter = (slug: string) => characters.find((c) => c.slug === slug);
export const getClue = (slug: string) => clues.find((c) => c.slug === slug);
export const cluesForProject = (slug: string) => clues.filter((c) => c.project === slug);
export const cluesForCharacter = (slug: string) =>
  clues.filter((c) => c.characters?.includes(slug));

export function resolveRef(ref: NodeRef) {
  const [type, slug] = ref.split(":") as ["project" | "character" | "concept", string];
  if (type === "project") {
    const p = getProject(slug)!;
    return { type, slug, label: p.detail ? `${p.title} (${p.detail.replace("Season ", "S")})` : p.title, href: `/timeline/${slug}` };
  }
  if (type === "character") {
    const c = getCharacter(slug)!;
    return { type, slug, label: c.alias && slug === "doctor-doom" ? c.alias : c.name, href: `/characters/${slug}` };
  }
  const c = concepts.find((x) => x.slug === slug)!;
  return { type, slug, label: c.name, href: `/connections?focus=concept:${slug}` };
}

export const connectionsFor = (ref: NodeRef) =>
  connections.filter((e) => e.from === ref || e.to === ref);

export { formatDate } from "./format";
