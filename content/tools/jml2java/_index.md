---
title: "JML2Java"
weight: 20
---

# JML2Java

The `:tools:jml2java` module is an experimental *JML-to-Java* source
translation layer: it rewrites JML specification expressions **back into
executable Java code**, so that specifications can be executed or compiled by a
plain Java toolchain. It is the reverse direction of the parser — instead of
reading JML annotations out of Java, it expands them into Java statements.

## What it translates

The entry point is `Jml2JavaFacade`:

```kotlin
object Jml2JavaFacade {
    // translate a JML expression to Java statements + an expression,
    // introducing temporaries into the target block as needed
    fun translate(expression: Expression?): Pair<BlockStmt, Expression?>

    // does the expression contain JML constructs at all?
    fun containsJmlExpression(expression: Expression?): Boolean
}
```

`Jml2JavaTranslator` lowers the JML-specific expression forms:

* **`\forall` / `\exists` quantified expressions** — expanded into loops over
  the quantified variable's range (with `findLowerBound` / `findUpperBound`
  recovering the range from the bound declaration), `\exists` as the logical
  complement of a `\forall` loop;
* **`\let` expressions** — hoisted into local variable declarations;
* **JML operators** — `==>` (implication), `<==` (reverse implication), `<==>`
  (equivalence), `\<:` (subtype), `..` (range) and `\lock`-family operators are
  detected by `containsJmlExpression` and desugared to plain Java;
* **model / ghost state** — assignments to model fields are turned into
  assignments to fresh local temporaries (`createAssignmentAndAdd`).

## Status

{{< callout type="warning" >}}
Experimental prototype. The library API (`Jml2JavaFacade.translate`) works and
is exercised by `Jml2JavaTranslatorTest` / `Jml2JavaTests`; the CLI subcommand
`jmltk jml2java` is registered but not yet implemented. Expect translation
results to need manual review.
{{< /callout >}}

Related tooling for the same boundary lives in the `jmlstub` module (CLI
`jmltk stubby`): instead of *removing* JML it generates Java **stubs from
class files/JRE classes** — method signatures plus an "effective JML
specification" folder — so a library's contract surface becomes available to
the tools without shipping sources.
