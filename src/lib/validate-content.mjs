// Shared content validator. Plain JS so both the Next.js build and
// `npm run validate` (node scripts/validate.mjs) can use it.

const STATUSES = new Set(["confirmed", "supported", "theory"]);
const BASES = new Set(["mcu", "comics", "official-announcement"]);
const CLUE_KINDS = new Set(["post-credit", "scene", "dialogue", "reference", "announcement"]);
const REVIEW = new Set(["pending", "in-review", "reviewed"]);

/** @returns {string[]} list of human-readable problems; empty when valid */
export function validateContent({ projects, characters, concepts, clues, connections, research }) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);

  const checkClaim = (where, c) => {
    if (!c || typeof c.text !== "string" || !c.text.trim()) err(where, "claim needs text");
    if (!STATUSES.has(c?.status)) err(where, `invalid status "${c?.status}"`);
    if (c?.basis && !BASES.has(c.basis)) err(where, `invalid basis "${c.basis}"`);
    if (c?.superseded && (!c.superseded.date || !c.superseded.note))
      err(where, "superseded needs date and note");
  };

  const unique = (list, key, label) => {
    const seen = new Set();
    for (const item of list) {
      if (!item[key]) err(label, `entry missing ${key}`);
      if (seen.has(item[key])) err(label, `duplicate ${key} "${item[key]}"`);
      seen.add(item[key]);
    }
    return seen;
  };

  const projectSlugs = unique(projects, "slug", "projects");
  const characterSlugs = unique(characters, "slug", "characters");
  const conceptSlugs = unique(concepts, "slug", "concepts");
  unique(clues, "slug", "clues");
  unique(connections, "id", "connections");

  const MOTIFS = new Set(["branch", "web", "rings", "quantum", "tree", "void", "shield", "ship", "orbit", "eclipse"]);
  const checkArt = (where, art) => {
    if (!art || typeof art.hue !== "number" || art.hue < 0 || art.hue > 360) err(where, "art.hue must be 0–360");
    if (!MOTIFS.has(art?.motif)) err(where, `art.motif must be one of ${[...MOTIFS].join(", ")}`);
  };
  projects.forEach((p) => {
    checkArt(`project ${p.slug}`, p.art);
    if (!p.tagline) err(`project ${p.slug}`, "missing tagline");
  });
  characters.forEach((c) => checkArt(`character ${c.slug}`, c.art));

  for (const p of projects) {
    if (Number.isNaN(Date.parse(p.releaseDate))) err(`project ${p.slug}`, "bad releaseDate");
    if (!p.whyItMatters) err(`project ${p.slug}`, "missing whyItMatters");
    (p.events ?? []).forEach((c, i) => checkClaim(`project ${p.slug} event ${i}`, c));
  }
  for (const ch of characters) {
    for (const k of ["mcu", "comics", "open"])
      (ch[k] ?? []).forEach((c, i) => checkClaim(`character ${ch.slug} ${k}[${i}]`, c));
    (ch.comics ?? []).forEach((c, i) => {
      if (c.basis !== "comics") err(`character ${ch.slug} comics[${i}]`, 'comics claims must have basis "comics"');
    });
    (ch.mcu ?? []).forEach((c, i) => {
      if (c.basis === "comics") err(`character ${ch.slug} mcu[${i}]`, "comics claim placed under MCU facts");
    });
  }
  for (const c of concepts) if (!STATUSES.has(c.status)) err(`concept ${c.slug}`, "invalid status");

  for (const cl of clues) {
    const w = `clue ${cl.slug}`;
    if (!CLUE_KINDS.has(cl.kind)) err(w, `invalid kind "${cl.kind}"`);
    if (cl.project && !projectSlugs.has(cl.project)) err(w, `unknown project "${cl.project}"`);
    for (const s of cl.characters ?? []) if (!characterSlugs.has(s)) err(w, `unknown character "${s}"`);
    if (!cl.citation) err(w, "missing citation");
    if (!cl.observation || !cl.relevance) err(w, "needs observation and relevance");
    checkClaim(w, { text: cl.title, status: cl.status, basis: cl.basis, superseded: cl.superseded });
  }

  const refExists = (ref) => {
    const [type, slug] = String(ref).split(":");
    if (type === "project") return projectSlugs.has(slug);
    if (type === "character") return characterSlugs.has(slug);
    if (type === "concept") return conceptSlugs.has(slug);
    return false;
  };
  for (const e of connections) {
    const w = `connection ${e.id}`;
    if (!refExists(e.from)) err(w, `unknown from "${e.from}"`);
    if (!refExists(e.to)) err(w, `unknown to "${e.to}"`);
    if (!e.reason?.trim()) err(w, "every connection needs a reason");
    checkClaim(w, { text: e.reason, status: e.status, basis: e.basis, superseded: e.superseded });
  }

  for (const t of research.trailers ?? []) {
    const w = `trailer ${t.slug}`;
    if (!REVIEW.has(t.reviewStatus)) err(w, "invalid reviewStatus");
    (t.observations ?? []).forEach((o, i) => {
      if (!/^\d{1,2}:\d{2}$/.test(o.timestamp ?? "")) err(`${w} obs ${i}`, "timestamp must be m:ss");
      if (!o.shown) err(`${w} obs ${i}`, "needs 'shown'");
      if (!STATUSES.has(o.status)) err(`${w} obs ${i}`, "invalid status");
    });
  }
  for (const s of research.sources ?? [])
    if (!REVIEW.has(s.reviewStatus)) err(`source ${s.id}`, "invalid reviewStatus");

  return errors;
}
