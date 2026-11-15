---
title: "Language Server Protocol"
weight: 40
---

## Overview

`jmltk-lsp` is the JMLtk language server. It adds JML and KeY support to any LSP-capable editor: syntax-aware diagnostics, document symbols, hover documentation, semantic highlighting and code actions for Java sources with embedded JML, standalone `.jml` files and KeY `.key` files. The server uses the JMLtk parser, so it understands contracts, clauses, JML statements and KeY proof scripts, and it reports the JML lint rules from [lint](../lint/) as diagnostics.

```java
class Account {
    //@ ghost int balance;
    /*@ normal_behavior
      @ requires amount > 0;
      @ ensures balance == \old(balance) + amount;
      @*/
    void deposit(int amount) {
        balance += amount;
    }
}
```

## Installation

1. Download the latest release from the [releases page](https://github.com/jmltoolkit/jmltk/releases) and extract it.
2. Use the `jmltk-lsp` script from the `bin` directory; Java 21 or newer is required.
3. Point your editor's LSP client at `/path/to/jmltk/bin/jmltk-lsp`.

{{< callout type="info" >}}
Replace `/path/to/jmltk` with the actual path to your JMLtk installation.
{{< /callout >}}

## Running the server

```shell
jmltk-lsp --stdio            # standard input/output, used by most editors
jmltk-lsp --server 9999      # listen on localhost:9999
jmltk-lsp --client 9999      # connect to a server on localhost:9999
jmltk-lsp --stdio --trace -  # print the JSON-RPC trace to stderr
```

| Option | Description |
|---|---|
| `--stdio` | Communicate over standard input/output. |
| `--server <port>` | Listen on a local TCP port and serve one client. |
| `--client <port>` | Connect to a listening server on `localhost:<port>`. |
| `--trace -` | Print the JSON-RPC trace to standard error. |
| `--trace <file>` | Write the JSON-RPC trace to a file. |

Server logs are written to `/tmp/lsp.log`.

## Project configuration

The server reads or creates `jmlproject.json` in each workspace folder:

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

- `enabledKeys` / `usedKeys` select the active JML annotation keys (same key mechanism as `ParserConfiguration#setJmlKeys`).
- `sourcePaths` adds source roots with optional `dependsOn` entries for symbol resolution.
- `disabledLinter` disables lint rules by class name.
- `disabledCodeActions` disables code actions by `id` or class name.

## Features

### Diagnostics

Parse errors are published as `jmltk-parse` diagnostics and JML lint findings as `jmltk-lint` diagnostics, using the supported document pull-diagnostic model.

### Symbols and navigation

- `JmlCatchSymbols` lists contracts, clauses, JML fields, `represents` and `accessible` declarations for Java/JML files.
- `KeyCatchSymbols` lists function declarations, predicates, schema variables and taclets for `.key` files.
- Go-to-declaration and selection ranges work in Java/JML sources.

### Hover documentation

Hovering a symbol shows its resolved declaration. Hovering a JML keyword shows the bundled keyword documentation: `doc.md` for JML clauses and `sol.md` for KeY sol-terms.

### Semantic highlighting

Semantic tokens are registered for `**/*.{jml,java}` and `**/*.key`. The Java highlighter also marks JML keywords and constructs, so specifications inside `//@` and `/*@ ... @*/` comments are highlighted independently of the editor's Java grammar.

### Code actions

| Action | Where | Effect |
|---|---|---|
| `Add a behavior keyword` | A contract without a behavior keyword | Inserts `behavior`, `normal_behavior`, `exceptional_behavior`, … as a snippet. |
| `Add a name to clause or contract` | An unnamed contract, clause or class-level declaration | Inserts a `name:` label. |
| `Add Quantification` | A JML expression at the cursor | Wraps it in `(\forall <type> <name>; …)`. |
| `Verify against parent` | A method contract | Verifies the contract against the overridden parent contract. |
| `Create KeY project file` | Anywhere in the workspace | Writes `project.key` into the workspace root. |

The first three actions use `SnippetTextEdit`, so the client must advertise snippet support. `Add boundary` and `Expand quantifier domain` are present in the action table but currently only advertise the quick-fix label without applying an edit.

## Editor setup

### Emacs (eglot)

```elisp
(setq eglot-server-programs nil)
(add-to-list 'eglot-server-programs
             '(java-mode  "/path/to/jmltk/bin/jmltk-lsp" "--stdio"))

(add-to-list 'auto-mode-alist '("\\.jml\\'" . java-mode))
```

Emacs does not know KeY files out of the box. Derive a mode for them:

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

{{< figure src="eglot_2.png" width="40%" caption="JML highlighting in emacs">}}
{{< figure src="eglot_1.png" width="40%" caption="KeY highlighting in emacs" >}}

### Emacs (lsp-mode)

```elisp
(use-package lsp-mode :ensure t :commands lsp)
(use-package lsp-ui :ensure t :commands lsp-ui-mode)

(add-to-list 'lsp-language-id-configuration '(java-mode . "java"))
(lsp-register-client
 (make-lsp-client :new-connection (lsp-stdio-connection '("/path/to/jmltk/bin/jmltk-lsp" "--stdio"))
                  :major-modes '(java-mode)
                  :server-id 'jmltk-lsp))
```

### Neovim (nvim-lspconfig)

```lua
local lspconfig = require('lspconfig')
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

lspconfig.jmltk_lsp.setup {
  capabilities = require('cmp_nvim_lsp').default_capabilities(),
}
```

{{< figure src="nvim_1.png" width="40%" caption="JML highlighting in neovim">}}
{{< figure src="nvim_2.png" width="40%" caption="KeY highlighting in neovim" >}}

## Troubleshooting

- Run with `--trace -` to inspect JSON-RPC traffic; the server log is `/tmp/lsp.log`.
- If code actions are missing, check the client's snippet support and the `disabledCodeActions` list in `jmlproject.json`.
- If JML annotations are ignored, check `enabledKeys` in `jmlproject.json`.

## Visual Studio Code

Requires a written plugin.

The feature set on this page was introduced in [PR #61](https://github.com/jmltoolkit/jmltk/pull/61).
