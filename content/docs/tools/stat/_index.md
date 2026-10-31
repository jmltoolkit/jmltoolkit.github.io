---
title: "Stat"
weight: 80
---

# Stat

The `:tools:stat` module measures **how much and what kind of specification** a
project has. It walks every declaration and contract, counts the JML constructs
(clauses, modifiers, behaviors, binders, class expressions) and estimates the
cost of specification terms — the numbers VCG users care about when scaling
verification effort.

## Counters

The core is a keyed, hierarchical `Statistics` accumulator:

```kotlin
data class Statistics(
    val data: MutableMap<StatisticKey<*>, Any>,   // keyed counts
    val children: MutableList<Statistics>,         // per-node subtrees
) {
    operator fun get(key: JmlClauseKind)   // e.g. Statistics()[JmlClauseKind.REQUIRES]
    operator fun get(key: String)          // e.g. "requires"
    fun inc(key: StatisticKey<*>)          // increment-many helper
    fun subStat(n: Node)                   // attach a subtree to an AST node
    fun summary(): Statistics              // aggregate children into a total
    operator fun plus(x: Statistics)       // fold two trees
}
```

Keys are registered per name in `StatisticKeys` (clauses become
`CLAUSE_<KIND>`, modifiers `MODIFIER_<KEYWORD>`, plus `BEHAVIOR_`, `BINDER_`
and `CLASS_` keys); string lookups are normalized (`\result` → `RESULT`).
`JmlStatisticsReporter` visits a `CompilationUnit` and increments the right
counters; `ExpressionCosts` assigns a cost to each expression node.

## CLI

```text
jmltk stat [-t TEXT|JSON|CSV|XML] [-c COLUMN ...] [--jml-key KEY] FILE|DIR ...
```

* `-t/--target` — output format; `TEXT` prints an indented per-unit table
  (`TOTAL` first, then one `C` block per compilation unit, `T` per type, `c`
  per constructor/method), `XML` emits a `statistics-model` document built by
  the legacy `StatVisitor`; `JSON`/`CSV` are declared but not yet wired.
* `-c/--column` — restrict output to the named statistic keys (repeatable).
* files and directories are accepted; directories are scanned recursively for
  `*.java`. JML parsing uses the `KEY` key set when `--jml-key` is absent.

## Library usage

```kotlin
val statistics = Statistics()
val reporter = JmlStatisticsReporter()
for (node: CompilationUnit in units) reporter.visit(node, statistics)

val requiresCount: Int = statistics[JmlClauseKind.REQUIRES]
val totalClauses: Int = statistics[JmlClauseKind.REQUIRES] // per-kind view
val txt = StatisticsTxtOutput(PrintWriter(System.out), selectedColumns).also {
    it.start(); it.run(statistics, units); it.end()
}
```
