---
title: Statements
type: docs
weight: 80
---

JML contributes statements that appear inside method bodies and specification
blocks: assertions, assumptions, ghost updates, refinement markers, block
markers, and unreachable markers.

**JML Reference:** §11 *JML Statements*, printed p. 146 —
[PDF p. 157](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=157).
`assert` §11.1, printed p. 146 —
[PDF p. 157](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=157).
`assume` §11.2, printed p. 147 —
[PDF p. 158](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=158).
Ghost label §11.5, printed p. 149 —
[PDF p. 160](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=160).
`unreachable` §11.6, printed p. 149 —
[PDF p. 160](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=160).
`set` §11.7, printed p. 150 —
[PDF p. 161](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=161).
`begin`/`end` §11.12, printed p. 156 —
[PDF p. 167](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=167).

## Statements at a glance

| Statement | Meaning | Example |
| --------- | ------- | ------- |
| `assert` | in-spec assertion | `//@ assert i < n;` |
| `assert_redundantly` | redundant assertion | `//@ assert_redundantly i < n;` |
| `assume` | in-spec assumption | `//@ assume i >= 0;` |
| `assume_redundantly` | redundant assumption | `//@ assume_redundantly i >= 0;` |
| `hence_by` / `hence_by_redundantly` | assertion justified by a proof script | `//@ hence_by ...;` |
| `set` | update a ghost variable | `//@ set n = n + 1;` |
| `ghost` | declare/assign ghost state | `//@ ghost int n = 0;` |
| `refining` | refinement marker | `//@ refining ...` |
| `begin` / `end` | explicit block markers | `//@ begin ... //@ end` |
| `unreachable` | mark dead code | `//@ unreachable;` |
| `LAB: assert ...` | prefix label | `//@ LAB: assert x > 0;` |
| `assert LAB: ...` | label after the keyword | `//@ assert LAB: x > 0;` |

## Grammar

```text
jml-stmt ::= ( assert | assert_redundantly | assume | assume_redundantly
             | hence_by | hence_by_redundantly | set )
             [ label ":" ] expression
             [ "\by" proof-block ] ";"
           | ghost declaration-or-assignment
           | refining ...
           | begin
           | end
           | unreachable ";"
           | label ":" jml-stmt
```

`assert`, `assume`, `set`, and the `hence_by` forms are `JmlExpressionStmt`
nodes with a `JmlStmtKind`. `ghost` is `JmlGhostStmt`, `refining` is
`JmlRefiningStmt`, and `begin`/`end`/`unreachable` have their own nodes.

## Examples

Label-after-keyword and proof script
(`jmlparser-jml-tests/src/test/java/com/github/jml/parser/JmlLabeledAssertTest.java`):

```jml
//@ assert LAB: x > 0;
//@ assert LAB: x > 0 \by { assume x > 0; auto; };
//@ set SN: x = x + 1;
```

Prefix label (JML-standard form):

```jml
//@ LAB: assert x > 0;
```

Ghost state
(`jmlparser-jml-tests/src/test/resources/fullexamples/tested/GhostArrayQuantifier.java`):

```jml
//@ ghost int[] array = new int[10];
//@ assert (\forall int e : array; e > 0);
```

Lemmas and assertions
(`jmlparser-jml-tests/src/test/resources/fullexamples/tested/Lemmas.java`):

```jml
//@ assert n > 0 \by { auto; };
//@ assert n >= 0 \by { use_lemma intEq(n, n); auto; };
```

## Semantics

- `assert` and `assume` are specification statements; they do not change Java
  execution by themselves.
- `set` updates a ghost/model variable; `ghost` declares ghost state.
- `begin`/`end` delimit a specification block.
- `unreachable` marks a program point as unreachable.
- `refining` relates specification levels; it is a parser-level marker.
- `\by { ... }` attaches a proof script (see [Proof scripts](../proof-scripts/)).

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlStatement` | `...ast.jml.stmt` | abstract base |
| `JmlExpressionStmt` | `...ast.jml.stmt` | `kind`, `expression`, `label`, `script` |
| `JmlExpressionStmt.JmlStmtKind` | `...ast.jml.stmt` | `ASSERT`, `ASSERT_REDUNDANTLY`, `ASSUME`, `ASSUME_REDUNDANTLY`, `HENCE_BY`, `HENCE_BY_REDUNDANTLY`, `SET` |
| `JmlGhostStmt` | `...ast.jml.stmt` | `statement` (the ghost declaration/assignment) |
| `JmlLabelStmt` | `...ast.jml.stmt` | prefix label + labelled statement |
| `JmlBeginStmt` / `JmlEndStmt` | `...ast.jml.stmt` | block markers |
| `JmlRefiningStmt` | `...ast.jml.stmt` | refinement marker |
| `JmlUnreachableStmt` | `...ast.jml.stmt` | unreachable marker |

## See also

- [Proof scripts](../proof-scripts/)
- [Let and labels](../let-and-labels/)
- [Expressions](../expressions/)
