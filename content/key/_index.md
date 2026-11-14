---
title: KeY / Meta-Java
weight: 26
---

JMLtk parses KeY's ProofJava and SchemaJava extensions into the
`com.github.javaparser.ast.key` packages. This section documents those KeY
constructs; JML itself is documented in the [JML section](../jml/).

## Overview

{{< cards cols="2" >}}
  {{< card link="method-frames/" title="Method frames" icon="document-text" subtitle="`method-frame(...)`, `$methodFrame`, execution contexts" >}}
  {{< card link="method-calls/" title="Method calls" icon="code" subtitle="`<expr> @ <type>;` and `<name> = <expr> @ <type>;`" >}}
  {{< card link="loop-scopes/" title="Loop scopes" icon="refresh" subtitle="`loop-scope(...)`, `$loopScope`" >}}
  {{< card link="catch-all/" title="Catch-all statements" icon="exclamation-circle" subtitle="`#catchAll(name) { ... }`" >}}
  {{< card link="exec-ccatch/" title="exec and ccatch" icon="terminal" subtitle="`exec { ... } ccatch(...) { ... }`" >}}
  {{< card link="java-card/" title="Java Card transactions" icon="credit-card" subtitle="`#beginJavaCardTransaction`, `#commit...`, `#finish...`, `#abort...`" >}}
  {{< card link="passive-expressions/" title="Passive expressions" icon="eye" subtitle="`@(expr)`" >}}
  {{< card link="no-body-declarations/" title="No-body declarations" icon="document" subtitle="constructors/methods without a body" >}}
  {{< card link="schema-variables/" title="Schema variables" icon="puzzle" subtitle="`#a`, typed schema variables, schema types, static-evaluation names" >}}
  {{< card link="contextual-blocks/" title="Contextual blocks" icon="code" subtitle="`{ . ... .. ... ... }`" >}}
  {{< card link="meta-constructs/" title="Meta-constructs" icon="cog" subtitle="generic `#name(args)` and reserved-name configuration" >}}
{{< /cards >}}

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

The maintainer-oriented references [KEY_REFERENCE.txt](KEY_REFERENCE.txt)
(project/test links) and [KEY_BOOK_INDEX.txt](KEY_BOOK_INDEX.txt) (construct →
KeY Book chapter/page index) live in this directory; they are not part of the
site navigation.
