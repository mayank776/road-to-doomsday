# The Road to Doomsday — MVP

An evidence-labelled guide to the MCU threads leading into *Avengers: Doomsday*.
It is built from `../road_to_doomsday_mvp_plan.docx`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # validates content, then builds 40 static pages
```

## Visual stack

Every visual is generated in code. The site uses no image assets.

| Layer | Library | Used for |
|---|---|---|
| 3D | three + @react-three/fiber + drei + postprocessing | Multiverse particle hero (custom GLSL), Doom 3D object, 3D story constellation, bloom |
| Scroll | GSAP ScrollTrigger + SplitText, Lenis | Pinned horizontal road, scroll-driven camera, kinetic headlines, smooth scroll |
| UI motion | Motion | Flip cards, filter layout animations, mobile menu, evidence panel |
| Art | `src/components/visual/generative-art.tsx` | Deterministic SVG posters from each entry's `art: { hue, motif }` in the content JSON |

3D canvases pause rendering when offscreen. All motion respects `prefers-reduced-motion`.

## Pages

| Route | Plan feature |
|---|---|
| `/` | Homepage: hero, four entry points, key threads, evidence legend, latest additions |
| `/timeline`, `/timeline/[slug]` | Interactive MCU timeline + project detail pages |
| `/characters/doctor-doom` (+ `/characters/[slug]`) | Doom dossier with MCU facts, comics context and theories kept apart |
| `/connections` | 3D constellation explorer with a reason and status on every edge (`?focus=character:doctor-doom`) |
| `/clues`, `/clues/[slug]` | Clue explorer with evidence/type/project filters |
| `/trailer` | Trailer breakdown: timestamped "shown" kept apart from "interpretation" |
| `/sources` | Editorial rules + the four research videos |

## Editing content (no code changes)

All content is JSON in `content/`:

- `projects.json`: films and series, each with `events` (claims), a `tagline` and `art` (hue 0–360 + motif)
- `characters.json`: `mcu`, `comics`, `open` claim lists + `openQuestions`
- `concepts.json`: multiverse, incursions, etc.
- `clues.json`: observation / relevance / citation / status
- `connections.json`: `from`/`to` refs like `project:thunderbolts`, plus `reason` and `status`
- `research.json`: trailers (with `observations`), research sources, "latest additions"

Every claim needs a `status` of `confirmed`, `supported` or `theory`. Comics material uses `"basis": "comics"`.
Dropped storylines get a `superseded: { date, note }` rather than being deleted.

Run `npm run validate`. It reports broken references, missing reasons, invalid statuses,
comics claims filed under MCU facts, and badly formatted trailer timestamps. `npm run build` runs the same check
and fails if the content is invalid.

## Not done yet (per plan)

- **Fact-check pass (Day 7):** the seed content was written from memory and has not yet been checked against the films.
- **Trailer observations:** the official Final Trailer is queued, but no timestamps have been logged yet. Someone needs to watch it.
- **Research videos:** titles and channels are recorded; their actual claims still need review.
- **Postgres + Prisma, Vercel deploy:** deferred. JSON is the plan's allowed MVP content model.
