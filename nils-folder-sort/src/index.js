// nils-folder-sort — wraps @quartz-community/folder-page so folder page lists
// (the /topics/ list, the books list) render ALPHABETICALLY by title instead of
// Quartz's default "date descending". New topics slot in automatically on the
// next build; nothing to re-sort by hand.
//
// Why a wrapper: the config loader passes YAML options through verbatim — no
// string->function eval — and PageList needs a real sort function. (The
// explorer's sortFn string only works because that plugin evaluates it
// client-side with new Function.)
//
// Exception: chapter slugs (books/<slug>/ch-NN[-k]-...) keep READING order,
// same rule as the explorer's chapterOrder (nils-books-data): ch-00 foreword
// first, numbered chapters in order, sub-slots (ch-12-2-...) right after
// ch-12, closing essay/afterword (highest ch-NN) last. Non-chapter pages sort
// after chapters.
//
// Locale pinned to "en" so local and CI builds sort identically.
import { FolderPage } from "@quartz-community/folder-page"

const CH = /^books\/[^/]+\/ch-(\d+)(?:-(\d+))?(?:-|$)/

export function folderSort(a, b) {
  const ma = CH.exec(String(a.slug || ""))
  const mb = CH.exec(String(b.slug || ""))
  const ord = (m) => Number(m[1]) + (m[2] ? Number(m[2]) / 100 : 0)
  if (ma && mb) return ord(ma) - ord(mb)
  if (ma) return -1
  if (mb) return 1
  const t = (n) => String((n.frontmatter && n.frontmatter.title) || n.slug || "")
  return t(a).localeCompare(t(b), "en", { numeric: true, sensitivity: "base" })
}

export default (opts) => {
  const inner = FolderPage({ ...(opts || {}), sort: folderSort })
  return { ...inner, name: "FolderPage" }
}
