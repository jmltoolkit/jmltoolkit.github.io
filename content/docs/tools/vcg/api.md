---
title: "API"
weight: 3
---

# Using the VCG API

The generator lives in the `:tools:vcg` Gradle module, package
`io.github.jmltoolkit.vcg`. Everything is plain Kotlin on top of the JMLtk
parser: parse with JML processing enabled, pick a callable, build a `VcgContext`,
run the engine, and check the resulting conditions with a solver.

## Minimal example

```kotlin
import com.github.javaparser.JavaParser
import com.github.javaparser.ParserConfiguration
import com.github.javaparser.symbolsolver.JavaSymbolSolver
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver
import com.github.javaparser.symbolsolver.resolution.typesolvers.JavaParserTypeSolver
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver
import io.github.jmltoolkit.vcg.Vcg
import io.github.jmltoolkit.vcg.VcgContext
import io.github.jmltoolkit.vcg.VcgOptions
import java.nio.file.Path

fun main() {
    // 1. Parse with JML processing and symbol resolution (as in the test suites)
    val config = ParserConfiguration().apply {
        setProcessJml(true)
        setSymbolResolver(
            JavaSymbolSolver(
                CombinedTypeSolver(
                    JavaParserTypeSolver(Path.of("src/main/java")),
                    ReflectionTypeSolver()
                )
            )
        )
    }
    val cu = JavaParser(config).parse(Path.of("src/main/java/example/Account.java")).result.get()

    // 2. Pick the callable and run the generator
    val method = cu.types[0]
        .asClassOrInterfaceDeclaration()
        .methods.first { it.nameAsString == "withdraw" }
    val options = VcgOptions() // defaults: BOUNDED mode, unroll loops, contract calls
    val result = Vcg(VcgContext.of(method), options).verify()

    // 3. Run the solver and classify every condition
    val statuses = result.check() // memoized: solver runs at most once
    for (vc in result.conditions) {
        println("${statuses[vc.id]}  ${vc.id}  ${vc.description}")
    }
}
```

The only moving parts are the order of the three steps above — nothing else needs
wiring. Constructors work the same way: pick the
`ConstructorDeclaration` and build the context with `VcgContext.of(ctor)`.

{{< callout type="info" >}}
`solver = Solver()` shells out to `z3` on `PATH` (per Solver instance). Check
`io.github.jmltoolkit.smt.Z3.z3Installed()` and skip or fail the verification
gracefully when Z3 is unavailable.
{{< /callout >}}

## `Vcg` and `VcgContext`

`VcgContext` is the unit of verification: a callable plus its JML spec cases.

```kotlin
data class VcgContext(
    val callable: CallableDeclaration<*>,
    val contracts: List<JmlContract>,
) {
    val enclosingType: TypeDeclaration<*>
    companion object { fun of(callable: CallableDeclaration<*>): VcgContext }
}
```

`VcgContext.of` unrolls the merged contract and — importantly — keeps multiple
JML spec cases (`/*@ requires …; ensures …; @*/ also …`) as separate cases;
they are *never* merged into one conjunctive contract, because JML gives them
disjunctive semantics. Use the context directly when you already have a
`CallableDeclaration`; use the facade below when you work from whole
`CompilationUnit`s.

```kotlin
class Vcg(private val ctx: VcgContext, private val options: VcgOptions) {
    fun verify(): VcgResult
}
```

## `VcgResult` and `VerificationCondition`

```kotlin
data class VcgResult(
    val query: SmtQuery,                       // the whole SMT query
    val conditions: List<VerificationCondition>, // one entry per block in the query
) {
    enum class Status { PROVEN, FAILED, UNKNOWN }

    fun check(solver: Solver = Solver()): Map<String, Status>
    fun checkProgressive(
        onCondition: (index: Int, total: Int, status: Status?) -> Unit,
        solver: Solver = Solver(),
        isCancelled: () -> Boolean = { false },
        timeoutMillis: Long = 0,
    ): Map<String, Status>
    fun failedConditions(solver: Solver = Solver()): List<VerificationCondition>
}

data class VerificationCondition(
    val id: String,        // "VcgExamples#abs(int)#postcondition-1@8:0"
    val description: String,
    val obligation: SExpr,      // the negated obligation formula
    val range: Range? = null,   // source anchor, may be null
    val kind: String = "check", // postcondition, assert, loop-invariant-preserved, divbyzero, …
)
```

* `check()` runs the solver once and memoizes the per-condition status map; later
  calls, including from `failedConditions()`, never re-invoke the solver. If you
  need a *different* solver for a second run, `result.copy()` and check the copy.
* `checkProgressive()` reports progress (`onCondition` is called once per answer
  received, then again with the final status), and both `isCancelled` and
  `timeoutMillis` abort a stuck solver to `UNKNOWN` instead of blocking forever.
* Each condition's `obligation` is the *negated* formula asserted under its
  `:named` block — see [Proof Obligations & SMT Encoding](obligations/).

## `VcgOptions`

| Property | Default | Meaning |
| -------- | ------- | ------- |
| `mode` | `BOUNDED` | bit-vectors with Java overflow; `UNBOUNDED` = mathematical integers |
| `defaultLoopStrategy` | `UNROLL` | also `INVARIANT`, `LOOP_CONTRACT` |
| `loopStrategies` | `{}` | per-loop override, keyed by the `WhileStmt` node |
| `defaultUnrollDepth` | `10` | unrolling constant for unrolled loops |
| `loopUnrollDepth` | `{}` | per-loop unroll depth |
| `defaultCallStrategy` | `CONTRACT` | replace calls by their JML contract; also `INLINE` |
| `callStrategies` | `{}` | per-call-site override, keyed by the `MethodCallExpr` node |
| `maxInlineDepth` | `3` | recursion bound when inlining |
| `checkOverflow` | `false` | flag wrap-arounds in BOUNDED mode (bit-vectors already wrap like Java) |
| `checkDivision` | `true` | no `/ %` by zero |
| `checkIndex` | `true` | no out-of-bounds array index |
| `checkNull` | `true` | no null dereference |
| `checkCast` | `true` | no failing reference cast |
| `checkNegativeArraySize` | `true` | no negative `new T[n]` |
| `checkStringIndex` | `true` | string/`StringBuilder` index bounds + the abstract-string model |
| `allowUnrefinedCalls` | `false` | havoc caller-visible frame for contract-less, body-less callees instead of rejecting |

The six exception checks are on **by default** (policy P3.3): the encoded model
does not throw, so without them a proven method could still crash in Java.
`checkOverflow` is deliberately opt-in — BOUNDED bit-vectors already implement
Java wraparound, the check only *flags* unintended wraparounds (and is vacuous in
UNBOUNDED mode).

## `VcgFacade` — whole classes and files

When you have `CompilationUnit`s instead of pre-selected callables, the facade
selects targets, generates and checks in one place, and shares a content-keyed
cache across runs:

```kotlin
class VcgFacade(
    val options: VcgOptions = VcgOptions(),
    val pool: ForkJoinPool = ForkJoinPool.commonPool(),
    private val solver: () -> Solver = { Solver() },
    private val cache: VcgCache = InMemoryVcgCache(),
)
```

| Method | Returns | What it does |
| ------ | ------- | ------------ |
| `targets(cu)` / `targets(cus)` | `List<CallableDeclaration<*>>` | the callables carrying a JML contract **and** a body |
| `verify(callable)` | `VcgResult` | generate conditions for one callable |
| `verifyAll(callables)` / `verifyAll(cus)` | `List<VcgResult>` | generate for all targets (parallel on `pool`) |
| `check(result)` | `Map<String, Status>` | run the solver (delegates to `result.check()`) |
| `checkAsync(result)` | `ForkJoinTask<…>` | solver run on the pool |
| `checkAll(results)` | `List<VcgOutcome>` | check many results |
| `verifyAndCheck(callable)` | `VcgOutcome` | generate + check one callable |
| `verifyAndCheckAll(callables)` / `verifyAndCheckAll(cus)` | `List<VcgOutcome>` | generate + check all targets; overload with `onOutcome` streams results per callable as they finish |

```kotlin
data class VcgOutcome(
    val result: VcgResult,
    val statuses: Map<String, VcgResult.Status>,
)

// content-addressable identity of a query, used by the cache:
val key = VcgFacade.contentKey(result)   // SHA-256 of the normalized SMT text
```

The `contentKey` normalizes away comments, whitespace and the `:named` symbols
before hashing, so renaming a condition never invalidates a cached solver
answer; only the solver-visible content matters.

## Generating golden snapshots

The test suites (`VcgSemanticsTest`, `VcgGoldenQueriesTest`) are the reference
for the API in action:

```text
# regenerate the .smt2 golden files for the fixture methods
UPDATE_GOLDEN=1 ./gradlew :tools:vcg:test --tests "*VcgGoldenQueriesTest*"
```

`VcgGoldenQueriesTest` then asserts the generated queries byte-for-byte match
the goldens; `VcgSemanticsTest` runs the full generation pipeline on each
fixture and proves (or falsifies) the conditions with Z3, in both arithmetic
modes where applicable.
