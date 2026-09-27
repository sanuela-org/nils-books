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
        fm.subtitle ? /* @__PURE__ */ jsx("p", { class: "book-subtitle", children: String(fm.subtitle) }) : null,
        byline(fm) ? /* @__PURE__ */ jsx("p", { class: "book-byline", children: byline(fm) }) : null
      ] })
    ] });
  }
  if (fm.show_book_covers && Array.isArray(allFiles)) {
    const books = allFiles.filter((f) => f.frontmatter?.cover).map((f) => ({ slug: String(f.slug), fm: f.frontmatter ?? {} })).sort((a, b) => String(a.fm.title ?? "").localeCompare(String(b.fm.title ?? "")));
    return /* @__PURE__ */ jsx("div", { class: "book-cards", children: books.map((b) => /* @__PURE__ */ jsxs("a", { class: "book-card", href: resolveRelative(slug, b.slug), children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          class: "book-card-cover",
          src: joinSegments(pathToRoot(slug), "_attachments", String(b.fm.book_slug ?? ""), String(b.fm.cover)),
          alt: `Cover of ${String(b.fm.title ?? "")}`,
          loading: "lazy"
        }
      ),
      /* @__PURE__ */ jsx("span", { class: "book-card-title", children: String(b.fm.title ?? "") }),
      b.fm.subtitle ? /* @__PURE__ */ jsx("span", { class: "book-card-subtitle", children: String(b.fm.subtitle) }) : null,
      /* @__PURE__ */ jsx("span", { class: "book-card-author", children: byline(b.fm) })
    ] })) });
  }
  if (slug.endsWith("/index") && slug !== "index" || slug.startsWith("tags/")) {
    return /* @__PURE__ */ jsx("h1", { class: "article-title", children: String(fm.title ?? "") });
  }
  return null;
}
BookUI.css = `
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

.book-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin: 0.5rem 0 2rem;
}

a.book-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.25rem 1rem 1rem;
  border: 1px solid var(--lightgray);
  border-radius: 12px;
  background: var(--light);
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

a.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.book-card img.book-card-cover {
  height: 260px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  margin-bottom: 0.8rem;
}

.book-card .book-card-title {
  font-family: var(--headerFont);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--dark);
}

.book-card .book-card-subtitle {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--darkgray);
  margin-top: 0.2rem;
}

.book-card .book-card-author {
  font-size: 0.8rem;
  color: var(--gray);
  margin-top: 0.35rem;
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
