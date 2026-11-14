---
title: Merge Points
type: docs
weight: 100
---

A `merge_point` tells a verification tool where and how to merge symbolic
execution states. It is a JMLtk extension; it is not part of the JML Reference
Manual.

## Grammar

```text
merge-point ::= ( "merge_point" | "$mergePoint" )
                [ "\by" ( string-literal | identifier ) ]
                [ "\lattice" ( string-literal | identifier ) ]
                [ "\predicate" "(" parameter ")" ":" expression-list ]
                ";"
```

The options are optional and must appear in this order: `\by`, `\lattice`,
`\predicate`. The values of `\by` and `\lattice` may be string literals or plain
identifiers; both are normalised to a `StringLiteralExpr` in the AST.

## Contextual keyword

`merge_point` is **not** a reserved word. It is recognized as a merge point only
when directly followed by `;` or one of `\by` / `\lattice` / `\predicate`:

```jml
//@ merge_point;
//@ merge_point \by "MergeByIfThenElse";
//@ merge_point \lattice conjunctive;
//@ merge_point \predicate (int x) : x >= 0, x == \old(b) || x == -\old(b);
```

When followed by `(`, the old ProofJava form `merge_point ( expr );` is an
ordinary method invocation (`MethodCallExpr`), not a merge point. `merge_point`
can therefore be used as a plain identifier (a field, local variable, or method
name). The alternative `$mergePoint` spelling is also accepted.

## Example

From `jmlparser-jml-tests/src/test/java/com/github/jml/parser/JmlMergePointTest.java`:

```jml
//@ merge_point \by "MergeByPredicateAbstraction"
//@     \lattice conjunctive
//@     \predicate (int x) : x >= 0, x == \old(b) || x == -\old(b);
```

Larger examples are in
`jmlparser-jml-tests/src/test/resources/fullexamples/key/firstTouch/11-StateMerging/A.java`
and `Gcd.java`.

## Semantics

The parser records the merge strategy, lattice, predicate variable, and
predicates; the verification tool decides how to merge states. The `\predicate`
option binds a variable of the given type and lists the abstraction predicates
separated by commas.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlMergePointStmt` | `...ast.jml.stmt` | properties `by`, `lattice`, `predicateVariable`, `predicates` |

## See also

- [Statements](../statements/)
- [Contracts](../contracts/)
