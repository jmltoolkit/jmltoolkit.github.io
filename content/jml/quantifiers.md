---
title: Quantifiers
type: docs
weight: 60
---

A quantified expression binds one or more variables and applies a predicate or
aggregation over their values.

**JML Reference:** §12.5.1 *Quantified expressions*, printed p. 167 —
[PDF p. 178](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=178).

## Quantifiers

JMLtk recognizes:

| Quantifier | Meaning |
| ---------- | ------- |
| `\forall` | universal quantification |
| `\exists` | existential quantification |
| `\sum` | sum |
| `\product` | product |
| `\num_of` | number of values satisfying the body |
| `\max` | maximum |
| `\min` | minimum |

## Grammar

```text
quantified   ::= "(" quantifier variable ("," variable)*
                 [ ":" domain ]
                 ";" expression ( ";" expression )* ")"

variable     ::= type identifier
domain       ::= expression | lower ".." upper
```

The classic JML forms use `;`-separated expressions:

```jml
//@ ensures (\forall int i; a[i] > 0);
//@ ensures (\forall int i; 0 <= i && i < a.length; a[i] > 0);
```

JMLtk additionally accepts element, range, and `Iterable` domains:

```jml
//@ ensures (\forall int e : a; e > 0);           // array elements
//@ ensures (\forall int i : 0..n; a[i] > 0);      // range
//@ ensures (\forall var x : list; x != null);     // Iterable elements
//@ ensures (\sum int e : a; e * e) == total;
//@ ensures (\num_of String s : words; s.length() > 3) == longWords;
```

From `jmlparser-jml-tests/src/test/resources/csm_jml_expression.txt`,
`fullexamples/tested/QuantArray.java`, and
`fullexamples/tested/GhostArrayQuantifier.java`.

## More than two bound expressions

JMLtk is more liberal than the JML Reference Manual: the part between the
variable list and the body may contain **any number** of `;`-separated
expressions. The semantics are left to the consuming tool. A useful convention
is:

```jml
(\forall int i; <expr>)                       -- just like the JML manual
(\forall int i; <guard>; <expr>)              -- just like the JML manual
(\forall int i; <lower-bound>; <upper-bound>; <expr>)   -- JMLtk extension
```

For the three-expression form, the first two expressions are the lower and upper
bounds and the third is the body. Tools that do not implement this convention
must reject it rather than guess.

## Element and range domains

A domain binds exactly one variable:

- array: the variable has the component type of the array;
- range `lower..upper`: the variable has type `int`;
- `Iterable<T>` / `SequencedCollection<T>`: the variable has the first type
  argument;
- raw or unresolvable domains fall back to the declared type.

Index + element multi-bindings such as `int i, T e : a[i]` are **not** supported;
use the classic index form instead.

## Examples

Array elements
(`jmlparser-jml-tests/src/test/resources/fullexamples/tested/QuantArray.java`):

```jml
/*@ requires a != null;
  @ ensures (\forall int e : a; e >= 0);
  @*/
public void allNonNegative() { }
```

Range and nested quantifiers
(`jmlparser-jml-tests/src/test/resources/csm_jml_expression.txt`):

```java
(\forall int i : 0 .. a.length - 1; a[i] <= a[i + 1])
(\forall int e : a; (\exists int f : a; f.equals(e)))
(\forall int[] row : m; row.length == n)
```

Classic multi-expression bounds remain valid:

```java
(\sum int i; i > 0; i <= n / 2; 2 * i)
```

## Desugaring (implementation note)

`JmlQuantifierDesugarer` rewrites single-binding range and array domains into the
classic index form for backends that do not implement the sugar. `Iterable`
domains are not desugared. This is a parser/tooling detail, not a JML semantic
rule.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlQuantifiedExpr` | `...ast.jml.expr` | quantifier kind, variables, expressions |
| `JmlQuantifiedVariable` | `...ast.jml.expr` | `VariableDeclarator` with one optional domain |

## See also

- [Expressions](../expressions/)
- [Let and labels](../let-and-labels/)
- [Contracts](../contracts/)
