// Shared content validator. Plain JS so both the Next.js build and
// `npm run check-content` (node scripts/check-content.mjs) can use it.

const STATUSES = new Set(["official", "trailer", "canon", "supported", "theory"]);
const BASES = new Set(["mcu", "comics", "official-announcement"]);
const CLUE_KINDS = new Set(["post-credit", "scene", "dialogue", "reference", "announcement"]);
const REVIEW = new Set(["pending", "in-review", "reviewed"]);

/** @returns {string[]} list of human-readable problems; empty when valid */
export function validateContent({ projects, characters, concepts, clues, connections, research, universes = /** @type {any[]} */ ([]), teams = /** @type {any[]} */ ([]), crossings = /** @type {any[]} */ ([]), mediaIds = /** @type {Set<string> | null} */ (null), mediaSubjects = /** @type {{ id: string, subjects: string[] }[]} */ ([]) }) {
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

  const universeSlugs = unique(universes, "slug", "universes");
  const teamSlugs = unique(teams, "slug", "teams");
  for (const u of universes) {
    const w = `universe ${u.slug}`;
    if (!["central", "peripheral"].includes(u.role)) err(w, "role must be central or peripheral");
    if (!STATUSES.has(u.designationStatus)) err(w, "invalid designationStatus");
    if (!u.designationSource) err(w, "missing designationSource");
    for (const t of u.teams ?? []) if (!teamSlugs.has(t)) err(w, `unknown team "${t}"`);
    for (const p of u.projects ?? []) if (!projectSlugs.has(p)) err(w, `unknown project "${p}"`);
    (u.facts ?? []).forEach((c, i) => checkClaim(`${w} fact ${i}`, c));
  }
  if (universes.filter((u) => u.role === "central").length !== 3 && universes.length)
    err("universes", "Marvel states three central universes; exactly three must be central");
  for (const t of teams) {
    const w = `team ${t.slug}`;
    if (!universeSlugs.has(t.universe)) err(w, `unknown universe "${t.universe}"`);
    if (t.universeStatus && !STATUSES.has(t.universeStatus)) err(w, "invalid universeStatus");
    for (const m of t.members ?? []) {
      if (!m.name || !m.actor) err(w, "member needs name and actor");
      if (m.character && !characterSlugs.has(m.character)) err(w, `unknown character "${m.character}"`);
    }
  }
  if (mediaIds) {
    for (const x of [...characters, ...teams])
      for (const id of x.media ?? []) if (!mediaIds.has(id)) err(`${x.slug}`, `unknown or unprocessed media "${id}" (run npm run images)`);
    for (const t of teams) for (const m of t.members ?? []) if (m.portrait && !mediaIds.has(m.portrait)) err(`team ${t.slug}`, `unknown portrait "${m.portrait}"`);
  }
  // every image tag must name real content (or a reserved tag), so a typo cannot silently hide an image
  const TAGS = new Set(["comics", "texture", ...projectSlugs, ...characterSlugs, ...conceptSlugs, ...clues.map((c) => c.slug), ...universeSlugs, ...teams.map((t) => t.slug)]);
  for (const m of mediaSubjects) for (const s of m.subjects ?? []) if (!TAGS.has(s)) err(`media ${m.id}`, `unknown subject "${s}"`);
  unique(crossings, "id", "crossings");
  for (const x of crossings) {
    const w = `crossing ${x.id}`;
    if (!universeSlugs.has(x.from) || !universeSlugs.has(x.to)) err(w, "unknown universe");
    if (!x.label) err(w, "missing label");
    if (!x.evidence?.length) err(w, "every crossing needs evidence");
    (x.evidence ?? []).forEach((c, i) => checkClaim(`${w} evidence ${i}`, c));
  }
  for (const c of characters) {
    if (c.universe && !universeSlugs.has(c.universe) && universes.length) err(`character ${c.slug}`, `unknown universe "${c.universe}"`);
    if (c.castStatus && !["official", "not-announced"].includes(c.castStatus)) err(`character ${c.slug}`, "invalid castStatus");
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
