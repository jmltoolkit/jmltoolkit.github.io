---
title: "SMT"
weight: 70
---

# SMT

The `:tools:smt` module is the **SMT-LIB layer** shared by the
[verification condition generator](../vcg/) and the
[well-definedness checker](../wd/). It provides the S-expression model, the
translation of JML expressions into SMT-LIB formulas, solvers (Z3) and the
parsing of solver answers. If you are only *checking* proofs, you rarely touch
this module directly — but it is the lingua franca every other tool speaks.

## Model

SMT-LIB terms are built from the `SExpr` hierarchy:

```kotlin
sealed class SExpr                    // a term
class SAtom : SExpr                   // symbols, numerals, sorts     (int, bool, U, ...)
class SList : SExpr                   // function application terms   (= x y), (forall ...)
enum class SmtType { INT, BOOL, ... }

class SmtTermFactory                  // makeTrue/makeFalse, and/or/impl, forall, ite, symbol, ...
class SmtQuery {
    fun declareFun(name: String, params: List<SmtType>, type: SmtType)
    fun addAssert(expr: SExpr)
    fun checkSat()
    override fun toString(): String   // complete SMT-LIB script
}
```

## Translation

`JmlExpr2Smt` walks a JavaParser expression (including JML operators such as
`==>`, `\old`, `\forall`, `\result`) and emits the corresponding SExpr. The
*same* translation is available in two arithmetic encodings:

```kotlin
sealed class ArithmeticTranslator
class IntArithmeticTranslator          // 'int'/'long' as unbounded Int (UNBOUNDED mode)
class BitVectorArithmeticTranslator    // 'int' = (_ BitVec 32) with Java wrap-around (BOUNDED mode)

object SMTFacade {
    fun toSmt(expr: Expression, smtLog: SmtQuery, useInt: Boolean): SExpr
}
```

Use `useInt = true` for unbounded mathematical integers, `false` for the
bit-vector encoding with Java overflow semantics.

## Solvers & answers

```kotlin
open class Solver(defaultTimeoutMillis: Long = 60_000L) {   // one z3 process per instance
    open fun run(query: AppendableTo): SolverAnswer
    open fun run(input: String, onForm: ..., isCancelled: ..., timeoutMillis: ...): SolverAnswer
    fun runAsync(input: String): ForkJoinTask<SolverAnswer>
}

class SolverAnswer {            // parses the solver's stdout
    fun isSymbol(symbol: String): Boolean   // "unsat" / "sat" / "unknown"
    fun consumeErrors()
    fun consume()               // advance to the next answer
}
```

A `SolverAnswer` holds one verdict per `check-sat` in the query; `consume()`
steps through them in order. The default constructor requires `z3` on `PATH` —
probe with `io.github.jmltoolkit.smt.Z3.z3Installed()` and skip gracefully
when it is missing.

{{< callout type="info" >}}
The generated scripts are plain SMT-LIB 2, so any conforming solver can be
used; Z3 ships with the repository's test infrastructure. Golden queries under
`tools/vcg/src/test/resources/golden/` are produced by this layer and are valid
inputs for `z3 file.smt2` directly.
{{< /callout >}}
