---
title: Expressions
type: docs
weight: 50
---

JML expressions are Java expressions extended with specification operators.
They appear in clauses, invariants, assertions, `set` statements, quantifiers,
and proof scripts.

**JML Reference:** §12 *JML Expressions*, printed p. 160 —
[PDF p. 171](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=171).
Purity §12.3, printed p. 164 —
[PDF p. 175](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=175).
Java expressions §12.4, printed p. 164 —
[PDF p. 175](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=175).

## Java expressions are JML expressions — with restrictions

Every Java expression is syntactically a JML expression, but JML expressions
must be **side-effect free**. In specification contexts:

- no assignments (`=`, `+=`, …);
- no prefix or postfix `++`/`--`;
- method calls must be pure (or at least side-effect free for the tool);
- object creation and state-changing calls are not specification expressions.

The parser accepts a liberal superset; the *semantics* are the consumer's
responsibility. JMLtk's validators and the downstream tools reject impure
expressions where they matter.

## Operators and keywords

| Group | Forms |
| ----- | ----- |
| Logical | logical and/or/not, implication (`==>`), equivalence (`<==>`, `<=!=>`) |
| Arithmetic | `+`, `-`, `*`, `/`, `%`, unary `+`/`-` |
| Relational chains | `0 <= i < a.length` (one `JmlMultiCompareExpr`) |
| Set and subtype | `\subset`, `<:`, `<:=`, `\cup`, `\cap`, `\intersect`, `\set_union`, `\set_minus`, `\singleton`, `\infinite_union` |
| Sequence operations | `\seq_length`, `\seq_get`, `\seq_singleton`, `\seq_concat`, `\seq_sub`, `\seq_reverse`, `\seq_put` |
| State | `\old(e)`, `\pre(e)`, `\result`, `\fresh(e)`, `\reachable(e)` / `\reach(e)`, `\lockset`, `\not_specified` |
| Types | `\type(T)`, `\typeof(e)`, `\elemtype(e)`, `\arraytype`, `\isarray`, `\erasure` |
| Labels | `\lbl`, `\lblpos`, `\lblneg` (see [Let and labels](../let-and-labels/)) |
| Binders | `\let` (see [Let and labels](../let-and-labels/)); `\such_that` is a relational abstraction in `represents`/`obtain` |
| Quantifiers | `\forall`, `\exists`, `\sum`, `\product`, `\num_of`, `\max`, `\min` (see [Quantifiers](../quantifiers/)) |

`\type` is parsed as a call-shaped expression whose argument is a `JmlTypeExpr`.
Most other JML keyword applications use the general `MethodCallExpr`/`NameExpr`
shape; the dedicated JML nodes are listed below.

## Examples

From `jmlparser-jml-tests/src/test/resources/csm_jml_expression.txt`:

```java
\typeof(array) == \type(Object[])
(\forall int i; 0 <= i < a.length; a[i] > 0)
(\exists int i; 0 <= i < a.length; a[i] > 0)
(\lblpos X 1 + 1)
(\lbl X 1 + 1)
(\lblneg X 1 + 1)
(\min int x; false; 42) != 42
a != null ==> (\forall int i; 0 <= i && i < a.length - 1; a[i] <= a[i + 1])
```

A relational chain and `\old`/`\result` from
`jmlparser-jml-tests/src/test/resources/fullexamples/tested/Permut.java`:

```java
/*@ requires A != null;
  @ ensures !\result ==> (\forall int i; 0 <= i < A.length; A[i] == \old(A[i]));
  @ ensures \result ==> (\forall int i; 0 <= i < A.length;
  @     (\exists int j; 0 <= j < A.length; \old(A[i]) == A[j]));
  @ assignable A[*];
  @*/
```

## Set comprehensions

A set comprehension has the form `{ Type x; range; value }`:

```java
//@ ensures seen == { int i; 0 <= i && i < n; a[i] };
```

Represented by `JmlSetComprehensionExpr`. JML Reference §12.5.2, printed p. 170
— [PDF p. 181](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=181).

## JML types in expressions

JML logic types may appear in declarations and quantifier binders:

```text
\bigint    arbitrary-precision integer
\bigfloat  mathematical real
\seq<T>    immutable sequence
\set<T>    finite set
\map<K,V>  total or partial map
```

`JmlLogicType` models the primitive logic types `\set`, `\seq`, `\map`,
`\bigint`, and `\bigfloat`. Names such as `\locset` and `\real` are also parsed
in type positions; their AST representation depends on the production that
accepted them.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlExpression` | `...ast.jml.expr` | marker interface for JML expressions |
| `JmlMultiCompareExpr` | `...ast.jml.expr` | relational chain (`a <= b < c`) |
| `JmlBinaryInfixExpr` | `...ast.jml.expr` | infix set/subtype operators |
| `JmlSetComprehensionExpr` | `...ast.jml.expr` | `{ T x; range; value }` |
| `JmlTypeExpr` | `...ast.jml.expr` | type argument of `\type(...)` |
| `JmlLetExpr` | `...ast.jml.expr` | `\let` binding |
| `JmlLabelExpr` | `...ast.jml.expr` | `\lbl` / `\lblpos` / `\lblneg` |
| `JmlQuantifiedExpr` | `...ast.jml.expr` | quantifier expression |
| `JmlQuantifiedVariable` | `...ast.jml.expr` | quantified binding with optional domain |
| `JmlLogicType` | `...ast.jml.type` | primitive JML logic type |

## See also

- [Quantifiers](../quantifiers/)
- [Let and labels](../let-and-labels/)
- [Contracts](../contracts/)
- [Statements](../statements/)
