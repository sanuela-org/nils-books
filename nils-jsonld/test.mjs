// Manual test harness for nils-jsonld — run from the repo root:
//   node nils-jsonld/test.mjs
// Builds the JSON-LD for both book pages from the VAULT (canonical) and prints
// it; also validates that both serialize cleanly. No Quartz build needed.
import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"
import { buildBookLd, collectChapters } from "./src/index.js"

const VAULT = "/opt/data/vaults/Nils-Books"
let failed = false

for (const book of ["wide-open", "confident-heart"]) {
  const raw = fs.readFileSync(path.join(VAULT, `${book}.md`), "utf8")
  const fm = YAML.parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1])
  const chapters = collectChapters(VAULT, fm.book_slug)
  const ld = buildBookLd(fm, chapters, book)
  const json = JSON.stringify(ld)
  try {
    JSON.parse(json.replace(/\\u003c/g, "<"))
  } catch (e) {
    failed = true
    console.error(`✗ ${book}: JSON does not parse: ${e.message}`)
  }
  console.log(`\n=== ${book} (${chapters.length} chapters) ===`)
  console.log(JSON.stringify(ld, null, 2))
}

console.log(failed ? "\nRESULT: FAILED" : "\nRESULT: OK — both books serialize cleanly")
process.exit(failed ? 1 : 0)