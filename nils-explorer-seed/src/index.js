// Seeds localStorage["fileTree"] so the explorer renders the Topics folder open
// on a reader's FIRST visit. The script is collected into the site-wide
// prescript.js (beforeDOMReady) and therefore runs before:
//   1. the explorer plugin's afterDOMLoaded script registers its render listener,
//   2. the SPA router dispatches the first "nav" event (which triggers the
//      explorer's tree render, the only place it reads saved state).
//
// Path format: @quartz-community/explorer stores folder state under the
// folder's trie slug — "topics/index", NOT "topics" — and looks the saved
// state up with the same key when rendering. Any other string is silently
// ignored (default = collapsed).
//
// Behaviour: seeds only when the reader has no saved state for this folder
// yet. Once they collapse or expand Topics themselves, their choice is stored
// under the same path and is left untouched — nothing is ever forced.

const seedScript = `
try {
  var raw = localStorage.getItem("fileTree");
  var tree = raw ? JSON.parse(raw) : [];
  var hasTopics = false;
  for (var i = 0; i < tree.length; i++) {
    if (tree[i] && tree[i].path === "topics/index") { hasTopics = true; break; }
  }
  if (!hasTopics) {
    tree.push({ path: "topics/index", collapsed: false });
    localStorage.setItem("fileTree", JSON.stringify(tree));
  }
} catch (e) {}
`

function ExplorerSeed() {
  return null
}
ExplorerSeed.beforeDOMLoaded = seedScript

export default function () {
  return ExplorerSeed
}
