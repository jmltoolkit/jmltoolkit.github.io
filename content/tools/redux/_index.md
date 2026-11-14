---
title: "Redux"
weight: 60
---

# Redux

The `:tools:redux` module is a pluggable **AST-to-AST transformation
framework**. It runs a pipeline of `Transformer`s over JavaParser nodes,
rewriting the tree step by step — the foundation for desugaring, feature
reduction and code generation. Each transformer is either wired in
programmatically or discovered via `ServiceLoader` and toggled through a
`ReduxConfig`.

## Usage

```kotlin
val config = ReduxConfig()
config.disable(AddForeachCountVariable::class.java)   // opt out per transformer
val facade = ReduxFacade.create(config)               // load enabled transformers

val rewritten: List<Node?> = facade.apply(listOf(cu))
```

`ReduxFacade` applies every enabled transformer in sequence to each node, so
later transformers see the output of earlier ones:

```kotlin
class ReduxFacade(private val config: ReduxConfig) {
    fun apply(nodes: List<Node>): List<Node?>
    companion object { fun create(config: ReduxConfig): ReduxFacade } // ServiceLoader
}
```

## Built-in transformers

| Transformer | Effect |
| ----------- | ------ |
| `AddForeachCountVariable` | wraps every `for-each` loop in a block that declares a JML ghost counter `\count` (`int \count`), incrementing it at the top of each iteration — gives loop bodies explicit access to the iteration index in specifications |
| `LambdaReplacer` | lifts a `LambdaExpr` into a synthetic inner class implementing the target functional interface, then replaces the lambda with `new InnerClass(...)` — makes lambdas digestible by tools that only handle classic Java |
| `RecordClassBuilder` | transforms a `RecordDeclaration` into a plain `final` class extending `java.lang.Record` (with optional JML invariants — `invariant_free` or `axiom` — and generated bodies), for targets without record support |

## Status

{{< callout type="info" >}}
Library-only: there is no dedicated CLI subcommand. Redux is the canonical way
for other tools to normalize Java additions (lambdas, records, enhanced `for`)
before processing them further.
{{< /callout >}}

The `Transformer` interface is open — implement it, register it as a service
provider (`META-INF/services/io.github.jmltoolkit.redux.Transformer`), and it
joins the pipeline automatically unless disabled in the config.
