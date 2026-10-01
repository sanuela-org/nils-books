// nils-books-cards — markdown transformer for the Nils-Books Quartz site.
// On pages with `show_book_covers: true` frontmatter (the site index), injects
// the book cover cards as raw HTML right after the `## Books` heading, so the
// cards land between the intro text and the topic/chapter sections.
//
// Book data comes from the ROOT-LEVEL notes (vault book pages live at the
// content root, e.g. wide-open.md): any root note with a `cover:` frontmatter
// field is a book. Cards are sorted year DESC, then title ASC.
//
// The quartz build reads this file as JavaScript — plain ES module, no TS.

import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"

function textOf(node) {
  if (!node) return ""
  if (node.type === "text") return node.value
  if (node.children) return node.children.map(textOf).join("")
  return ""
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Read frontmatter of every root-level *.md next to `filePath`; return book cards. */
function collectBooks(filePath) {
  const dir = path.dirname(String(filePath))
  const books = []
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".md") || name === "index.md") continue
    const raw = fs.readFileSync(path.join(dir, name), "utf8")
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) continue
    let fm
    try {
      fm = YAML.parse(m[1]) ?? {}
    } catch {
      continue
    }
    if (typeof fm.cover !== "string" || !fm.cover) continue
    books.push({
      slug: name.slice(0, -3),
      title: String(fm.title ?? "").trim(),
      subtitle: String(fm.subtitle ?? "").trim(),
      author: String(fm.author ?? "").trim(),
      year: Number(fm.year) || 0,
      cover: fm.cover,
      bookSlug: String(fm.book_slug ?? "").trim() || name.slice(0, -3),
      summary: String(fm.summary ?? "").trim(),
      buy: String(fm.books2read ?? "").trim(),
    })
  }
  books.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" })
  })
  return books
}

function cardHtml(b) {
  const href = `./${b.slug}`
  const src = `_attachments/${b.bookSlug}/${b.cover}`
  const titleline = b.subtitle ? `${b.title}. ${b.subtitle}` : b.title
  const summary = b.summary ? `\n<p class="book-summary">${esc(b.summary)}</p>` : ""
  const buy = b.buy
    ? `\n<p class="book-buylink"><a href="${esc(b.buy)}" target="_blank" rel="noopener">Get the book</a></p>`
    : ""
  return (
    `<div class="book-entry">\n` +
    `<a class="book-entry-coverlink" href="${esc(href)}">` +
    `<img class="book-cover" src="${esc(src)}" alt="${esc(`Cover of ${b.title}`)}" loading="lazy">` +
    `</a>\n` +
    `<div class="book-header-meta">\n` +
    `<p class="book-titleline"><a href="${esc(href)}">${esc(titleline)}</a></p>\n` +
    `<p class="book-byline">${esc([b.author, b.year || ""].filter(Boolean).join(" · "))}</p>\n` +
    summary +
    `\n<p class="book-chapters"><a href="${esc(href)}#chapters">Chapter summaries</a></p>\n` +
    buy +
    `\n</div>\n</div>`
  )
}

export default () => ({
  name: "NilsBooksCards",
  markdownPlugins() {
    return [
      () => (tree, file) => {
        const fm = file.data?.frontmatter ?? {}
        if (fm.show_book_covers !== true) return
        const children = tree.children ?? []
        const idx = children.findIndex(
          (n) => n.type === "heading" && n.depth === 2 && textOf(n).trim() === "Books",
        )
        if (idx === -1) {
          console.warn("[nils-books-cards] no '## Books' heading found; cards not injected")
          return
        }
        const books = collectBooks(file.path ?? file.history?.[0] ?? ".")
        if (books.length === 0) return
        const html =
          `<div class="book-list">\n` + books.map(cardHtml).join("\n") + `\n</div>`
        children.splice(idx + 1, 0, { type: "html", value: html })
      },
    ]
  },
})
