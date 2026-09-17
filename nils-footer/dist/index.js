// nils-footer/src/index.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var index_default = ((opts) => {
  function SanuelaFooter({ displayClass }) {
    const links = opts?.links ?? [];
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    return /* @__PURE__ */ jsxs("footer", { class: `${displayClass ?? ""} sanuela-footer`, children: [
      /* @__PURE__ */ jsxs("p", { class: "sanuela-footer-line", children: [
        "Part of the Sanuela universe. Explore more at",
        " ",
        /* @__PURE__ */ jsx("a", { href: "https://www.sanuela.org", class: "external", children: "sanuela.org" })
      ] }),
      /* @__PURE__ */ jsxs("p", { class: "sanuela-footer-line", children: [
        "Built with Hermes, Obsidian & Quartz.",
        " ",
        /* @__PURE__ */ jsx("a", { href: "https://www.sanuela.org/contact/", class: "external", children: "Contact me" }),
        " ",
        "if you want your own wiki knowledgebase."
      ] }),
      /* @__PURE__ */ jsx("ul", { children: Object.entries(links).map(([text, link]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: link, class: "external", children: text }) }, text)) })
    ] });
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
`;
  return SanuelaFooter;
});
export {
  index_default as default
};
