---
title: Body Declarations
type: docs
weight: 30
---

Class and interface bodies can contain JML declarations and specification-only
members: invariants, constraints, `initially`, axioms, lemmas, `represents`
clauses, and model/ghost fields and methods.

**JML Reference:** invariants §3.13 and §7.2, printed p. 38 and p. 97 —
[PDF p. 49](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=49)
and [PDF p. 108](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=108).
Constraint §7.3, printed p. 97 —
[PDF p. 108](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=108).
`initially` §7.4, printed p. 98 —
[PDF p. 109](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=109).
Ghost/model fields §7.5–7.6, printed p. 98–99 —
[PDF p. 109](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=109).
`represents` §7.7, printed p. 99 —
[PDF p. 110](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=110).
Model methods/lemmas §3.6 and §7.8, printed p. 26 and p. 100 —
[PDF p. 37](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=37).
Axiom §7.12, printed p. 105 —
[PDF p. 116](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=116).

## Invariants

```java
//@ invariant balance >= 0;
//@ invariant_redundantly balance >= 0;
//@ invariant_free true;
```

* `invariant` — a state invariant of the class or interface.
* `invariant_free` — must hold independently of other specifications.
* `invariant_redundantly` — may restate a consequence of other invariants.
* `static invariant ...` restricts the invariant to static state.

Example from
`jmlparser-jml-tests/src/test/resources/fullexamples/tested/GhostArrayQuantifier.java`:

```java
//@ ghost int[] array = new int[10];
//@ invariant (\forall int e : array; e >= 0);
```

## Constraint

A `constraint` relates the pre- and post-state of a type. It is a two-state
predicate, usually written with `\old`:

```java
//@ constraint i > \old(i);
```

The pattern is also exercised by
`jmlparser-jml-tests/src/test/resources/fullexamples/openjml/src/org/jmlspecs/openjmltest/testcases/esc.java`.

## Initially

`initially` states a property that holds after construction and before any
method call:

```java
protected /*@ spec_public @*/ int x;
//@ public initially x > 0;
```

From `jmlparser-jml-tests/src/test/resources/fullexamples/key/heap/initially/Initially.java`.

## Axiom

An `axiom` is a logical fact available to a prover:

```java
//@ axiom (\forall Content c; (\forall Object o; c.P(o)));
```

From `jmlparser-jml-tests/src/test/resources/fragments/decl_1110573121.txt`.

## Lemmas (experimental)

A class-body lemma carries a `\by` proof script:

```java
//@ lemma L(int x) \by { auto; };
//@ lemma nospace(\seq s) \by { oss; use_lemma nospace(x); auto; };
```

Only the `\by { ... }` form is supported; a definitional `lemma ... = expr;` or
`assert ...` form is not part of this port. Parameters may use JML logic types
(`\seq`, `\bigint`, …). The feature is experimental; the language surface and
`JmlLemmaDeclaration` API may still change. See [Proof scripts](../proof-scripts/).

From `jmlparser-jml-tests/src/test/resources/fullexamples/tested/Lemmas.java`
and `jmlparser-jml-tests/src/test/resources/fragments/decl_jml_lemma.txt`.

## Represents

A `represents` clause connects a model field to concrete state:

```java
//@ represents footprint <- \locset(value);
//@ represents size <- items.length;
```

From `jmlparser-jml-tests/src/test/resources/fragments/decl_105494504.txt`.

## Model and ghost members

* `model` fields and methods are specification-only; they have no Java
  implementation.
* `ghost` fields and local variables are specification state that JML
  statements may update.
* `spec_public`, `spec_package`, `spec_protected`, and `spec_private` widen the
  Java visibility for specification access.

```java
public class Bag {
    private /*@ spec_public @*/ int n;
    //@ ghost int count;
    //@ model int capacity;
    //@ invariant 0 <= n && n <= capacity;
}
```

Model methods may use JML logic types:

```java
/*@ model_behavior
  @ accessible<heap> \nothing;
  @ accessible<permissions> \nothing;
  @*/
model \locset fp();
```

From `jmlparser-jml-tests/src/test/resources/fragments/decl_1054380357.txt`.

## Other class-level declarations

| Declaration | Meaning |
| ----------- | ------- |
| `accessible` declarations | class-level access specifications (`JmlClassAccessibleDeclaration`) |
| `invariant` / `constraint` / `axiom` / `initially` | expression-shaped body clauses (`JmlClassExprDeclaration`) |
| `model` / `ghost` members | specification-only fields, methods, and classes |

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlBodyClauseKind` | `...ast.jml.body` | `INVARIANT`, `INVARIANT_FREE`, `INVARIANT_REDUNDANTLY`, `CONSTRAINT`, `AXIOM`, `INITIALLY` |
| `JmlClassLevelDeclaration` | `...ast.jml.body` | abstract base for class-level JML declarations |
| `JmlFieldDeclaration` | `...ast.jml.body` | wraps a `FieldDeclaration` with JML tags/modifiers |
| `JmlMethodDeclaration` | `...ast.jml.body` | wraps a `MethodDeclaration` with JML tags/modifiers |
| `JmlRepresentsDeclaration` | `...ast.jml.body` | `represents` clause |
| `JmlLemmaDeclaration` | `...ast.jml.body` | lemma with a `NodeList<JmlProofStmt>` script |
| `JmlClassAccessibleDeclaration` | `...ast.jml.body` | class-level `accessible` declaration |
| `JmlClassExprDeclaration` | `...ast.jml.body` | expression-shaped body clause (`invariant`, `constraint`, `axiom`, `initially`) |

## See also

- [Contracts](../contracts/)
- [Modifiers](../modifiers/)
- [Proof scripts](../proof-scripts/)
- [Expressions](../expressions/)
