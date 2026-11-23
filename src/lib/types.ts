/**
 * Content schema for The Road to Doomsday.
 *
 * All editorial content lives in /content/*.json. Editors change those files —
 * never application code — to add or correct a project, clue or connection.
 * Run `npm run validate` after editing to catch broken references.
 */

/** Evidence status — required on every important claim and connection. */
export type EvidenceStatus = "confirmed" | "supported" | "theory";

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

export interface Update {
  date: string;
  title: string;
  href: string;
  source: string;
}
