---
title: "JML Binders & Quantified Expressions"
weight: 1
---

# JML Binders & Quantified Expressions

JML generalized quantifiers bind one or more typed variables and quantify a
formula (`\forall`, `\exists`) or aggregate a term (`\sum`, `\product`,
`\num_of`, …) over them. The VCG models the three binders that matter for
firstTouch-style verification — **`\forall`, `\exists` and `\sum` — in their
classic form** `Binder Type var; range; body`; every other binder and every
element/range-domain binding is rejected up front with a structured
`UnsupportedFeatureException` (policy P3.2) instead of being silently
mis-encoded.

## Binder support matrix

| Binder | Status | SMT encoding |
| ------ | ------ | ------------ |
| `\forall` | modeled — classic form | `(forall ((x T)) (=> range body))` |
| `\exists` | modeled — classic form | `(exists ((x T)) (and range body))` |
| `\sum` | modeled — bounded integer range + direct array-read body | recursive `(jmlSum a lo hi)` application |
| `\num_of`, `\min`, `\max`, `\product`, `\bsum`, `\choose`, `\seq_def`, `\infinite_union` | rejected | `unsupported: JML quantifier binder \<binder> (only \forall, \exists and \sum are modeled) at line N` |
| element/range-domain bindings (`\forall int e : a; …`, `\sum int e : a; …`) | rejected | `unsupported: element/range-domain quantifier bindings … at line N` |

## The classic form

A quantified expression `Binder Type v; r1 && … && rn; body` is parsed into the
quantifier's *variables* (declared with their type), its *range* clauses
`r1 … rn` and its *body*. The translator binds the variables as SMT binders,
extends the environment (the bound names are immutable SSA locations inside the
quantifier), and translates range and body in that extended environment.

The range clauses do **not** have the same role for every binder — encoding
them uniformly as a conjunction would make every guarded `\forall` unsatisfiable
(`∀x. range ∧ body` is false outside the range), turning quantified
preconditions into contradictions that vacuously prove everything:

* `\forall` — the range **guards** the body: `(forall ((x T)) (=> range body))`.
  A single-expression `\forall Type v; body` (no range) is `(forall ((x T)) body)`.
* `\exists` — the range is **conjoined** with the body:
  `(exists ((x T)) (and range body))`, matching JML's `∃x. range ∧ body`.
* `\sum` — the range is not quantified at all: it must be a *shape* the
  translator can read off (lower/upper bounds on the index) and becomes the
  range arguments of the recursive summation.

## Examples (JML vs. SMT formalization)

The SMT snippets are the real encodings the generator emits (UNBOUNDED mode;
`Array Int Int` is the int-array sort, `int$length` the lazily-declared per-sort
length function, `(select a j)` the element read).

### `\forall` — the range guards the body

```java
//@ requires a != null && (\forall int j; 0 <= j && j < a.length; a[j] >= 0);
```

```lisp
(assert (and (not (= a $null_array_ArrayIntInt))
             (forall ((j Int))
               (=> (and (<= 0 j) (< j (int$length a)))
                   (>= (select a j) 0)))))
```

The obligation it discharges into asserts the *negation* of the whole
`requires ∧ …` implication, so a method whose body is jump-free proves
`a[j] >= 0` for every index in range.

### `\exists` — the range is conjoined

```java
//@ requires (\exists int j; 0 <= j && j < a.length; a[j] == 42);
```

```lisp
(assert (exists ((j Int))
  (and (and (<= 0 j) (< j (int$length a)))
       (= (select a j) 42))))
```

### `\sum` — a recursive summation over the range

```java
//@ ensures \result == (\sum int j; 0 <= j && j < a.length; a[j]);
```

```lisp
(assert (= $result (jmlSum a 0 (int$length a))))
```

`jmlSum` is a lazily-declared recursive SMT function that unfolds the sum
downwards (`hi <= lo` → `0`, else `jmlSum(a, lo, hi − 1) + a[hi − 1]`), with a
pattern-annotated recurrence axiom that lets Z3 induct over **symbolic** upper
bounds (`a.length`, the KeY `\index`). The full declaration, the shape rules
(which `\sum` forms are accepted), and the BOUNDED length fold are on the
[Proof Obligations](obligations/) page.

## Binder and range resolution

* **Binder types** follow the declared type of the variable: primitives map to
  the mode's arithmetic sort (`Int` in UNBOUNDED, `(_ BitVec 32)`/`(_ BitVec 64)`
  in BOUNDED via the promotion/type map); non-primitive declarators default to
  `Int`. The modeled use is an integer index quantified over an array range.
* **Array reads** in range and body use the array model: `a.length` is
  `(int$length a)` (UNBOUNDED) / `(bv$length a)` (BOUNDED), `a[j]` is a
  `(select …)`; in BOUNDED mode the index and result are bit-vectors with Java
  semantics, so the encoded range comparisons use the signed bit-vector
  operators (`bvsle`, `bvslt`, …).
* **Range and body translation** happens with the bound variables in scope; the
  endpoints may reference outer locations (`this` fields, parameters, loop
  contracts' `\index` pseudo-variable — bound to the type-tagged loop-counter
  register `$idxN`).
* **Where they may appear** — anywhere a JML expression can: `requires`,
  `ensures`, loop invariants (`maintaining`), `assert` statements, and
  `\sum`-based assignments/numeric equalities.

## Rejected binders

Every `JmlDefaultBinder` outside `\forall`/`\exists`/`\sum` — `\num_of`,
`\min`, `\max`, `\product`, `\bsum`, `\choose`, `\seq_def`,
`\infinite_union` — aborts generation with a diagnostic naming the binder:

```text
unsupported: JML quantifier binder \num_of (only \forall, \exists and \sum are
modeled) at line 11
```

### Element/range-domain bindings

The core parser (PR #83) also accepts iterable-domain bindings
(`\forall int e : a; e > 0`, `\sum int e : a; e`, and range domains
`\forall int i : 0..n; a[i] > 0`). The VCG models only binders with an explicit
**integer range clause**, and has no desugaring for the domain form: the domain
lives on the binding node (`JmlQuantifiedVariable`), not in the range clause, so
the classic path would quantify over the *whole index type* and silently drop
the domain. Expanding `e > 0` to `(forall ((e Int)) (> e 0))` is a *false*
assertion and would make the surrounding `requires` inconsistent — so these
forms are rejected loudly instead:

```text
unsupported: element/range-domain quantifier bindings (`\forall int e : a; …`)
(the VCG models only classic binder forms with a declared integer range) at line 2
```

Write the explicit classic form (the range is what the VCG reasons over):

```java
//@ requires a != null && (\forall int j; 0 <= j && j < a.length; a[j] > 0);
```
