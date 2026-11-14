---
title: KeY / Meta-Java
weight: 26
---

JMLtk parses KeY's ProofJava and SchemaJava extensions into the
`com.github.javaparser.ast.key` packages. This section documents those KeY
constructs; JML itself is documented in the [JML section](../jml/).

## Reading order

| Page | What it covers |
| ---- | -------------- |
| [Method frames](method-frames/) | `method-frame(...)`, `$methodFrame`, execution contexts |
| [Method calls](method-calls/) | `<expr> @ <type>;` and `<name> = <expr> @ <type>;` |
| [Loop scopes](loop-scopes/) | `loop-scope(...)`, `$loopScope` |
| [Catch-all statements](catch-all/) | `#catchAll(name) { ... }` |
| [`exec` and `ccatch`](exec-ccatch/) | `exec { ... } ccatch(...) { ... }` |
| [Java Card transactions](java-card/) | `#beginJavaCardTransaction`, `#commit...`, `#finish...`, `#abort...` |
| [Passive expressions](passive-expressions/) | `@(expr)` |
| [No-body declarations](no-body-declarations/) | constructors/methods without a body |
| [Schema variables](schema-variables/) | `#a`, typed schema variables, schema types, static-evaluation names |
| [Contextual blocks](contextual-blocks/) | `{ . ... .. ... ... }` |
| [Meta-constructs](meta-constructs/) | generic `#name(args)` and reserved-name configuration |

## Aliases and compatibility

- `method-frame` also accepts the `$methodFrame` spelling; `loop-scope` also
  accepts `$loopScope`.
- The old KeY proof-command `merge_point ( expr );` is no longer a dedicated
  statement: `merge_point` is contextual, and with a following `(` it parses as
  an ordinary `MethodCallExpr`. The JML merge-point statement is documented in
  [JML → Merge points](../jml/merge-point/).
- `#staticEvaluate`, `#createObject`, and `#lengthReference` are not reserved
  meta-constructs; they parse as ordinary `MethodCallExpr` calls. `#isstatic`
  and its `IsStaticMC()` production were removed.
- The generic `#name(args)` statement replaced the 23 name-specific
  meta-construct productions; see [Meta-constructs](meta-constructs/) for the
  reserved-name configuration.
- AST-only or currently unparsed nodes (`KeyMarkerStatement`,
  `KeyEscapeExpression`, `LogicalType`, `ArrayLengthValueDeclaration`,
  `KeyCatchBranch`) are not documented as construct pages.

The maintainer-oriented page map is `KEY_REFERENCE.txt` in this directory; it
is not part of the site navigation.
