// nils-books-data — emitter for the Nils-Books Quartz site.
// WRAPS @quartz-community/content-index: emits everything ContentIndex emits
// (sitemap, RSS, static/contentIndex.json), then patches contentIndex.json to
// add `year` (from note frontmatter) to every entry. Explorer's client-side
// sortFn can then sort by n.data.year — no per-book hardcoding; new books just
// need `year:` in frontmatter. Add more frontmatter fields the same way.
//
// Why a wrapper: emitContent runs emitters via Promise.all, so a separate
// patcher emitter would race ContentIndex and lose. Wrapping guarantees the
// patch runs after the file is written.
//
// The quartz build reads this file as JavaScript — plain ES module, no TS.

import fs from "node:fs"
import path from "node:path"
import { ContentIndex } from "@quartz-community/content-index"

function patchYears(ctx, content) {
  const years = {}
  for (const [, file] of content) {
    const data = file.data ?? {}
    const fm = data.frontmatter ?? {}
    const y = Number(fm.year)
    if (Number.isFinite(y) && y > 0 && data.slug) years[data.slug] = y
  }

  const fp = path.join(ctx.argv.output, "static", "contentIndex.json")
  if (!fs.existsSync(fp)) return
  const idx = JSON.parse(fs.readFileSync(fp, "utf8"))
  let patched = 0
  for (const [slug, entry] of Object.entries(idx)) {
    if (years[slug] !== undefined) {
      entry.year = years[slug]
      patched++
    }
  }
  fs.writeFileSync(fp, JSON.stringify(idx))
  console.log(`[nils-books-data] added year to ${patched} contentIndex entries`)
}

export default (opts) => {
  const inner = ContentIndex(opts)
  const wrap = (fnName) => async (ctx, content, resources, changeEvents) => {
    const out = await inner[fnName](ctx, content, resources, changeEvents)
    patchYears(ctx, content)
    return out
  }
  return {
    name: "NilsBooksData",
    emit: wrap("emit"),
    partialEmit: inner.partialEmit ? wrap("partialEmit") : undefined,
  }
}
