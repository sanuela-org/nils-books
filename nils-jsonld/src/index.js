// nils-jsonld — transformer for the Nils-Books Quartz site.
// Emits schema.org/Book JSON-LD on the book pages: a
// <script type="application/ld+json"> node injected at the top of the body
// (Google reads JSON-LD anywhere in the page).
//
// Gate: any page whose frontmatter carries `book_slug` AND `cover` — the vault
// root book pages. Folder index pages (books/<slug>/index.md) carry neither,
// so each book gets exactly one Book entity.
//
// Chapters: read from books/<book_slug>/ch-*.md on disk, ordered by the
// ch-NN[-2-] slug (same rule the explorer uses), emitted as hasPart/Chapter.
// The chapter signal lives on the book page; chapter pages themselves carry no
// markup — no Google rich result exists for chapter-level data, so per-chapter
// blocks would be noise (Nils's call, 2026-10-01).
//
// URLs: SITE_ORIGIN is the canonical public origin (the cname target).
// cfg.baseUrl still points at the github.io Pages URL, which redirects —
// structured data must name the domain Google actually indexes.
//
// The quartz build reads this file as JavaScript — plain ES module, no TS.

import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"

const SITE_ORIGIN = "https://books.sanuela.org"

// ch-00 foreword first, numbered chapters in order, sub-slots right after,
// closing essay / afterword (highest ch-NN) last — mirrors nils-books-data.
function chapterOrder(slug) {
  const m = /ch-(\d+)(?:-(\d+))?/.exec(slug)
  if (!m) return 9999
  return Number(m[1]) + (m[2] ? Number(m[2]) / 100 : 0)
}

function frontmatterOf(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  try {
    return YAML.parse(m[1]) ?? {}
  } catch {
    return null
  }
}

/** Chapter entities for one book, read from books/<bookSlug>/ch-*.md. */
export function collectChapters(contentRoot, bookSlug) {
  const dir = path.join(contentRoot, "books", String(bookSlug))
  if (!fs.existsSync(dir)) return []
  const chapters = []
  for (const name of fs.readdirSync(dir)) {
    if (!/^ch-.*\.md$/.test(name)) continue
    const fm = frontmatterOf(fs.readFileSync(path.join(dir, name), "utf8"))
    if (!fm) continue
    const slug = `books/${bookSlug}/${name.slice(0, -3)}`
    chapters.push({
      order: chapterOrder(slug),
      name: String(fm.title ?? name.slice(0, -3)).trim(),
      url: `${SITE_ORIGIN}/${slug}`,
    })
  }
  chapters.sort((a, b) => a.order - b.order)
  return chapters.map(({ name, url }) => ({ "@type": "Chapter", name, url }))
}

/** Amazon ASIN as a schema.org PropertyValue identifier. */
function asinIdentifier(asin) {
  return [{ "@type": "PropertyValue", propertyID: "ASIN", value: String(asin).trim() }]
}

/** Build the schema.org/Book graph for one book page's frontmatter. */
export function buildBookLd(fm, chapters, pageSlug) {
  const slug = String(pageSlug ?? fm.book_slug ?? "").replace(/^\/+|\/+$/g, "")
  const name = fm.subtitle ? `${fm.title}. ${fm.subtitle}` : fm.title
  const ld = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${SITE_ORIGIN}/${slug}`,
    url: `${SITE_ORIGIN}/${slug}`,
    name: String(name ?? "").trim(),
    author: { "@type": "Person", name: String(fm.author ?? "").trim() },
    image: `${SITE_ORIGIN}/_attachments/${fm.book_slug}/${fm.cover}`,
    inLanguage: String(fm.language ?? "en"),
  }
  if (Number(fm.year) > 0) ld.datePublished = String(fm.year)
  if (fm.summary) ld.description = String(fm.summary).trim()
  if (fm.isbn) ld.isbn = String(fm.isbn).trim()
  if (fm.books2read) ld.sameAs = String(fm.books2read).trim()
  // Editions (Google Book shape): print (binding unknown, no bookFormat),
  // Kindle (EBook), audiobook (AudiobookFormat) — ASINs ride as identifiers.
  const examples = []
  if (fm.isbn || fm.asin_print) {
    const print = { "@type": "Book" }
    if (fm.isbn) print.isbn = String(fm.isbn).trim()
    if (fm.asin_print) print.identifier = asinIdentifier(fm.asin_print)
    examples.push(print)
  }
  if (fm.asin_kindle) {
    examples.push({
      "@type": "Book",
      bookFormat: "https://schema.org/EBook",
      identifier: asinIdentifier(fm.asin_kindle),
    })
  }
  if (fm.asin_audio) {
    examples.push({
      "@type": "Book",
      bookFormat: "https://schema.org/AudiobookFormat",
      identifier: asinIdentifier(fm.asin_audio),
    })
  }
  if (examples.length > 0) ld.workExample = examples
  if (chapters.length > 0) ld.hasPart = chapters
  return ld
}

export default () => ({
  name: "NilsJsonLd",
  markdownPlugins() {
    return [
      () => (tree, file) => {
        const fm = file.data?.frontmatter ?? {}
        if (!fm.book_slug || !fm.cover) return
        const slug = String(file.data.slug ?? "")
        if (!slug || slug.includes("/")) return // root-level book pages only
        const contentRoot = path.dirname(String(file.path ?? file.history?.[0] ?? process.cwd()))
        const ld = buildBookLd(fm, collectChapters(contentRoot, fm.book_slug), slug)
        const json = JSON.stringify(ld).replace(/</g, "\\u003c")
        tree.children.unshift({
          type: "html",
          value: `<script type="application/ld+json">${json}</script>`,
        })
      },
    ]
  },
})