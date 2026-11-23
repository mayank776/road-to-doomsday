// Usage: npm run validate — checks /content/*.json for broken references and missing evidence.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateContent } from "../src/lib/validate-content.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "content");
const load = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));

const errors = validateContent({
  projects: load("projects.json"),
  characters: load("characters.json"),
  concepts: load("concepts.json"),
  clues: load("clues.json"),
  connections: load("connections.json"),
  research: load("research.json"),
});

if (errors.length) {
  console.error(`✗ ${errors.length} content problem(s):\n  - ` + errors.join("\n  - "));
  process.exit(1);
}
console.log("✓ Content is valid.");
