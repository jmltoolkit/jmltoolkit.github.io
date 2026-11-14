# JMLtk Documentation Site — Agent Instructions

Hugo (extended) + Hextra site published at <https://jmltoolkit.github.io>.
Repository: `jmltoolkit/jmltoolkit.github.io`. Content is Markdown under
`content/`; `public/` is generated and gitignored. The documented tool is repo
JMLtk/JavaParser.

## Setup

- Requires Hugo extended, Go (for Hugo modules), and Git.
- Run `hugo mod tidy` after changing the module or theme.

## Commands

| Task | Command |
| ---- | ------- |
| Live preview | `hugo server --logLevel debug --disableFastRender -p 1313` |
| Production build | `hugo --gc --minify` |
| Non-destructive check | `hugo --gc --minify --destination /tmp/jmltk-docs-build --cleanDestinationDir` |
| Update theme | `hugo mod get -u && hugo mod tidy` |

## Content

- Sections: 
  - `content/intro/` - General Information 
  - `content/jml/` - JML syntax constructs
  - `content/key/` - KeY syntax constructs
  - `content/devel/` - how to contribute/develop 
  - `content/tools/`- subsection for each tool 
- Front matter is YAML: `title`. `weight` for ordering. Use `_index.md` for section landing pages.
- Relative links allowed; verify anchors after renaming headings.
- Tag code fences (`java`, `kotlin`, `xml`, `text`, `shell`); use `text` for grammar sketches. 
- metadata `title:` is printed, no need to repeat it. no H1
- Keep docs aligned with the parser: grammar `javaparser-core/src/main/javacc/java.jj`, AST under `ast/jml/`
  and `ast/key/`. Consult `jmltk-changelog.md` for release/version wording.
- `content/intro/getting-started.md` shows the latest published Maven/Gradle version; bump it on release.

- Use the shortcodes of HEXTRA https://imfing.github.io/hextra/docs/guide/shortcodes/:
  - Callouts: `{{< callout type="info" >}}`
  - Cards: `{{< cards >}} {{< card link="../link" title="T" icon="warning" >}}...`
  - Details: `{{< details title="Details" >}}This is the content of the details. Markdown is **supported**. {{< /details >}}`
  - FileTree https://imfing.github.io/hextra/docs/guide/shortcodes/filetree/
  - Term `{{< term "SEO" >}}`
  - Icon: `{{< icon "github" >}}`
  - Steps: `{{% steps %}} ...`
  - Tabs: `{{< tabs >}}   {{< tab name="JSON" >}} ...`
  
- Latex, Mermaid (diagrams) are available


## Style

- Match the existing example-driven style: short paragraphs, tables for keyword/option matrices, and a syntax
  example for every construct.
- Hard-wrap prose at ~80 columns; one sentence per line is preferred.
- Prefer Markdown over embedded HTML; keep front matter minimal.
- Never edit generated output (`public/`, `resources/`).

## PRs

- Conventional commits, e.g. `docs(intro): …`, `docs(tools): …`.
- Run the production build before pushing; CI checks that the site builds.
- Link the corresponding parser change/PR when documenting a new feature.

## Gotchas

- `hugo.yaml` emits deprecated `renderHooks.*.enableDefault` warnings; these are pre-existing.
- Check `git status` before committing and leave unrelated untracked files alone.
