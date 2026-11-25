# How this website works

**A beginner-friendly tour of the whole codebase of *The Road to Doomsday*.**

You don't need to know web development to follow this guide. Every term is explained the first time it appears, and there's a glossary in section 2. Read it top to bottom once. After that, use the table of contents to jump to what you need.

- **Live site:** https://road-to-doomsday-nu.vercel.app
- **Code:** https://github.com/mayank776/road-to-doomsday
- **Where this file lives:** `doomsday/web/HOW-THIS-WEBSITE-WORKS.md`

---

## Contents

1. [What the site is, in one minute](#1-what-the-site-is-in-one-minute)
2. [Words you'll meet (glossary)](#2-words-youll-meet-glossary)
3. [Run it on your computer](#3-run-it-on-your-computer)
4. [The big picture: how a page gets made](#4-the-big-picture-how-a-page-gets-made)
5. [Folder map: every folder and file](#5-folder-map-every-folder-and-file)
6. [The content: JSON files you edit](#6-the-content-json-files-you-edit)
7. [Images: from your folder to the page](#7-images-from-your-folder-to-the-page)
8. [`src/lib/`: the data helpers](#8-srclib-the-data-helpers)
9. [`src/app/`: the pages](#9-srcapp-the-pages)
10. [`src/components/`: the building blocks](#10-srccomponents-the-building-blocks)
11. [Styling: colours, fonts and Tailwind](#11-styling-colours-fonts-and-tailwind)
12. [Animation and motion](#12-animation-and-motion)
13. [Phones vs desktop](#13-phones-vs-desktop)
14. [Recipes: common changes, step by step](#14-recipes-common-changes-step-by-step)
15. [Checking your work and publishing](#15-checking-your-work-and-publishing)
16. [When something goes wrong](#16-when-something-goes-wrong)
17. [House rules (conventions)](#17-house-rules-conventions)

---

## 1. What the site is, in one minute

*The Road to Doomsday* is a fan-made, **evidence-labelled** guide to the Marvel films and series that lead into *Avengers: Doomsday* (in cinemas 18 December 2026).

Every important statement on the site carries one of five **evidence labels**, so a reader always knows how sure we are:

| Label | Colour | Meaning |
|---|---|---|
| **Official** | green `#34d399` | Stated by Marvel Studios or Disney (announcements, marvel.com) |
| **Trailer** | cyan `#22d3ee` | Shown or said in an official trailer |
| **Canon** | blue `#8fb4ff` | Happened on screen in a released MCU film or series |
| **Supported** | amber `#fbbf24` | A strong reading of real scenes, not confirmed |
| **Theory** | violet `#c4a1ff` | Speculation, never presented as fact |

Comic-book background is kept separate and shown in pink (`#f472b6`). It is never mixed up with MCU facts.

**The key idea of the codebase:** all the *facts* live in plain data files (`content/*.json`), and all the *design* lives in code (`src/`). To fix a fact you edit a JSON file. You never need to touch the page code for that.

---

## 2. Words you'll meet (glossary)

| Term | Plain-English meaning |
|---|---|
| **HTML** | The structure of a web page: headings, paragraphs, images, links. |
| **CSS** | The styling: colours, sizes, spacing and layout. |
| **JavaScript (JS)** | The programming language browsers run. It makes pages interactive. |
| **TypeScript (TS)** | JavaScript plus *types*, labels that say what shape each piece of data has (for example "a title is text"). Mistakes are caught before the site runs. Files end in `.ts`, or `.tsx` when they contain page markup. |
| **React** | A library for building pages out of reusable pieces called **components**. |
| **Component** | A function that returns a piece of page, for example `<CharacterCard />`. Its name starts with a capital letter. |
| **Props** | The inputs you give a component, like `<CharacterCard c={steve} />`. Here `c` is a prop. |
| **State** | Data a component remembers and can change, like "is the menu open?". When it changes, React redraws that part of the page. Created with `useState`. |
| **Hook** | A React function whose name starts with `use` (`useState`, `useEffect`, `useRef`…) that gives a component extra powers. |
| **JSX** | The HTML-looking syntax inside `.tsx` files (`<div className="…">`). It's still JavaScript underneath. |
| **Next.js** | The framework around React. It turns folders into web addresses, builds the pages, and optimises images and fonts. This site uses Next.js 16 with the **App Router**. |
| **Route** | A web address the site answers, like `/timeline`. In Next.js, the folder `src/app/timeline/` with a `page.tsx` inside *is* the `/timeline` route. |
| **Dynamic route** | A folder in square brackets like `[slug]` that matches many addresses: `/timeline/loki-season-1`, `/timeline/thunderbolts`… |
| **Slug** | A short, URL-safe id like `doctor-doom` or `loki-season-1`. Every film, character and clue has one. |
| **Server component** | A component that runs while the site is *built*, not in the visitor's browser. It's fast and sends no JavaScript. This is the default. |
| **Client component** | A component that also runs *in the browser*, needed for anything interactive (clicks, scrolling, animation). Marked by `"use client";` on the file's first line. |
| **Static site / build** | `npm run build` produces every page in advance as ready-made HTML, so the live site just hands out finished files. |
| **Hydration** | When the browser receives the ready-made HTML and React "wakes it up" so buttons and animations work. The HTML from the server and the browser's first render must match, or React complains (a *hydration mismatch*). |
| **Tailwind CSS** | A styling approach where you write small class names directly on elements (`text-xl`, `px-4`, `bg-ink`) instead of separate CSS rules. See section 11. |
| **JSON** | A plain text data format: `{ "name": "Thor", "actor": "Chris Hemsworth" }`. All the site's content is JSON. |
| **npm** | Node's package manager. It installs libraries (`npm install`) and runs this project's commands (`npm run dev`). |
| **Node.js** | Lets JavaScript run on your computer (outside the browser). Needed for development and building. |
| **GSAP** | An animation library. **ScrollTrigger** (part of GSAP) ties animations to scrolling, and **SplitText** splits a heading into letters so each can animate. |
| **Lenis** | A library that makes mouse-wheel scrolling smooth. |
| **Motion** | Another animation library (formerly Framer Motion), used for things like flipping cards and opening the menu. |
| **three.js / React Three Fiber (R3F)** | Libraries for 3D graphics in the browser. Used only for Doom's spinning 3D sigil. |
| **next/image** | Next.js's image component: serves the right size for each screen and shows a blurred preview while loading. |
| **Vercel** | The hosting service that serves the live site. |
| **Git / GitHub** | Git records every change to the code. GitHub stores that history online. |

---

## 3. Run it on your computer

You need **Node.js 20 or newer** (download from nodejs.org). Then, in a terminal:

```powershell
cd "doomsday/web"
npm install          # once: downloads the libraries into node_modules/
npm run dev          # starts a local copy at http://localhost:3000
```

Open http://localhost:3000. Saving any file refreshes the page automatically.

All the commands (defined in `package.json` under `"scripts"`):

| Command | What it does |
|---|---|
| `npm run dev` | Local development server with live reload. |
| `npm run build` | Checks the content, then builds the production site into `.next/`. |
| `npm run start` | Serves the built site locally (run `build` first). |
| `npm run lint` | Checks the code for common mistakes (ESLint). |
| `npm run check-content` | Checks every JSON file for broken links between items and missing evidence. Runs automatically before every build. |
| `npm run images` | Processes the images in `assets/` into web-ready files (section 7). |

> **Tip:** if the dev server ever shows stale data after you edit JSON, stop it (Ctrl+C) and start it again.

---

## 4. The big picture: how a page gets made

```
 content/*.json            your facts (films, characters, clues…)
 content/media.json        your image catalogue
        │
        ▼
 src/lib/                  loads the JSON, checks it, joins it together
 (content.ts, media.ts,    e.g. "give me Steve's portrait and his team"
  cast-roster.ts …)
        │
        ▼
 src/app/**/page.tsx       one file per page: asks lib/ for data,
                           lays out sections using components
        │
        ▼
 src/components/**         reusable pieces: cards, heroes, maps,
                           animations
        │
        ▼
 npm run build             Next.js renders every page to HTML
        │
        ▼
 Vercel                    serves the finished pages to visitors
```

Two moments matter:

1. **Build time** (on your computer or Vercel). Server components run, read the JSON, and produce HTML. The content check runs here too: **if the content is broken, the build fails**, so a bad fact can never go live.
2. **In the browser.** Only the client components (`"use client"`) run here: menus, animations, the countdown, the universe map, the thread explorer.

---

## 5. Folder map: every folder and file

```
doomsday/
├── ASSET_REQUESTS.md               list of images still wanted
├── road_to_doomsday_mvp_plan.docx  the original product plan
└── web/                            ← the website (everything below)
    ├── HOW-THIS-WEBSITE-WORKS.md   this guide
    ├── README.md                   short overview
    ├── package.json                libraries used + npm commands
    ├── next.config.ts              Next.js settings (defaults)
    ├── tsconfig.json               TypeScript settings ("@/" means "src/")
    ├── eslint.config.mjs           lint rules
    ├── postcss.config.mjs          wires Tailwind into the CSS build
    ├── .gitignore / .vercelignore  files kept out of Git / out of uploads
    │
    ├── assets/                     YOUR original images (not uploaded; see 7)
    ├── public/media/               processed images the site serves
    │
    ├── content/                    ALL the facts (section 6)
    │   ├── projects.json           films & series on the road
    │   ├── characters.json         character files
    │   ├── teams.json              the official cast, by team
    │   ├── universes.json          Earth-616, 828, 10005 (+838, 1127)
    │   ├── crossings.json          links between universes on the map
    │   ├── clues.json              post-credit scenes, lines, announcements
    │   ├── connections.json        threads between films/characters/ideas
    │   ├── concepts.json           ideas: multiverse, incursions…
    │   ├── research.json           trailers, research sources, update feed
    │   ├── media.json              image catalogue (you edit)
    │   └── media.generated.json    image sizes/colours (generated, don't edit)
    │
    ├── scripts/                    command-line helpers
    │   ├── check-content.mjs       `npm run check-content`
    │   └── process-images.mjs      `npm run images`
    │
    └── src/                        the code
        ├── app/                    PAGES (one folder per web address)
        ├── components/             BUILDING BLOCKS
        └── lib/                    DATA HELPERS
```

Each folder in `src/` is covered in sections 8–10.

---

## 6. The content: JSON files you edit

All facts live here. The shapes are defined precisely in **`src/lib/types.ts`**. When in doubt, read that file: every field has a comment.

### The evidence "claim"

Most facts are written as a **claim**, used in many files:

```json
{
  "text": "Robert Downey Jr. is announced as Victor von Doom.",
  "status": "official",
  "citation": "SDCC Hall H, 27 July 2024",
  "basis": "official-announcement",
  "superseded": { "date": "2024-07-27", "note": "Kang was dropped as the saga's villain." }
}
```

- `text` and `status` are **required**. `status` must be one of `official`, `trailer`, `canon`, `supported`, `theory`.
- `citation`: exactly where it comes from (film and scene, or announcement and date).
- `basis` (optional): `mcu` (default), `comics` or `official-announcement`.
- `superseded` (optional): marks a claim that later events overtook. It's shown struck through rather than deleted.

### Each file

| File | One entry is… | Key fields |
|---|---|---|
| `projects.json` | a film or series | `slug`, `title`, `kind` (`film`/`series`), `releaseDate` (`YYYY-MM-DD`), `detail` ("Season 2"), `tagline`, `whyItMatters`, `events` (claims), `art` (fallback artwork), `upcoming` |
| `characters.json` | a character file | `slug`, `name`, `alias`, `actor`, `summary`, `universe` (only when established), `castStatus` (`official`/`not-announced`), `media` (image ids, **first = portrait**), `mcu` / `comics` / `open` (claims), `openQuestions` |
| `teams.json` | a team in the official cast | `slug`, `name`, `universe`, `universeStatus`, `summary`, `media`, `members` (each `{ name, actor, character?, portrait?, note? }`) |
| `universes.json` | an Earth | `slug`, `designation` ("Earth-616"), `role` (`central`/`peripheral`), `color`, `designationStatus`, `designationSource`, `teams`, `projects`, `facts`, `unknowns`. **Exactly three must be central.** |
| `crossings.json` | a line between two Earths on the map | `id`, `from`, `to` (universe slugs), `label`, `short`, `evidence` (claims) |
| `clues.json` | a clue | `slug`, `title`, `kind` (`post-credit`/`scene`/`dialogue`/`reference`/`announcement`), `project`, `citation`, `observation` (*what is shown*), `relevance` (*why it matters*), `status`, `characters` |
| `connections.json` | a thread | `id`, `from`, `to` (written `project:slug`, `character:slug` or `concept:slug`), `reason`, `status`, `citation`, `superseded` |
| `concepts.json` | an idea | `slug`, `name`, `summary`, `status`, `citation` |
| `research.json` | trailers, sources, updates | `trailers[]` (YouTube id, observations with timestamps), `sources[]`, `updates[]` (the "Latest additions" list on the homepage) |

### How files point at each other

Entries refer to each other **by slug**: a clue's `"project": "thunderbolts"`, a team member's `"character": "steve-rogers"`, a connection's `"from": "character:loki"`. `npm run check-content` verifies that every slug points at something real, so a typo is caught before it goes live.

### `art`: the fallback artwork

Entries that might not have an image carry `"art": { "hue": 140, "motif": "eclipse" }`. If no photo exists, `src/components/effects/generative-art.tsx` draws an abstract poster from these two numbers: a colour (0–360 on the colour wheel) and a pattern (`branch`, `web`, `rings`, `quantum`, `tree`, `void`, `shield`, `ship`, `orbit`, `eclipse`). The same inputs always draw the same picture.

---

## 7. Images: from your folder to the page

```
web/assets/Doom.png                  ① you drop the original here
        │
content/media.json                   ② you add one catalogue entry
        │      { "id": "doom-still", "file": "Doom.png", "kind": "still",
        │        "alt": "...", "subjects": ["doctor-doom"], "focus": "50% 35%" }
        ▼
npm run images                       ③ scripts/process-images.mjs
        │   rotates, caps the size at 2400px, compresses to JPG,
        │   makes a tiny blurred preview, samples an accent colour
        ▼
public/media/doom-still.jpg          ④ the file the site serves
content/media.generated.json         ⑤ its width, height, blur and colour
```

**Catalogue fields (`media.json`):**

- `id`: the name used everywhere else (`doom-still`).
- `file`: the exact filename in `assets/`.
- `kind`: `poster`, `still` (film frame), `photo`, `illustration` or `comic`. Shown as a label under the image.
- `alt`: a description for screen readers and search engines. Describe what's visible; don't claim facts you can't verify.
- `subjects`: **tags**: slugs of the films, characters, clues, universes, teams or concepts the image shows. Plus two reserved tags: `comics` and `texture` (backgrounds).
- `focus`: which part stays in view when the image is cropped (`"50% 30%"` = centre horizontally, upper third vertically).
- `crop` (optional): `[x, y, width, height]` as fractions (0–1) to cut a region out of the original. Used to make cast portraits from a group poster, or to leave out a magazine's masthead.

**How images get picked:** there are two ways (see `src/lib/media.ts`):

1. **Explicit lists.** A character's `media` array in `characters.json` (first = portrait), a team's `media`, a team member's `portrait`.
2. **By tag.** Anywhere else, the code asks "the first image tagged with this slug": `coverFor("thunderbolts")` gives the Thunderbolts poster. `coverFor(clue.slug, clue.project)` tries the clue first, then falls back to its film. **Order in `media.json` matters:** earlier entries win.

The original images in `assets/` are kept out of Git and out of the upload (see `.gitignore` and `.vercelignore`). Only the processed copies in `public/media/` go live. The share image shown when someone posts the link (`src/app/opengraph-image.jpg`) is also generated by `npm run images`, from the `doomsday-title` image.

---

## 8. `src/lib/`: the data helpers

These files contain **no page design**, only data. They run at build time.

| File | What it does |
|---|---|
| `types.ts` | The shape of every piece of content (see section 6). Start here when reading any JSON. |
| `content.ts` | **Loads every JSON file**, sorts projects by date, runs the content check, and offers lookups: `getProject(slug)`, `getCharacter(slug)`, `getClue(slug)`, `cluesForProject(slug)`, `cluesForCharacter(slug)`, `getUniverse(slug)`, `teamsFor(universe)`, `connectionsFor(ref)`, and `resolveRef("character:loki")` → name and link. |
| `validate-content.mjs` | The content checker: unique slugs, valid statuses, every reference exists, exactly three central universes, every crossing has evidence, every image id and tag is real. Plain JavaScript so both the build and `npm run check-content` can use it. Returns a list of problems; empty means valid. |
| `media.ts` | The image catalogue joined with its generated sizes. `getMedia(id)`, `mediaFor([ids])`, `mediaAbout(slug)` (all images tagged with a slug), `coverFor(...slugs)` (first match), `bannerFor(slug)` (prefers a wide image), `isWide(image)`. |
| `media-kind-labels.ts` | The display names for each image kind ("Film still", "Poster art"…). Kept separate so browser code can use it without loading the whole catalogue. |
| `cast-roster.ts` | Builds what the Characters page needs: `rosterCard(slug)` (name, actor, universe, team, portrait, accent colour), `spotlight()` (the main cards, in story order), `castByUniverse()` (Earth → team → members with portraits), `filmstrip()` (all character art for the header). |
| `universe-map-data.ts` | `buildUniverseMapData()`: everything the universe map draws, flattened into simple data: each Earth with its teams, members, portraits, banner image, projects and posters, plus the crossings and Doom's key facts. |
| `connection-threads.ts` | `buildConnectionThreads()`: the nodes (each film, character or concept that has a connection, with its image) and edges (the connections) for the Connections page. |
| `site-map.ts` | **The list of every page**, in reading order, with a one-line description and tile image. The header, mobile menu, footer, homepage "What's inside" tiles and the previous/next links all read it. `neighbours(path)` gives the page before and after. |
| `format-date.ts` | `formatDate("2026-12-18")` → "18 Dec 2026". |

---

## 9. `src/app/`: the pages

In Next.js **the folder path is the web address**. Each `page.tsx` is one page. `layout.tsx` wraps every page.

| File | Address | What's on it |
|---|---|---|
| `layout.tsx` | (every page) | Loads the three fonts (Anton for display headings, Inter for body text, JetBrains Mono for labels). Adds the skip-to-content link, smooth scrolling, custom cursor, header, footer and back-to-top button around every page. Sets the default page title and description. |
| `globals.css` | (every page) | Colours, fonts, keyframe animations and a few custom classes (section 11). |
| `page.tsx` | `/` | The homepage, top to bottom: **landing hero** → **What's inside** tiles → evidence-label marquee → **universe map** → **incursion story** → **Steve's story panels** → **the road** (12 projects, sideways) → **Doom dossier** → featured **clues** → **the five labels** (each tile links somewhere) → latest additions. Lists like `HERO_FRAMES`, `KEY_CLUES` and `LABEL_LINK` at the top control what appears. |
| `universes/page.tsx` | `/universes` | The full interactive universe map over a nebula backdrop. |
| `timeline/page.tsx` | `/timeline` | All projects in release order as big poster cards. They stack as you scroll on desktop and form a plain list on phones. |
| `timeline/[slug]/page.tsx` | `/timeline/loki-season-1` … | One project: poster hero, why it matters, its events with evidence, image gallery, its clues, its threads, next stop. `generateStaticParams` tells Next.js to pre-build one page per project. |
| `characters/page.tsx` | `/characters` | Scrolling art filmstrip header, spotlight cards with filters, the full official cast by universe and team, and Doom's strip. |
| `characters/[slug]/page.tsx` | `/characters/doctor-doom` … | One character: hero with portrait, evidence lanes (MCU / comics / theories), gallery, teammates, open questions, clues, threads, previous/next character. |
| `connections/page.tsx` | `/connections` | The thread explorer. `?focus=character:loki` in the address opens on Loki. |
| `clues/page.tsx` | `/clues` | Every clue as a card, with filters (`clue-wall.tsx`). `/clues#canon` opens pre-filtered to one label. |
| `clues/clue-wall.tsx` | (part of `/clues`) | The interactive filter + card grid. Lives beside its page because nothing else uses it. |
| `clues/[slug]/page.tsx` | `/clues/rdj-is-doom` … | One clue: what's shown vs why it matters, characters involved, related items. |
| `trailer/page.tsx` | `/trailer` | The official trailer (YouTube embed), timestamped observations once reviewed, and a gallery of stills. |
| `sources/page.tsx` | `/sources` | The editorial rules (what each label means) and the research sources. |
| `opengraph-image.jpg` + `.alt.txt` | (link previews) | The picture shown when the site's link is shared. Generated, don't edit by hand. |

---

## 10. `src/components/`: the building blocks

Files marked **(browser)** start with `"use client"` because they're interactive.

### `layout/`: page furniture used everywhere

| File | Component(s) | Role |
|---|---|---|
| `site-header-footer.tsx` **(browser)** | `SiteHeader`, `SiteFooter`, `BackToTop` | **Header:** the name (always goes home; on the homepage it scrolls to the top), the page links with the current one highlighted, and the phone menu with a description of each page. It turns solid once you scroll so it's always readable. **Footer:** previous/next page, links to every page, disclaimer. **BackToTop:** the round ↑ button after one screen of scrolling. |
| `section-label.tsx` | `SectionLabel` | The small green spaced capitals above headings ("01 · THE MULTIVERSE MAP"). |
| `page-hero.tsx` | `PageHero` | The full-screen top of project and clue pages. A wide image fills the screen; a tall poster is shown framed on the right (desktop). Falls back to generated art. |

### `home/`: homepage sections

| File | Component | Role |
|---|---|---|
| `landing-hero.tsx` **(browser)** | `LandingHero` | The first screen: a slideshow of real film frames with a slow zoom, the "AVENGERS / DOOMSDAY" title (sized by a formula so it always fits on one line), tagline, buttons, countdown, Earth chips and the frame index. Opens with black bars parting like a projector. |
| `whats-inside.tsx` | `WhatsInside` | One picture tile per page, so first-time visitors see the whole site at once. |
| `incursion-story.tsx` **(browser)** | `IncursionStory` | Explains incursions in five steps. Desktop: pinned while you scroll, with an animated diagram. Phones: a simple list. |
| `story-panels.tsx` | `StoryPanels` | Steve's four-beat story. Each panel is a link. |
| `horizontal-scroll-section.tsx` **(browser)** | `HorizontalScrollSection` | "The road": desktop turns vertical scrolling into sideways travel; phones get a normal swipeable row that snaps card by card. |
| `road-project-card.tsx` | `RoadProjectCard` | One project card inside the road. |
| `doom-dossier.tsx` **(browser)** | `DoomDossier` | Doom's section: his throne-hall backdrop, 3D sigil, key stats and evidence bars. |

### `characters/`

| File | Role |
|---|---|
| `character-card.tsx` **(browser)** | Poster card that tilts towards the mouse (mouse only, never on touch). |
| `spotlight.tsx` **(browser)** | Filter chips (by universe) + grid of character cards. |
| `character-hero.tsx` | The top of a character page: portrait in a tilting frame, identity, cast status, evidence tally. |
| `tilt-frame.tsx` **(browser)** | The tilting picture frame used by the hero. |
| `gallery.tsx` **(browser)** | Swipeable image strip; tap to open a full-screen viewer (arrow keys and Esc work). |

### `universe/`

| File | Role |
|---|---|
| `universe-map.tsx` **(browser)** | The interactive map: three Earths, crossing lines labelled with evidence, Doom in the centre. Click any of them for a detail panel. Uses a tall layout on phones. |
| `initials-portrait.tsx` | A circle with initials, used when a cast member has no photo. |

### `threads/`

| File | Role |
|---|---|
| `thread-explorer.tsx` **(browser)** | The Connections page: one item framed on the left, glowing lines (coloured by evidence) to every linked item on the right. Click to follow a thread. The filmstrip jumps anywhere, and the "Path" shows your trail. The lines are measured from the cards' real positions and redrawn when the window resizes. |

### `media/`

| File | Role |
|---|---|
| `media-image.tsx` | Shows a catalogue image through `next/image` (right size per screen, blurred preview, focus point). |
| `image-or-art.tsx` | `ImageOrArt`: "show this image, or if there isn't one, the generated art". Use it for any slot that might not have a picture. |

### `effects/`: motion and visual effects

| File | Role |
|---|---|
| `smooth-scroll.tsx` **(browser)** | Starts Lenis (smooth mouse-wheel scrolling) and exports `scrollToTop()`. Always scroll through this helper: a plain `window.scrollTo` gets undone by Lenis. |
| `scroll-reveal.tsx` **(browser)** | `SplitHeadline` (letters rise into place) and `Reveal` (children fade up one after another) when scrolled into view. |
| `generative-art.tsx` | Draws the fallback abstract posters from `art: { hue, motif }`. |
| `countdown.tsx` **(browser)** | Live days/hours/minutes/seconds to release. Shows `--` until the browser takes over, to avoid a hydration mismatch. |
| `marquee.tsx` | The endlessly scrolling band of evidence labels. |
| `custom-cursor.tsx` **(browser)** | The green ring cursor (mouse only). |

### `three-d/`

| File | Role |
|---|---|
| `doom-sigil-3d.tsx` **(browser)** | Doom's rotating 3D iron sigil (three.js via React Three Fiber, with a bloom glow). Loaded only in the browser, and only when needed. |

### Shared evidence pieces (top of `components/`)

| File | Role |
|---|---|
| `evidence-labels.tsx` | Everything about the five labels: names, colours (`STATUS_META`, `STATUS_HEX`), `EvidenceBadge` (the pill), `EvidenceDots`, `BasisTag` (MCU/comics/announcement), `SupersededNote`, `ClaimItem`, `EvidenceLegend`. **Change a label's colour or wording here** and it changes everywhere. |
| `claim-stack.tsx` | A list of claims with their badges (used on project pages). |
| `clue-card.tsx` **(browser)** | The clue card. Tapping it opens the clue; the **Evidence ↻** button flips it to the evidence (mouse hover flips it too). Also exports `KindGlyph` (the little icon per clue type). |
| `connection-list.tsx` | A plain list of an item's connections (used at the bottom of project and character pages). |

---

## 11. Styling: colours, fonts and Tailwind

**Tailwind in 60 seconds.** Instead of writing CSS files, you add small classes to elements:

```tsx
<p className="mt-4 text-sm text-white/60 sm:text-base">…</p>
```

- `mt-4`: margin on top (4 × 4px = 16px).
- `text-sm`: small text.
- `text-white/60`: white at 60% opacity.
- `sm:text-base`: the `sm:` prefix means "from 640px wide upwards". The breakpoints are `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px and `2xl` 1536px. **No prefix means phones first**; prefixes add the bigger-screen version.
- `text-[min(21vw,15rem)]`: square brackets let you write any exact CSS value. In brackets, `_` stands for a space.

**The theme** lives at the top of `src/app/globals.css` inside `@theme { … }`. These names become Tailwind classes:

| Token | Value | Use |
|---|---|---|
| `ink` | `#040605` | page background (`bg-ink`) |
| `surface`, `raised` | darker / lighter panels | cards |
| `line` | `#1f2a24` | borders (`border-line`) |
| `text`, `muted`, `faint` | text greys | body copy |
| `doom`, `doom-bright` | `#3fae6a`, `#7dffb0` | the signature green |
| `official`, `trailer`, `canon`, `supported`, `theory`, `comics` | the label colours | `text-official`, `bg-canon`… |

**Fonts:** `font-display` (Anton, the tall condensed headlines), `font-sans` (Inter, body), `font-mono` (JetBrains Mono, labels).

**Custom classes** in `globals.css`:
- `.grain`: film grain over the whole page.
- `.text-outline`: hollow outlined text.
- `.hud`: corner brackets.
- `.hero-title`: the white-to-green gradient on the landing title.
- `@keyframes kenburns` / `fillbar`: the hero's slow zoom and progress bars.

---

## 12. Animation and motion

Three libraries, each with a job:

| Library | Used for | Where |
|---|---|---|
| **GSAP + ScrollTrigger + SplitText** | Anything tied to scrolling: pinned sections, letters rising, parallax | `landing-hero`, `incursion-story`, `horizontal-scroll-section`, `doom-dossier`, `scroll-reveal` |
| **Motion** | Things that appear, disappear or flip on interaction | menu, clue flip, gallery viewer, thread explorer, tilt cards |
| **Lenis** | Smooth mouse-wheel scrolling | `smooth-scroll.tsx` |

Lessons already learned the hard way (please keep them):

1. **Use `gsap.fromTo`, never `gsap.from`**, for entrance animations. In development React runs effects twice, and `from` can leave elements stuck invisible.
2. **A pinned section must sit inside an extra plain `<div>`.** GSAP moves pinned elements around in the page, and React needs a stable parent to remove them safely. You'll see this wrapper with a comment in `incursion-story.tsx` and `horizontal-scroll-section.tsx`.
3. **Everything respects "reduce motion".** If the visitor's device asks for less motion, the animations are skipped (look for `prefers-reduced-motion`).
4. **Random-looking art must not use real randomness.** `generative-art.tsx` uses a seeded number generator, so the server and the browser draw the same picture (otherwise: a hydration mismatch).
5. **To scroll by code, use `scrollToTop()`** from `effects/smooth-scroll.tsx`, never `window.scrollTo`.

---

## 13. Phones vs desktop

Rules the site follows so phones feel natural:

- **Nothing pins on phones.** The incursion story and the road only pin from 768px up (`gsap.matchMedia("(min-width: 768px) …")`). On phones they're an ordinary list and an ordinary swipeable row. The timeline only stacks on desktop (`lg:sticky`).
- **No tilting or hover effects on touch.** Tilt code checks `e.pointerType === "mouse"`.
- **Clue cards don't flip on a stray tap.** Only the "Evidence" button flips them.
- **No sideways page scroll.** Grids use `min-w-0` / `grid-cols-1`, and wide content scrolls inside its own strip.
- Always check at **375px wide** (an average phone) and at desktop size before publishing.

---

## 14. Recipes: common changes, step by step

### Correct or add a fact
1. Open the right file in `content/` (a film's events → `projects.json`; a character fact → `characters.json` under `mcu`).
2. Edit or add a claim (`text`, `status`, `citation`).
3. Run `npm run check-content`.

### Add a film or series
1. Add an entry to `content/projects.json` with a new `slug`, `title`, `kind`, `releaseDate`, `tagline`, `whyItMatters`, `events` and `art`.
2. Optionally add its poster (next recipe), tagged with the new slug.
3. Run `npm run check-content`. The timeline, homepage road and a new page `/timeline/<slug>` appear automatically.

### Add an image
1. Put the file in `web/assets/`.
2. Add an entry to `content/media.json` (`id`, `file`, `kind`, `alt`, `subjects`, `focus`).
3. Use it: add the `id` to a character's or team's `media` list, or just tag it with the right slug in `subjects`.
4. Run `npm run images`, then `npm run check-content`.

### Give a cast member a photo
Add `"portrait": "<image id>"` to their entry in `content/teams.json`. To cut a face out of a group poster, give the image entry a `crop` (section 7).

### Add a clue
Add an entry to `content/clues.json` (`slug`, `title`, `kind`, `project`, `citation`, `observation`, `relevance`, `status`, `characters`). It appears on `/clues`, on its film's page and at `/clues/<slug>`. To feature it on the homepage, add its slug to `KEY_CLUES` in `src/app/page.tsx`.

### Add a connection (thread)
Add to `content/connections.json`: `{ "id": "…", "from": "project:…", "to": "character:…", "reason": "…", "status": "canon", "citation": "…" }`.

### Change the landing slideshow
Edit the `HERO_FRAMES` list at the top of `src/app/page.tsx` (image ids, in order). Wide images look best.

### Add a new page
1. Create `src/app/<name>/page.tsx` that exports a default component (copy `universes/page.tsx` as a starting point).
2. Add it to `PAGES` in `src/lib/site-map.ts` (`href`, `label`, `n`, `blurb`, `image`). The header, menu, footer, "What's inside" tiles and previous/next links all pick it up.

### Change a label colour or wording
Edit `STATUS_META` / `STATUS_HEX` in `src/components/evidence-labels.tsx`, and the matching colour in `@theme` in `globals.css`.

---

## 15. Checking your work and publishing

Before publishing, run all four checks from `doomsday/web`:

```powershell
npx tsc --noEmit -p .
```
```powershell
npm run lint
```
```powershell
npm run check-content
```
```powershell
npm run build
```

1. Type-check: catches wrong data shapes and missing imports.
2. Lint: catches React mistakes.
3. Content: catches broken links between entries.
4. Build: the real thing (also re-runs the content check).

Then publish:

```powershell
git add -A
```
```powershell
git commit -m "Describe the change"
```
```powershell
git push
```
```powershell
npx vercel@latest deploy --prod
```

The last command uploads the site to Vercel and makes it live at the production address.

---

## 16. When something goes wrong

| Symptom | Likely cause → fix |
|---|---|
| Build fails with "Content validation failed" | The message names the file and entry. Usually a misspelt slug or a missing `status`. |
| "unknown or unprocessed media" | The image id isn't in `media.json`, or you haven't run `npm run images`. |
| "unknown subject" on an image | A tag in `subjects` doesn't match any slug. Fix the spelling, or use `comics` / `texture`. |
| New JSON edits don't show in `npm run dev` | Restart the dev server. |
| "Hydration failed" error in the browser | Something rendered differently on the server and in the browser: real randomness, the current time, or reading `window` during render. Move it into `useEffect`, or use a seeded value. |
| An element animates in and then stays invisible | An entrance animation used `gsap.from`. Switch to `gsap.fromTo` (section 12). |
| Page can be dragged sideways on a phone | Something is wider than the screen. Add `min-w-0`, or give the wide part its own `overflow-x-auto`. |
| A section's text sticks while scrolling on a phone | A pin or `sticky` is active on small screens. Limit it to `md:` / `lg:` (section 13). |

---

## 17. House rules (conventions)

- **Facts in JSON, design in code.** Never write a fact directly into a component.
- **Every important claim has a status and a citation.** Comics material is always marked `"basis": "comics"`.
- **One source of truth.** Lists that several places need live in one file: pages → `lib/site-map.ts`; labels → `evidence-labels.tsx`; colours → `globals.css` `@theme`.
- **File names say what the file is** (`landing-hero.tsx`, `cast-roster.ts`), in lower-case words joined by hyphens. Components inside use the same words in PascalCase (`LandingHero`).
- **Server by default.** Only add `"use client"` when the file needs clicks, state, effects or animation.
- **Use the helpers:** `ImageOrArt` for any image slot, `SectionLabel` for small headings, `scrollToTop()` for scrolling.
- **Check at phone width** before publishing.
