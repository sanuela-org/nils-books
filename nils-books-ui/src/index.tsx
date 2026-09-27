import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"

type Fm = Record<string, unknown>

/* path helpers, kept local so the plugin has no runtime deps on quartz internals */
function stripSlashes(s: string, onlyPrefix = false): string {
  if (s.startsWith("/")) s = s.slice(1)
  if (!onlyPrefix && s.endsWith("/")) s = s.slice(0, -1)
  return s
}

function joinSegments(...args: string[]): string {
  const cleaned = args.filter((a) => a !== "" && a !== "/").map((a) => stripSlashes(a))
  const joined = cleaned.join("/")
  return args[0]?.startsWith("/") ? "/" + joined : joined
}

function pathToRoot(slug: string): string {
  const parts = slug.split("/").filter((x) => x !== "").slice(0, -1)
  return parts.length === 0 ? "." : parts.map(() => "..").join("/")
}

function resolveRelative(current: string, target: string): string {
  const t = target.endsWith("/index") ? target.slice(0, -"index".length) : target
  const tClean = stripSlashes(t)
  const root = pathToRoot(current)
  const joined = root === "." ? tClean : `${root}/${tClean}`
  return joined.startsWith(".") ? joined : `./${joined}`
}

function byline(fm: Fm): string {
  return [String(fm.author ?? ""), fm.year ? String(fm.year) : ""].filter(Boolean).join(" · ")
}

function BookUI({ fileData, allFiles }: QuartzComponentProps) {
  const fm = (fileData.frontmatter ?? {}) as Fm
  const slug = (fileData.slug as string) ?? ""

  // 1) book cover header — pages carrying `cover:` frontmatter
  if (typeof fm.cover === "string" && fm.cover && slug !== "index") {
    const title = String(fm.title ?? "")
    const src = joinSegments(pathToRoot(slug), "_attachments", String(fm.book_slug ?? ""), fm.cover)
    return (
      <div class="book-header">
        <img class="book-cover" src={src} alt={`Cover of ${title}`} />
        <div class="book-header-meta">
          {fm.subtitle ? <p class="book-subtitle">{String(fm.subtitle)}</p> : null}
          {byline(fm) ? <p class="book-byline">{byline(fm)}</p> : null}
        </div>
      </div>
    )
  }

  // 2) cover cards — pages opting in via `show_book_covers: true`
  if (fm.show_book_covers && Array.isArray(allFiles)) {
    const books = allFiles
      .filter((f) => (f.frontmatter as Fm | undefined)?.cover)
      .map((f) => ({ slug: String(f.slug), fm: (f.frontmatter ?? {}) as Fm }))
      .sort((a, b) => String(a.fm.title ?? "").localeCompare(String(b.fm.title ?? "")))
    return (
      <div class="book-cards">
        {books.map((b) => (
          <a class="book-card" href={resolveRelative(slug, b.slug)}>
            <img
              class="book-card-cover"
              src={joinSegments(pathToRoot(slug), "_attachments", String(b.fm.book_slug ?? ""), String(b.fm.cover))}
              alt={`Cover of ${String(b.fm.title ?? "")}`}
              loading="lazy"
            />
            <span class="book-card-title">{String(b.fm.title ?? "")}</span>
            {b.fm.subtitle ? <span class="book-card-subtitle">{String(b.fm.subtitle)}</span> : null}
            <span class="book-card-author">{byline(b.fm)}</span>
          </a>
        ))}
      </div>
    )
  }

  // 3) folder + tag pages: auto page title (article-title is disabled site-wide)
  if ((slug.endsWith("/index") && slug !== "index") || slug.startsWith("tags/")) {
    return <h1 class="article-title">{String(fm.title ?? "")}</h1>
  }

  return null
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
`

export default ((opts?: Record<string, unknown>) => BookUI) satisfies QuartzComponentConstructor
