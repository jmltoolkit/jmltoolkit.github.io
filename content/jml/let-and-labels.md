---
title: Let and Labels
type: docs
weight: 70
---

Three small forms often appear inside larger JML expressions and statements:
`\let` bindings, expression labels, and statement labels. `\such_that` is a
related relational-abstraction form used by `represents` and proof scripts.

## `\let`

A `\let` expression introduces a local binding inside an expression:

```jml
//@ requires (\forall int i; 0 <= i < 5;
//@     (\let int ii = 2 * i; a[ii] == 0));
```

Grammar:

```text
"(" \let variable-declaration ";" expression ")"
```

The declaration is a normal JML/Java local declaration; the body sees the
binding. AST: `JmlLetExpr` with `getVariables()` and `getBody()`.

**JML Reference:** declarations in `\let` expressions §3.4.3.15, printed p. 23 —
[PDF p. 34](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=34).

## Expression labels

`\lbl`, `\lblpos`, and `\lblneg` attach a label to a sub-expression. They are
useful for referring to sub-terms in proofs and for marking polarity:

```java
(\lbl X 1 + 1)
(\lblpos X 1 + 1)
(\lblneg X 1 + 1)
```

Grammar:

```text
"(" ( \lbl | \lblpos | \lblneg ) SimpleName expression ")"
```

AST: `JmlLabelExpr` with `kind` (`NEUTRAL`, `POSITIVE`, `NEGATIVE`), `label`,
and `expression`.

**JML Reference:** §12.5.26 `\lbl`, printed p. 186 —
[PDF p. 197](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=197).

Examples from
`jmlparser-jml-tests/src/test/resources/csm_jml_expression.txt` and
`jmlparser-jml-tests/src/test/resources/fragments/stmt_1188627005.txt`.

## Statement labels

JML statements can be labelled in two ways:

```jml
//@ LAB: assert x > 0;          // JML-standard prefix form (JmlLabelStmt)
//@ assert LAB: x > 0;          // label after the keyword (JmlExpressionStmt#label)
//@ set SN: x = x + 1;
```

Both forms are printed and parsed; the second stores the label on
`JmlExpressionStmt`. See [Statements](../statements/).

## `\such_that`

`\such_that` is not a general expression binder. It appears in two places:

- a `represents` clause as a relational abstraction:
  ```java
  //@ represents size \such_that size >= 0 && size <= items.length;
  ```
- an `obtain` command in a proof script:
  ```text
  obtain int x \such_that x > 0;
  ```

See [Body declarations](../body-declarations/) and [Proof scripts](../proof-scripts/).

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlLetExpr` | `...ast.jml.expr` | `variables` (`VariableDeclarationExpr`), `body` |
| `JmlLabelExpr` | `...ast.jml.expr` | `kind`, `label` (`SimpleName`), `expression` |
| `JmlLabelStmt` | `...ast.jml.stmt` | prefix statement label (`LAB: assert ...`) |

## See also

- [Expressions](../expressions/)
- [Statements](../statements/)
- [Proof scripts](../proof-scripts/)
