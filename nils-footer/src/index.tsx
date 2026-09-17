import { QuartzComponentConstructor } from "./types"

interface FooterOptions {
  links: Record<string, string>
}

export default ((opts?: FooterOptions) => {
  function SanuelaFooter({ displayClass }: { displayClass?: string }) {
    const links = opts?.links ?? []
    const year = new Date().getFullYear()
    return (
      <footer class={`${displayClass ?? ""} sanuela-footer`}>
        <p class="sanuela-footer-line">
          Part of the Sanuela universe. Explore more at{" "}
          <a href="https://www.sanuela.org" class="external">
            sanuela.org
          </a>
        </p>
        <p class="sanuela-footer-line">
          Built with Hermes, Obsidian &amp; Quartz.{" "}
          <a href="https://www.sanuela.org/contact/" class="external">
            Contact me
          </a>{" "}
          if you want your own wiki knowledgebase.
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li key={text}>
              <a href={link} class="external">
                {text}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    )
  }

  SanuelaFooter.css = `
.sanuela-footer {
  text-align: center;
  margin: 2rem 0 2.5rem;
}

.sanuela-footer p {
  margin: 0;
  font-size: 0.85rem;
}

.sanuela-footer-line {
  margin-bottom: 0.25rem !important;
}

.sanuela-footer ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sanuela-footer a.external::after {
  display: none;
}
`

  return SanuelaFooter
}) satisfies QuartzComponentConstructor
