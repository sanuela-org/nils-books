// src/index.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
function stripSlashes(s, onlyPrefix = false) {
  if (s.startsWith("/")) s = s.slice(1);
  if (!onlyPrefix && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}
function joinSegments(...args) {
  const cleaned = args.filter((a) => a !== "" && a !== "/").map((a) => stripSlashes(a));
  const joined = cleaned.join("/");
  return args[0]?.startsWith("/") ? "/" + joined : joined;
}
function pathToRoot(slug) {
  const parts = slug.split("/").filter((x) => x !== "").slice(0, -1);
  return parts.length === 0 ? "." : parts.map(() => "..").join("/");
}
function resolveRelative(current, target) {
  const t = target.endsWith("/index") ? target.slice(0, -"index".length) : target;
  const tClean = stripSlashes(t);
  const root = pathToRoot(current);
  const joined = root === "." ? tClean : `${root}/${tClean}`;
  return joined.startsWith(".") ? joined : `./${joined}`;
}
function byline(fm) {
  return [String(fm.author ?? ""), fm.year ? String(fm.year) : ""].filter(Boolean).join(" \xB7 ");
}
function BookUI({ fileData, allFiles }) {
  const fm = fileData.frontmatter ?? {};
  const slug = fileData.slug ?? "";
  if (typeof fm.cover === "string" && fm.cover && slug !== "index") {
    const title = String(fm.title ?? "");
    const src = joinSegments(pathToRoot(slug), "_attachments", String(fm.book_slug ?? ""), fm.cover);
    return /* @__PURE__ */ jsxs("div", { class: "book-header", children: [
      /* @__PURE__ */ jsx("img", { class: "book-cover", src, alt: `Cover of ${title}` }),
      /* @__PURE__ */ jsxs("div", { class: "book-header-meta", children: [
        fm.subtitle ? /* @__PURE__ */ jsxs("p", { class: "book-titleline", children: [
          title,
          ". ",
          String(fm.subtitle)
        ] }) : /* @__PURE__ */ jsx("p", { class: "book-titleline", children: title }),
        byline(fm) ? /* @__PURE__ */ jsx("p", { class: "book-byline", children: byline(fm) }) : null
      ] })
    ] });
  }
  if (fm.show_book_covers && Array.isArray(allFiles)) {
    const books = allFiles.filter((f) => f.frontmatter?.cover).map((f) => ({ slug: String(f.slug), fm: f.frontmatter ?? {} })).sort((a, b) => {
      const ya = Number(a.fm.year ?? 0);
      const yb = Number(b.fm.year ?? 0);
      if (ya !== yb) return ya - yb;
      return String(a.fm.title ?? "").localeCompare(String(b.fm.title ?? ""));
    });
    return /* @__PURE__ */ jsx("div", { class: "book-list", children: books.map((b) => {
      const title = String(b.fm.title ?? "");
      const subtitle = b.fm.subtitle ? String(b.fm.subtitle) : "";
      const href = resolveRelative(slug, b.slug);
      const chaptersHref = `${href}#chapters`;
      return /* @__PURE__ */ jsxs("div", { class: "book-entry", children: [
        /* @__PURE__ */ jsx("a", { class: "book-entry-coverlink", href, children: /* @__PURE__ */ jsx(
          "img",
          {
            class: "book-cover",
            src: joinSegments(pathToRoot(slug), "_attachments", String(b.fm.book_slug ?? ""), String(b.fm.cover)),
            alt: `Cover of ${title}`,
            loading: "lazy"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { class: "book-header-meta", children: [
          /* @__PURE__ */ jsx("p", { class: "book-titleline", children: /* @__PURE__ */ jsxs("a", { href, children: [
            title,
            subtitle ? `. ${subtitle}` : ""
          ] }) }),
          /* @__PURE__ */ jsx("p", { class: "book-byline", children: byline(b.fm) }),
          /* @__PURE__ */ jsx("p", { class: "book-chapters", children: /* @__PURE__ */ jsx("a", { href: chaptersHref, children: "Chapter summaries" }) })
        ] })
      ] });
    }) });
  }
  if (slug.endsWith("/index") && slug !== "index" || slug.startsWith("tags/")) {
    return /* @__PURE__ */ jsx("h1", { class: "article-title", children: String(fm.title ?? "") });
  }
  return null;
}
BookUI.css = `
.book-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0.5rem 0 2rem;
}

.book-entry {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.book-entry img.book-cover {
  width: 250px;
  max-width: 42%;
  height: auto;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid var(--lightgray);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.book-entry p.book-titleline {
  margin: 0.1rem 0 0.2rem;
  font-size: 1.15rem;
  line-height: 1.35;
  font-style: italic;
  font-weight: 500;
  color: var(--darkgray);
}

.book-entry p.book-titleline a {
  color: inherit;
  text-decoration: none;
}

.book-entry p.book-titleline a:hover {
  text-decoration: underline;
}

.book-entry p.book-byline {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray);
}

.book-entry p.book-chapters {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
}

@media (max-width: 800px) {
  .book-entry {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .book-entry img.book-cover {
    width: 190px;
    max-width: 55%;
  }
}

.book-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin: 0.25rem 0 1.5rem;
}

.book-header img.book-cover {
  width: 250px;
  max-width: 42%;
  height: auto;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid var(--lightgray);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

.book-header-meta {
  min-width: 0;
}

.book-header p.book-subtitle {
  margin: 0.4rem 0 0.2rem;
  font-size: 1.15rem;
  line-height: 1.35;
  font-style: italic;
  font-weight: 500;
  color: var(--darkgray);
}

.book-header p.book-byline {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray);
}

@media (max-width: 800px) {
  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .book-header img.book-cover {
    width: 190px;
    max-width: 55%;
  }
}
`;
var index_default = ((opts) => BookUI);
export {
  index_default as BookUI
};
