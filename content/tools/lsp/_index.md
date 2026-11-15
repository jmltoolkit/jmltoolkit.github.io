---
title: "Language Server Protocol"
weight: 40
---

## Overview

The JMLtk Language Server Protocol (LSP) implementation provides IDE support for Java sources with embedded JML, standalone `.jml` files and KeY `.key` files. To use the LSP, you need to download the current release of JMLtk and configure your editor to use the `jmltk-lsp` script.

The server understands JML contracts, clauses and statements, the KeY-specific language extensions and the KeY proof-script syntax, and it exposes the JML lint rules from `tools/lint` as diagnostics.

## Installation

1. Download the latest release of JMLtk from the [releases page](https://github.com/jmltoolkit/jmltk/releases)
2. Extract the archive to your preferred location
3. The `jmltk-lsp` script will be available in the `bin` directory of the installation

The server requires Java 21 or newer.

{{< callout type="info" >}}
Replace `/path/to/jmltk` with the actual path to your JMLtk installation.
{{< /callout >}}

## Running the server

`jmltk-lsp` supports three transports and optional protocol tracing:

| Option | Description |
|---|---|
| `--stdio` | Communicate over standard input/output. This is the mode used by most editors. |
| `--server <port>` | Listen on a local TCP port and serve a single client connection. |
| `--client <port>` | Connect to an already listening TCP server on `localhost:<port>`. |
| `--trace -` | Print the JSON-RPC message trace to standard error. |
| `--trace <file>` | Write the JSON-RPC message trace to the given file. |

Server logs are written to `/tmp/lsp.log`.

## Project configuration

On startup the server reads or creates a `jmlproject.json` file in each workspace folder:

```json
{
  "enabledKeys": [],
  "usedKeys": [],
  "sourcePaths": [],
  "disabledLinter": [],
  "disabledCodeActions": [
    "jml.verify.liskov",
    "jml.welldefinedness-check"
  ]
}
```

- `enabledKeys` / `usedKeys` select the JML annotation keys that are processed (the same key mechanism as `ParserConfiguration#setJmlKeys`).
- `sourcePaths` adds source roots with optional `dependsOn` entries for symbol resolution.
- `disabledLinter` disables individual lint rules by their class name.
- `disabledCodeActions` disables individual code actions by their class name or `id`.

## Features

### Diagnostics

Parse errors are published as `jmltk-parse` diagnostics and JML lint findings as `jmltk-lint` diagnostics. The supported document pull-diagnostic model keeps the diagnostics in sync while typing.

### Document and workspace symbols

- For Java/JML files, `JmlCatchSymbols` provides symbols for contracts, clauses, JML fields, `represents` and `accessible` declarations.
- For `.key` files, `KeyCatchSymbols` provides symbols for function declarations, predicates, schema variables and taclets.

### Hover and navigation

Hovering a JML or Java symbol shows its resolved declaration. Hovering a JML keyword shows the keyword documentation shipped with the server (`doc.md` for JML clauses, `sol.md` for KeY sol-terms). Go-to-declaration and selection ranges are supported for Java/JML sources.

### Semantic highlighting

Semantic tokens are available for `**/*.{jml,java}` and `**/*.key`. The Java highlighter also marks JML keywords and constructs, so embedded specifications are highlighted independently of the editor's Java grammar.

### Code actions

The server advertises code actions from a `ServiceLoader`-based action table. The following actions are currently offered:

| Action | Where | Effect |
|---|---|---|
| `Add a behavior keyword` | A JML contract without a behavior keyword | Inserts a behavior keyword using a snippet with the available choices (`behavior`, `normal_behavior`, `exceptional_behavior`, …). |
| `Add a name to clause or contract` | An unnamed contract, clause or class-level declaration | Inserts a `name:` label. |
| `Add Quantification` | A JML expression around the cursor | Wraps the expression in `(\forall <type> <name>; …)`. |
| `Verify against parent` | A method contract | Runs the Liskov-style verification against the overridden parent contract. |
| `Create KeY project file` | Anywhere in the workspace | Writes a `project.key` file into the workspace root. |

`Add a behavior keyword`, `Add a name to clause or contract` and `Add Quantification` use `SnippetTextEdit`; the client must advertise snippet support to apply them.

The quantifier actions `Add boundary` and `Expand quantifier domain` are present in the action table but currently only advertise the quick-fix label; they do not apply an edit yet.

## Configuration

The following configurations were tested:

### Emacs (eglot)

Add the following configuration to your Emacs init file to enable LSP support for Java:

```elisp
(setq eglot-server-programs nil)
(add-to-list 'eglot-server-programs
             '(java-mode  "/path/to/jmltk/bin/jmltk-lsp" "--stdio"))
```

Emacs does not know KeY or JML files out of the box.

For KeY files, derive a new mode from `prog-mode`:

```elisp
(define-derived-mode key-mode prog-mode "KEY"
  "Major mode for editing KEY"
  :syntax-table java-mode-syntax-table
  (setq-local comment-start "//")
  (setq-local comment-end "")
  (setq-local indent-tabs-mode nil))

(add-to-list 'eglot-server-programs
             '(key-mode  "/path/to/jmltk/bin/jmltk-lsp" "--stdio"))
```

For JML files, just add `jml` to the `auto-mode-alist`:

```elisp
(add-to-list 'auto-mode-alist '("\\.jml\\'" . java-mode))
```

{{< figure src="eglot_2.png" width="40%" caption="JML highlighting in emacs">}}
{{< figure src="eglot_1.png" width="40%" caption="KeY highlighting in emacs" >}}

### Emacs (lsp)

```
(use-package lsp-mode
  :ensure t
  :init (setq lsp-keymap-prefix "C-c l")
  :hook ((python-mode . lsp)
         (rust-mode . lsp)
         (lsp-mode . lsp-enable-which-key-integration))
  :commands lsp)

(use-package lsp-ui :ensure t :commands lsp-ui-mode)

```

### Neovim (nvim-lspconfig)

Add the following configuration to your Neovim `init.lua` to enable LSP support:

```lua
local lspconfig = require('lspconfig')

-- Define a custom configuration for jmltk-lsp
local configs = require('lspconfig.configs')
if not configs.jmltk_lsp then
  configs.jmltk_lsp = {
    default_config = {
      cmd = { '/path/to/jmltk/bin/jmltk-lsp', '--stdio' },
      filetypes = { 'java', 'key' },
      root_dir = lspconfig.util.root_pattern('.git'),
      settings = {},
    }
  }
end

-- Attach to Java files
lspconfig.jmltk_lsp.setup {
  on_attach = function(client, bufnr)
    -- Your on_attach configuration here
  end,
  capabilities = require('cmp_nvim_lsp').default_capabilities(),
}
```

{{< figure src="nvim_1.png" width="40%" caption="JML highlighting in neovim">}}
{{< figure src="nvim_2.png" width="40%" caption="KeY highlighting in neovim" >}}

## Troubleshooting

- Enable `--trace -` to inspect the JSON-RPC traffic; the server writes its own log to `/tmp/lsp.log`.
- If code actions are missing, check that the client advertises snippet support and that the action is not listed in `disabledCodeActions` in `jmlproject.json`.
- If JML annotations are not processed, check `enabledKeys` in `jmlproject.json` and the active JML annotation keys.

## Visual Studio code

Requires a written plugin....
