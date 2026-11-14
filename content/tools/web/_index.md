---
title: "Web"
weight: 110
---

# Web

The `:tools:web` module is a local **web playground** for the JML parser and
tools. It starts a small [Ktor](https://ktor.io/) server on
`http://localhost:8000`, where you paste Java/JML source into a form and
immediately see how JMLtk parses and processes it — no build or IDE needed. It
is the quickest way to try the parser, the pretty-printer and the diagnostics
together.

## Running

```text
./gradlew :tools:web:run
```

then open <http://localhost:8000>. The server also serves static resources from
the bundled `assets` directory.

## What the page shows

For the submitted source the playground reports, in accordions:

* **Parsing** — success/failure, the duration, and the active JML keys
  (`KEY`, `OpenJml`, `ESC`, `RAC` — toggled via checkboxes, alongside a
  *"Do not process JML"* switch that disables JML parsing altogether);
* **Parse issues** — every `Problem` reported by the parser;
* **Linting issues** — the linting section is wired to `JmlLintingFacade` in
  the code but currently kept disabled (it needs a rework to run the headline
  rules selectively);
* **Pretty printed** — the parse result re-emitted through the
  `DefaultPrettyPrinter`;
* **AST** — the full parse tree rendered as nested HTML (`<ul class="ast">`),
  one entry per AST node, so you can inspect node types, positions and JML
  children directly.

The page posts to `POST /parse`; parameters are the source text plus the
`keyKey` / `keyOpenJml` / `keyESC` / `keyRAC` / `doNotProcessJml` toggles, so
the same form is usable from a REST client as a headless parse-and-report
service.

{{< callout type="info" >}}
Use the playground to reproduce a parser problem before filing a bug: paste the
snippet, check the "Parse issues" pane, and attach its output (plus the active
key set) to the issue.
{{< /callout >}}
