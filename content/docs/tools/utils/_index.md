---
title: "Utils"
weight: 90
---

# Utils

The `:tools:utils` module is the shared internal library underneath the JMLtk
tools. There is no CLI and no user-facing surface — everything here exists to
be reused by the other modules, and most of it is specific to JML-aware
JavaParser processing.

## What lives here

| Class / object | Purpose |
| -------------- | ------- |
| `JMLUtils` | the JML contract helpers: **unrolling** `also`-joined spec cases into separate contracts, `createJointContract(...)` for building merged contracts, and `resolvedType2Type(...)` for converting solver-resolved types back to AST types |
| `JavaTemplate` | in-memory Java source templating (string-based code generation with placeholders), used by generators |
| `Pattern` | JML/Java pattern matching utilities (used by jml2java-style rewriting) |
| `LineColumnIndex` | fast line/column offset lookups, e.g. for mapping token ranges to positions |
| `Helper` | small collectives — e.g. `findAllJmlContainers` used by the pretty-printer research tooling |
| `TestWithJavaParser` | test scaffolding: a pre-wired JML-processing `JavaParser` for JUnit tests |

The most widely used entry point is `JMLUtils` — VCG and the other tools
depend on its contract semantics:

```kotlin
object JMLUtils {
    // separate `also`-joined JML spec cases; JML gives them disjunctive
    // semantics, and the VCG relies on keeping them apart (P1.1)
    fun unroll(contracts: NodeList<JmlContract>)

    // merge all cases into a conjunction (dropping per-case scoping)
    fun createJointContract(m: NodeList<JmlContract>): JmlContract

    // resolved type -> AST type conversion
    fun resolvedType2Type(type: ResolvedType): Type
}
```

{{< callout type="info" >}}
Because every other module depends on `:tools:utils`, treat it as stable:
its public API is leveraged by the LSP, VCG and lint modules, so changes are
managed through the same review process as the rest of the platform.
{{< /callout >}}

Consumers: [LSP](../lsp/), [VCG](../vcg/), [Lint](../lint/),
[Stat](../stat/), [pretty printing](../prettyprinting/).
