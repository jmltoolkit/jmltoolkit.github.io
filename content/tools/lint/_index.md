---
title: "Lint"
weight: 30
---

# Lint

The `:tools:lint` module statically checks Java/JML sources for specification
problems. Every rule is a `LintRule` visitor over the AST; the facade runs the
configured rules and reports `LintProblem`s, optionally as
[SARIF 2.1.0](https://sarifweb.azurewebsites.net/) for editor/tooling
integration (e.g. GitHub code scanning).

## Usage

```kotlin
val facade = JmlLintingFacade(JmlLintingConfig())

// collect problems (sorted by source location)
val problems: Collection<LintProblem> = facade.lint(nodes)

// stream them to a reporter as they are found
facade.lint(LintProblemReporter { problem -> ... }, nodes)

// SARIF 2.1.0 document for CI integration
val sarif: SarifSchema = facade.asSarif(problems)
```

`LintProblem` carries everything a tool needs:

```kotlin
data class LintProblem(
    val level: String,          // e.g. "WARNING" / "ERROR"
    val message: String,
    val location: TokenRange?,  // source span
    val category: String?,      // e.g. rule family
    val ruleId: String,         // fully-qualified rule name
)
```

## Configuration

```kotlin
data class JmlLintingConfig(
    val checkNameClashes: Boolean,        // JML names vs. Java names (default true)
    val checkMissingNames: Boolean,       // missing declarations (default true)
    val topLevelNullity: DefaultNullity,  // default top-level nullability (NON_NULL)
    val checkJspecifyNullness: Boolean,   // JSpecify annotation interop (default false)
    val checkSpecVisibility: Boolean,     // visibility of specs vs. declarations (default true)
)
```

## Rule catalog

| Rule | Checks |
| ---- | ------ |
| `AllowedJmlClauses` | clauses not permitted in the current context |
| `AssignableValidator` | syntactic well-formedness of `assignable` clause elements |
| `AssignableLocsetValidator` | location sets in `assignable` clauses |
| `ContextSensitiveForbiddenFunctionsValidator` | `\old`/`\pre` style functions used outside their legal positions |
| `DefaultNullityValidator` | nullness of parameters/results against the default-nullity policy |
| `ExceptionVarCheck` | the `signals` exception variable binding |
| `FormulaEvaluator` | const-foldable formula sanity |
| `JavaContainsJmlConstruct` | JML constructs leaking into Java positions |
| `JmlDuplicateNamesValidator` | duplicated JML declarations (ghost/model fields) |
| `JmlJavaNameClashes` | a JML name shadowing a Java name |
| `MethodBodyHasNoContract` | executable methods without any specification |
| `OverridingLocalNamesInGhost` | ghost bindings shadowing locals |
| `PurityValidator` | side effects inside pure/helper-method specs |
| `ResultVarCheck` | misuse of `\result` |
| `SignalsExceptionTypeCheck` | `signals` clause exception types |
| `SpecVisibilityValidator` | specs visible where they are used |
| `TrivialFormulaValidator` | tautological/contradictory formulas |

## Status

{{< callout type="info" >}}
The library is fully functional and used from tests and the
[web playground](../web/). The `jmltk lint` CLI subcommand is registered but
not yet implemented — for now, drive the rules through `JmlLintingFacade` or
the web interface.
{{< /callout >}}
