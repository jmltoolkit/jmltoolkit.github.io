---
title: "Pretty Printing"
weight: 50
---

# Pretty Printing

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

The module ships a standalone launcher and the aggregate CLI exposes the same
command as `jmltk pp` (alias `jmltk format`). It reads files or stdin, optionally
pretty-prints, and optionally highlights:

```bash
jmltk-pp -p Example.java                     # format
jmltk-pp -f ansi Example.java                # 256-color terminal output
jmltk-pp -f html --html-full Example.java    # Pygments class names + document
jmltk-pp -f latex Example.java               # \PYG body for a minted context
jmltk-pp -f latex --latex-raw Example.java   # \jml macros
jmltk-pp -f latex --latex-raw --latex-preamble > preamble.tex
printf 'requires x > 0;' | jmltk-pp --language jml -f html
```

Snippets are auto-detected as compilation units, members, statements, or
expressions; `--language jml` treats the input as a JML expression or clause.
HTML carries Pygments class names only (`kd`, `kt`, `nc`, `nf`, `mi`, `cm`, ...)
and no bundled CSS; `--css FILE` inlines your own stylesheet into the full
document. LaTeX minted mode emits `\PYG{class}{...}` content, while
`--latex-raw` emits semantic `\jml<class>{...}` macros whose `xcolor`
definitions are printed by `--latex-preamble`.

Compilation-unit formatting preserves JML comments, including `//@` line comments,
and highlights them inside Java files. Snippet formatting uses JavaParser's
printer and may normalize or drop comments around the snippet; use the original
text when comment layout matters.

## `mlpp` — machine-learning layout research

The module also contains an experimental **feature extractor** (`mlpp` /
`FeatureExtractor`): it re-parses each file with JML processing enabled and
dumps per-construct layout features to `features.csv`. The output is meant as a
training set for a learned pretty-printer (the "mlpp" direction), not for
end users — contribution/research tooling only.
