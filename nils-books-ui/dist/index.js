// nils-books-ui/src/index.tsx
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

.book-header p.book-titleline {
  margin: 0.1rem 0 0.2rem;
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

/* index book cards get a one-line summary between byline and chapter-summaries link */
.book-entry p.book-summary {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--darkgray);
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
  index_default as default
};
