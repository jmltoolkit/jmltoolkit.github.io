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
val formatted: String? = JmlFmt().pp(input)

// visually:
// before:  int x=1;/*@ requires x>=0; @*/int y=x;
// after:   int x = 1; /*@ requires x >= 0; @*/ int y = x;
```

`JmlCommentsHelper` plugs into the formatting pipeline's `CommentsHelper`
interface:

* for ordinary comments it delegates to the stock `JavaCommentsHelper`;
* for `/*@`-shaped blocks it re-indents the whole comment to the target column
  with `preserveIndentation` — the comment's relative indentation is kept,
  so multi-line JML formulas are not mangled;
* JavaDoc and non-JML block comments are handled by the standard rules.

The CLI exposes this as the `format` subcommand:

```text
jmltk format File1.java File2.java ...
```

{{< callout type="warning" >}}
The `jmltk format` subcommand is registered but its wiring is still in
progress; call `JmlFmt` directly for a usable formatter today.
{{< /callout >}}

## `mlpp` — machine-learning layout research

The module also contains an experimental **feature extractor** (`mlpp` /
`FeatureExtractor`): it re-parses each file with JML processing enabled and
dumps per-construct layout features to `features.csv`. The output is meant as a
training set for a learned pretty-printer (the "mlpp" direction), not for
end users — contribution/research tooling only.
