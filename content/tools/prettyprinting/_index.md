---
title: "Pretty Printing"
weight: 50
---

The `:tools:prettyprinting` module formats Java source files **including their
JML comments**. It is built around the same layout engine as
[google-java-format](https://github.com/google/google-java-format), extended
with a JML-aware comments helper: ordinary Java code is re-laid-out with the
standard rules while `/*@ ... @*/` JML blocks are kept and re-indented as a
unit, preserving their internal structure.

## Usage

The engine is the `JmlFmt` class — feed it a source string and read back the
formatted text:

```kotlin
import io.github.jmltoolkit.prettyprinting.JmlFmt

val formatted: String = JmlFmt().pp(input)

// visually:
// before:  int x=1;/*@ requires x>=0; @*/int y=x;
// after:   int x = 1; /*@ requires x >= 0; @*/ int y = x;
```

`JmlCommentsHelper` plugs into the formatting pipeline's `CommentsHelper`
interface:

* for ordinary comments it delegates to the stock `JavaCommentsHelper`;
* for `/*@`-shaped blocks (and `//@` line comments) it preserves the original
  text, so the first line is placed at the target column and the comment's
  relative indentation is kept;
* JavaDoc and non-JML block comments are handled by the standard rules.

## CLI: `jmltk-pp`

The module ships a standalone launcher (`jmltk-pp`) and the aggregate CLI
exposes the same command as `jmltk pp` (alias `jmltk format`). It reads files
or stdin, optionally pretty-prints, and optionally highlights.

```bash
jmltk-pp -p Example.java                     # format
jmltk-pp -f ansi Example.java                # 256-color terminal output
jmltk-pp -f html --html-full Example.java    # Pygments class names + document
jmltk-pp -f latex Example.java               # \PYG body for a minted context
jmltk-pp -f latex --latex-raw Example.java   # \jml macros
jmltk-pp -f latex --latex-raw --latex-preamble > preamble.tex
printf 'requires x > 0;' | jmltk-pp --language jml -f html
```

| Option | Default | Meaning |
| ------ | ------- | ------- |
| `-p`, `--pretty-print` | off | Format the input before rendering |
| `-f`, `--format` | `text` | Output format: `text`, `ansi`, `html`, `latex` |
| `--language` | `java` | Input language: `java` or `jml` |
| `--snippet` | `auto` | Java input kind: `auto`, `cu`, `member`, `stmt`, `expr` |
| `-w`, `--width` | `100` | Line width used by the formatter |
| `--style` | — | Pygments/minted style name for LaTeX |
| `--minted` | on for `latex` | Emit `\PYG{class}{...}` body content |
| `--latex-raw` | off | Emit semantic `\jml<class>{...}` macros instead |
| `--latex-preamble` | off | Print the `\jml` macro and `xcolor` definitions |
| `--html-full` | off | Emit a full HTML document, not just a fragment |
| `--css` | — | Inline this CSS file into a full HTML document |
| `--no-color` | off | Force plain text |
| `--version` | — | Print the JMLtk version and exit |

Multiple `FILES` are rendered one after another; with no file argument the
input is read from stdin.
`--minted` and `--latex-raw` are mutually exclusive, and `--latex-preamble`
requires `--format latex --latex-raw`.
Exit codes: `0` success, `1` usage or I/O error, `3` rendering/parsing error.

Snippets are auto-detected as compilation units, members, statements, or
expressions; `--language jml` treats the input as a JML expression or clause.
HTML carries Pygments class names only (`kd`, `kt`, `nc`, `nf`, `mi`, `cm`, ...)
and no bundled CSS; `--css FILE` inlines your own stylesheet into the full
document.
LaTeX minted mode emits `\PYG{class}{...}` content, while `--latex-raw` emits
semantic `\jml<class>{...}` macros whose `xcolor` definitions are printed by
`--latex-preamble`.

Compilation-unit formatting preserves JML comments, including `//@` line
comments, and highlights them inside Java files.
Snippet formatting uses JavaParser's printer and may normalize or drop comments
around the snippet; use the original text when comment layout matters.

The CLI is covered by end-to-end shell tests in `tools/cli/shell-tests/`, which
check the formatted text and each renderer (see PR #101).

## `mlpp` — machine-learning layout research

The module also contains an experimental **feature extractor** (`mlpp` /
`FeatureExtractor`): it re-parses each file with JML processing enabled and
dumps per-construct layout features to `features.csv`.
The output is meant as a training set for a learned pretty-printer (the "mlpp"
direction), not for end users — contribution/research tooling only.
