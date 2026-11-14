# JMLtk Documentation

Source of the documentation site at <https://jmltoolkit.github.io>. The site is
built with [Hugo](https://gohugo.io/) (extended) and the
[Hextra](https://github.com/imfing/hextra) theme, which is pulled in as a Hugo
module.

## Requirements

- [Hugo extended](https://gohugo.io/installation/) 0.156 or newer
- [Go](https://go.dev/doc/install) 1.26 or newer (for Hugo modules)
- Git

## Local development

```shell
git clone https://github.com/jmltoolkit/jmltoolkit.github.io.git
cd jmltoolkit.github.io

# Fetch/update the theme module
hugo mod tidy

# Start the live-reloading server at http://localhost:1313/
hugo server --logLevel debug --disableFastRender -p 1313
```

## Build

```shell
hugo --gc --minify
```

The generated site is written to `public/` (gitignored). To check a build
without touching the local output directory:

```shell
hugo --gc --minify --destination /tmp/jmltk-docs-build --cleanDestinationDir
```

## Content

All pages are Markdown under `content/`:

- `content/intro/` — getting started and showcase
- `content/jml/` — JML syntax and AST classes
- `content/key/` — Meta-Java
- `content/devel/` — development, build, and the full syntax reference
- `content/tools/` — CLI, LSP, lint, SMT, VCG, and other tools

`content/devel/syntax-elements.md` is the full syntax reference;
`content/jml/syntax-elements.md` mirrors it with a different title. Keep both in
sync when changing syntax documentation.

See `AGENTS.md` for agent-specific conventions and commands.

## Deployment

Every push to `main` triggers `.github/workflows/pages.yaml`, which builds the
site with Hugo extended 0.156.0 and Go 1.26 and deploys `public/` to GitHub
Pages.

## Updating the theme

```shell
hugo mod get -u
hugo mod tidy
```

See [Update modules](https://gohugo.io/hugo-modules/use-modules/#update-modules).
