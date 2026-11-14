---
title: "Proof Obligations & SMT Encoding"
weight: 2
---

# Proof Obligations & SMT Encoding

A **proof obligation** (verification condition, VC) is one logical formula that
must hold for the program to be correct. The generator produces one obligation
per contract clause, `assert` statement, loop-invariant maintenance step and
runtime check, encodes each as an SMT formula over the model of the program
state, and hands the whole set to a solver.

## The shape of a query

Every generated query has the same skeleton:

```lisp {filename="VcgExamples#abs(int) — abridged"}
; declarations of the state model (sorts T/U, typeof/subtype/cast, per-field
; heap selectors, per-class static constants) ...

; assumptions: the merged `requires` clauses of every inlined/replaced callee,
; plus the runtime-check *assumptions* baked into the state
(assert (and (and true (>= x 0)) ...))

; one block per proof obligation, asserting the NEGATED obligation
(push)
(assert (! (not (=> <path condition> <obligation>)) :named v<N>))
(check-sat)
(pop)
```

Each obligation sits in its own `push / check-sat / pop` block under a `:named`
annotation, so the solver answers are position-independent — answer *N* belongs
to condition *N*. If the solver can satisfy the negated formula it has found a
*model* (a counterexample): the obligation is **violated**. If it proves
unsatisfiable, the obligation **holds**.

## How to read the answers

Run Z3 directly on a generated query and read one verdict per `check-sat` block:

```text
$ z3 substringLen__U_STR.smt2
unsat
unsat
unsat
unsat
unsat
unsat
```

| Answer | Meaning | Status |
| ------ | ------- | ------ |
| `unsat` | the negated obligation is unsatisfiable — the obligation holds | PROVEN |
| `sat` | a counterexample model exists — the obligation is violated | FAILED |
| `unknown` | the solver gave up (timeout / incomplete combination of theories) | UNKNOWN |

The golden files under `tools/vcg/src/test/resources/golden/` are real,
end-to-end queries for the fixture methods; they are regenerated with
`UPDATE_GOLDEN=1` and serve both as regression snapshots and as faithful
examples of the encoding.

## Obligation kinds

| Kind | When it is emitted | Typical SMT shape |
| ---- | ------------------ | ----------------- |
| `precondition` | at every call / inlined body — the callee's `requires` must follow from the caller's state | `⇒ (path) (requires)` |
| `postcondition` | at method exit — the `ensures` must follow from the exit state | `⇒ (pre ∧ path) (ensures[result/old])` |
| `assert` | JML `assert <expr>` statements | `⇒ (path) (expr)` |
| `invariant-established` | before the first iteration of a loop with an invariant | `⇒ (pre) (invariant)` |
| `invariant-preserved` | one iteration must preserve the invariant | `⇒ (invariant ∧ body ∧ guard) (invariant')` |
| `decreases` | the loop variant must decrease and stay non-negative | `⇒ (guard ∧ invariant) (variant > variant' ≥ 0)` |
| `loop-contract` | `maintaining`/`decreases`/`breaks`/`continues` clauses for loop contracts | per-clause obligations |
| `signals` | exceptional `ensures` — the exception type and state | `⇒ (path ∧ thrown) (signals-expr)` |
| `divbyzero` | every `/`, `%`, `/=`, `%=` | `⇒ (path) (divisor != 0)` |
| `index` | every array read/write `a[i]` | `⇒ (path) (0 ≤ i < a.length)` |
| `null` | every dereference (receiver, field, element read) | `⇒ (path) (ref != null)` |
| `cast` | every reference `(T) e` | `⇒ (path) (instanceof/type-test ok)` |
| `negative-array-size` | every `new T[n]` | `⇒ (path) (n ≥ 0)` |
| `string-index` | every `charAt`/`substring`/`length` read under the string model | `⇒ (path) (0 ≤ i ≤ s.length)` |
| `overflow` | every arithmetic operation, only with `--check-overflow` (BOUNDED) | sign-extension overflow test |

The six runtime-exception checks (`null`, `divbyzero`, `index`, `cast`,
`negative-array-size`, `string-index`) are **on by default** — the encoded model
never throws, so a proven method could still crash in Java without them. See the
[overview](..) for the full check matrix.

## Examples (from the golden suite)

### Postcondition — `abs` (UNBOUNDED)

```java
//@ requires x >= 0;
//@ ensures \result >= 0;
public int abs(int x) {
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
}
```

The postcondition obligation arrives already negated. `$ret$3` and `$result$3`
are the return-guard and result of the `abs` body path that reaches the `return`:

```lisp {filename="abs__U.smt2"}
(push)
(assert (! (not (=> (and (and true (>= x 0)) $ret$3) (and true (>= $result$3 0)))) :named v1))
(check-sat)
(pop)
```

The `(>= x 0)` conjunct is the folded `requires`; the obligation says *from a
state satisfying the requirement on the `return` path, `\result >= 0` must
hold*. Z3 answers `unsat` — proven.

### Arithmetic overflow — `boundedAdd` (BOUNDED)

```java
//@ requires x >= -1000 && x <= 1000 && y >= -1000 && y <= 1000;
//@ ensures \result == x + y;
public int boundedAdd(int x, int y) {
    return x + y;
}
```

In BOUNDED mode `int` is a 32-bit bit-vector, so `x + y` **wraps** exactly like
Java. The overflow check reconstructs the true mathematical result by
sign-extending both operands to 33 bits and comparing:

```lisp {filename="boundedAdd__B_OVF_DIV.smt2"}
(push)
(assert (! (not (=> (and (and true (not false)) (not false))
                     (not (not (= (bvadd ((_ sign_extend 1) x) ((_ sign_extend 1) y))
                                  ((_ sign_extend 1) (bvadd x y)))))))
         :named v1))
(check-sat)
(pop)
```

The `(not (= …))` double negation encodes *the extended sum equals the extended
wrapped sum*, i.e. no overflow occurred. With the `requires` bounding `x` and
`y` to ±1000 this is `unsat` (no overflow); the `postcondition` block
afterwards proves `\result == x + y` on 32-bit arithmetic.

### Null dereference — arrays (UNBOUNDED)

```java
//@ ensures true;
public void derefNullableArray(int[] a) {
    int v = a[0];
}
```

Arrays are ordinary nullable references; `null` on an array sort is the
per-sort constant `$null_array_<sort>`, and reading `a[0]` emits a null check:

```lisp {filename="derefNullableArray__U.smt2"}
(declare-const $null_array_ArrayIntInt (Array Int Int))
...
(push)
(assert (! (not (=> (and (and true (not false)) (not false))
                     (not (= a $null_array_ArrayIntInt)))) :named v1))
(check-sat)
(pop)
```

Nothing in the state prevents `a` from being the null array, so this is `sat` —
the method is correctly reported as *failing*, and the solver's model is a
counterexample (`a` = `$null_array_ArrayIntInt`).

### The string model — `stringSelfEquals` (P4.3)

```java
//@ requires s != null;
//@ ensures true;
public boolean stringSelfEquals(String s) {
    //@ assert s.equals(s);
    //@ assert !s.equals(null);
    return true;
}
```

Under the string-index feature the query first declares the model — the length
function and the per-position character read `strval`, plus the two-directional
`steq` axioms that make `equals` extensional equality cut by runtime length:

```lisp {filename="stringSelfEquals__U_STR.smt2"}
(declare-fun stringLength (U) Int)
(declare-fun strval (U Int) Int)
(declare-fun steq (U U) Bool)
(assert (forall ((s$a U) (s$b U))
  (=> (and (= (stringLength s$a) (stringLength s$b))
           (forall ((s$i Int))
             (=> (and (<= 0 s$i) (< s$i (stringLength s$a)))
                 (= (strval s$a s$i) (strval s$b s$i)))))
      (steq s$a s$b))))
(assert (forall ((s$a U) (s$b U))
  (=> (steq s$a s$b)
      (and (= (stringLength s$a) (stringLength s$b))
           (forall ((s$i Int))
             (=> (and (<= 0 s$i) (< s$i (stringLength s$a)))
                 (= (strval s$a s$i) (strval s$b s$i))))))))
```

The assertions then discharge through those axioms — `s.equals(s)` (reflexivity)
and `!s.equals(null)` (the argument is a null-guarded reference):

```lisp {filename="stringSelfEquals__U_STR.smt2"}
(push)
(assert (! (not (=> (and (and true (not false)) (not false))
                     (and (not (= s null)) (steq s s)))) :named v2))
(check-sat)
(pop)
(push)
(assert (! (not (=> (and (and true (not false)) (not false))
                     (not (and (not (= null null)) (steq s null))))) :named v4))
(check-sat)
(pop)
```

### Slice reads — `substringLen` (P4.3)

```java
//@ requires s != null && 0 <= i && i <= s.length();
//@ ensures \result == s.length() - i;
public int substringLen(String s, int i) {
    return s.substring(i).length();
}
```

`substring` becomes a slice read `strsub` with length and content axioms,
pattern-annotated so Z3's E-matching keeps them inert until a ground
`strval (strsub …)` term appears (a nested index quantifier shifted by the
arithmetic `(+ s$k s$j)` cannot be E-matched and churns the solver):

```lisp {filename="substringLen__U_STR.smt2"}
(assert (and (and (not (= s null)) (<= 0 i)) (<= i (stringLength s))))
(declare-fun strval (U Int) Int)
(declare-fun strsub (U Int) U)
(assert (forall ((s$a U) (s$k Int))
  (! (not (= (strsub s$a s$k) null)) :pattern ((strsub s$a s$k)))))
(assert (forall ((s$a U) (s$k Int))
  (! (= (stringLength (strsub s$a s$k)) (- (stringLength s$a) s$k))
     :pattern ((strsub s$a s$k)))))
(assert (forall ((s$a U) (s$k Int) (s$j Int))
  (! (=> (and (<= 0 s$j) (< s$j (- (stringLength s$a) s$k)))
         (= (strval (strsub s$a s$k) s$j) (strval s$a (+ s$k s$j))))
     :pattern ((strval (strsub s$a s$k) s$j)))))
```

Because the `requires` bounds `i` (`0 <= i` **and** `i <= s.length()`), both the
string-index bounds obligation and the postcondition `\result == s.length() - i`
discharge through the slice-width axiom — all six `check-sat` blocks answer
`unsat`.

String **literals** bind their per-position content the same way, so literal
proofs do not need the axioms at all:

```lisp {filename="literalStartsWith__U_STR.smt2"}
(declare-const strlit_0 U)
(assert (not (= strlit_0 null)))
(assert (= (stringLength strlit_0) 2))
(assert (= (strval strlit_0 0) 97))
(assert (= (strval strlit_0 1) 98))
```

(97/98 are the UTF-16 codes of `'a'`/`'b'`.)

### JML `\sum` — a bounded summation (P6.1)

A JML `\sum` with a *bounded* integer range and a *direct array-read body* is
the generalized-quantifier shape the VCG models — this is KeY's firstTouch
08-Java5 for-each sum (the KeY loop-position pseudo-variable `\index` binds the
type-tagged loop-counter register in the loop contract):

```java
//@ requires a != null;
//@ ensures \result == (\sum int j; 0 <= j && j < a.length; a[j]);
int sum() {
    int s = 0;
    /*@ maintaining s == (\sum int j; 0 <= j && j < \index; a[j]);
      @ maintaining 0 <= \index && \index <= a.length;
      @ decreasing a.length - \index;
      @ assignable \strictly_nothing;
      @*/
    for (int i : a) s += i;
    return s;
}
```

`\sum int j; lo <= j && j < hi; a[j]` becomes an application of a *recursive
summation* over the array, declared once per query (`I`/`E` are the mode's
index/element sorts: `Int` in UNBOUNDED, `(_ BitVec 32)` in BOUNDED):

```lisp {filename="KeyFor — jmlSum, abridged"}
(define-fun-rec jmlSum ((a (Array I E)) (lo I) (hi I)) E
  (ite (<= hi lo) 0 (+ (jmlSum a lo (- hi 1)) (select a (- hi 1)))))
(assert (forall ((a (Array I E)) (lo I) (hi I))
  (! (= (jmlSum a lo (+ hi 1)) (+ (jmlSum a lo hi) (select a hi)))
     :pattern ((jmlSum a lo (+ hi 1))))))
```

The `define-fun-rec` *definition* unrolls the sum downwards (`hi <= lo` → `0`;
otherwise the sum up to `hi − 1` plus `a[hi − 1]`). The quantified *recurrence*
with its `(+ hi 1)` E-matching trigger hands Z3 the induction step — it drives
the invariant-preservation and postcondition obligations over **symbolic** upper
bounds (`a.length`, `\index`), and without the trigger the recurrence stays
inert.

BOUNDED `\sum` queries fold length terms of *constant array symbols*
(`bv$length a` → a shared implicit `$len_a` constant plus one ground
non-negativity assert) instead of declaring the per-sort length function. The
fold is what keeps the queries terminating: under the recurrence axioms Z3's
recursive-function instantiation stalls against an explicitly `declare-const`ed
length symbol but answers `unsat` immediately against the same symbol used
implicitly. UNBOUNDED and non-`\sum` BOUNDED queries keep the declared
`int$length`/`bv$length` functions, so their bytes are untouched.
