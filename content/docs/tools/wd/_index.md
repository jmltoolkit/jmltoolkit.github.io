---
title: "WD"
weight: 100
---

# WD — Well-Definedness

The `:tools:wd` module checks the **well-definedness** of JML expressions. A
pure expression is only *well defined* if evaluating it cannot go wrong: every
array index is in bounds, every divisor is non-zero, every dereference is
non-null, and so on. The checker translates the expression's *WD condition*
into an SMT query (via the [SMT module](../smt/)) and asks the solver whether
the negation is satisfiable.

## Usage

```kotlin
object WdFacade {
    // "is this JML expression string well-defined?"
    fun isWelldefined(expr: String): Boolean
    fun isWelldefined(parser: JavaParser, expr: String): Boolean
    fun isWelldefined(e: Expression): Boolean
}
```

Internally `isWelldefined(e: Expression)`:

1. runs `WDVisitorExpr` over the expression, which for each sub-term emits its
   WD condition — `ArrayAccessExpr` yields `0 <= i && i < a.length`,
   `BinaryExpr` `/`/`%` yields `divisor != 0`, field accesses check their
   receiver, and logical connectives decompose into the WD conditions of their
   operands (`==>`/`<==>` become Boolean combinations, exactly as JML defines
   them);
2. if the collected condition is already `true` the expression is trivially
   well defined;
3. otherwise it asserts the **negation** of the WD condition and runs the
   solver — `unsat` means the condition always holds.

```text
expressions like  a[5] / b     → require  len(a) > 5  and  b != 0
even when they are not proven, the answers are per-expression, so a
scheduled lint can pinpoint the failing sub-term.
```

The statement-level `WDVisitor` walks method bodies (JML expression statements
etc.) to collect WD-relevant sub-expressions for whole-method checks.

## CLI

```text
jmltk wd [--jml-key KEY ...] FILE|DIR ...
```

Registered via `FileBasedCommand` (with JML processing enabled and the `key`
key set by default) and wired to `WDVisitor`; the command's reporting loop is
still being fleshed out.

{{< callout type="info" >}}
`isWelldefined(String)` accepts a *bare JML expression* string (not a file) —
useful for interactive checks and as the basis for editor diagnostics.
Solver answers requiring Z3 fail closed: without `z3` on `PATH` the check
returns `false`.
{{< /callout >}}

Test data includes CSV corpora of well-defined and non-well-defined
expressions (`wd-expr.csv` / `not-wd-expr.csv`) covering the arithmetic,
array- and null-related cases above.
