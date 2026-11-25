/**
 * Content schema for The Road to Doomsday.
 *
 * All editorial content lives in /content/*.json. Editors change those files —
 * never application code — to add or correct a project, clue or connection.
 * Run `npm run check-content` after editing to catch broken references.
 */

/** Evidence status — required on every important claim and connection. */
/**
 * Evidence tiers, strongest first.
 * official  – stated by Marvel Studios / Disney (announcements, marvel.com)
 * trailer   – shown or said in an official trailer
 * canon     – established on screen in a released MCU film or series
 * supported – a strong reading of identifiable scenes or clues, not explicitly confirmed
 * theory    – speculation; never presented as fact
 */
export type EvidenceStatus = "official" | "trailer" | "canon" | "supported" | "theory";

/** Where a claim comes from. Comics context must never be presented as MCU canon. */
export type Basis = "mcu" | "comics" | "official-announcement";

export interface Claim {
  text: string;
  status: EvidenceStatus;
  basis?: Basis; // defaults to "mcu"
  /** Exact film/episode and scene, or announcement, where possible. */
  citation?: string;
  /** Set when a claim has been overtaken by later events. */
  superseded?: { date: string; note: string };
  /** Free-text editorial note, e.g. why a claim is uncertain. */
  note?: string;
}

/** Procedural artwork parameters. Every visual on the site is generated from these. */
export type Motif =
  | "branch"
  | "web"
  | "rings"
  | "quantum"
  | "tree"
  | "void"
  | "shield"
  | "ship"
  | "orbit"
  | "eclipse";

export interface Art {
  hue: number; // 0–360
  motif: Motif;
}

export interface Project {
  slug: string;
  /** Three-to-five-word visual caption. */
  tagline: string;
  art: Art;
  title: string;
  kind: "film" | "series";
  releaseDate: string; // ISO date
  /** Episode/season detail, e.g. "Season 1 (6 episodes)". */
  detail?: string;
  /** Why this project matters to the road to Doomsday — one or two sentences. */
  whyItMatters: string;
  events: Claim[];
  upcoming?: boolean;
}

export interface Character {
  slug: string;
  name: string;
  alias?: string;
  summary: string;
  art: Art;
  /** Home universe slug, only when it is established. */
  universe?: string;
  actor?: string;
  /** Whether Marvel's official Doomsday cast list includes this character. */
  castStatus?: "official" | "not-announced";
  /** Media ids from content/media.json; the first is the portrait. */
  media?: string[];
  /** What the MCU has shown or officially stated. */
  mcu: Claim[];
  /** Comic-book background — always rendered separately from MCU material. */
  comics?: Claim[];
  /** Interpretations and theories. */
  open?: Claim[];
  openQuestions?: string[];
}

export interface Concept {
  slug: string;
  name: string;
  summary: string;
  status: EvidenceStatus;
  citation?: string;
}

export type ClueKind =
  | "post-credit"
  | "scene"
  | "dialogue"
  | "reference"
  | "announcement";

export interface Clue {
  slug: string;
  title: string;
  kind: ClueKind;
  project?: string; // project slug
  citation: string;
  /** What is shown or said — observation only. */
  observation: string;
  /** Why it matters — interpretation lives here. */
  relevance: string;
  status: EvidenceStatus;
  basis?: Basis;
  superseded?: { date: string; note: string };
  characters?: string[];
}

export type NodeRef = `${"project" | "character" | "concept"}:${string}`;

export interface Connection {
  id: string;
  from: NodeRef;
  to: NodeRef;
  /** The explanation shown for this edge. Required. */
  reason: string;
  status: EvidenceStatus;
  basis?: Basis;
  citation?: string;
  superseded?: { date: string; note: string };
}

export interface TrailerObservation {
  timestamp: string; // "m:ss"
  shown: string; // what is visibly on screen
  interpretation?: string;
  status: EvidenceStatus;
}

export interface Trailer {
  slug: string;
  title: string;
  publisher: string;
  official: boolean;
  youtubeId: string;
  reviewStatus: "pending" | "in-review" | "reviewed";
  observations: TrailerObservation[];
}

export interface ResearchSource {
  id: string;
  label: string;
  url: string;
  title: string;
  channel: string;
  official: boolean;
  reviewStatus: "pending" | "in-review" | "reviewed";
  editorNote: string;
}

export interface Universe {
  slug: string;
  designation: string; // "Earth-616"
  name: string;
  /** central = one of Doomsday's three universes; peripheral = relevant but not presented as one. */
  role: "central" | "peripheral";
  tagline: string;
  color: string;
  /** How well the Earth number itself is established. */
  designationStatus: EvidenceStatus;
  designationSource: string;
  teams: string[];
  projects: string[];
  facts: Claim[];
  unknowns: string[];
}

export interface TeamMember {
  name: string;
  actor: string;
  /** Media id for a roster portrait when the member has no character file. */
  portrait?: string;
  /** Character file slug, when one exists. */
  character?: string;
  note?: string;
}

export interface Team {
  slug: string;
  name: string;
  universe: string;
  /** Set when the team's universe is not established fact (e.g. the X-Men). */
  universeStatus?: EvidenceStatus;
  summary: string;
  members: TeamMember[];
  media?: string[];
}

/** A documented link between two universes, drawn on the universe map. */
export interface Crossing {
  id: string;
  from: string; // universe slug
  to: string;
  label: string;
  /** Short label drawn on the map; the full label titles the detail panel. */
  short?: string;
  evidence: Claim[];
}

export type MediaKind = "illustration" | "poster" | "comic" | "photo" | "still";

/** An image supplied by the site owner, processed by `npm run images`. */
export interface Media {
  id: string;
  kind: MediaKind;
  alt: string;
  /** CSS object-position keeping the subject in frame when cropped. */
  focus: string;
  subjects: string[];
  src: string;
  width: number;
  height: number;
  blur: string;
  /** Accent colour sampled from the artwork. */
  color: string;
}

export interface Update {
  date: string;
  title: string;
  href: string;
  source: string;
}

/**
 * A fan theory for the Theory Vault (content/theories.json). The theory itself
 * is always speculation; its `evidence` are real, labelled facts fans point to.
 */
export interface Theory {
  slug: string;
  /** Two-digit file number shown on the dossier ("07"). */
  file: string;
  /** A short code name for the file ("Iron Mask"). */
  codename: string;
  title: string;
  /** The theory, in two or three sentences. */
  claim: string;
  /** What fans point to: real facts, each with its own evidence label. */
  evidence: Claim[];
  /** Reasons it may be wrong. */
  against: string[];
  /** Editor's read, 1 (unlikely) to 5 (very plausible). */
  plausibility: 1 | 2 | 3 | 4 | 5;
  characters?: string[];
  projects?: string[];
  /** Media id for the file's image. */
  image?: string;
  /** Where the theory is discussed. */
  sources: { label: string; url: string }[];
}
