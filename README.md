# The Road to Doomsday

An evidence-labelled guide to the MCU threads leading into *Avengers: Doomsday*. Every claim is tagged **Official**, **Trailer**, **Canon**, **Supported** or **Theory**.

- **Live:** https://road-to-doomsday-nu.vercel.app
- **New to the code?** Read **[HOW-THIS-WEBSITE-WORKS.md](HOW-THIS-WEBSITE-WORKS.md)**. It's a full, beginner-friendly tour of every folder and file, with step-by-step recipes.

## Run

```bash
npm install
npm run dev             # http://localhost:3000
npm run check-content   # check content/*.json for broken references and missing evidence
npm run images          # process images from assets/ into public/media/
npm run build           # checks the content, then builds every page
```

## Stack

Next.js 16 (App Router, static pages) · React 19 · TypeScript · Tailwind CSS 4 · GSAP (ScrollTrigger, SplitText) · Lenis · Motion · three.js / React Three Fiber (Doom's 3D sigil only) · sharp (image processing).

## Where things are

- `content/`: all facts and the image catalogue (JSON). Edit these, not the code, to change what the site says.
- `src/app/`: one folder per page.
- `src/components/`: building blocks (layout, homepage sections, characters, universe map, threads, effects).
- `src/lib/`: loads, checks and joins the content for the pages.
- `scripts/`: the content checker and the image processor.

## Still open

- Trailer observations: the official final trailer is queued, but no timestamps are logged yet.
- Research videos: titles and channels are recorded; their claims still need review.
- Image wish-list: see `../ASSET_REQUESTS.md`.
