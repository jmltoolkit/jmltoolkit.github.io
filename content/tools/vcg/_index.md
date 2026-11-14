---
title: "VCG"
weight: 75
---

# Verification Condition Generator

The **VCG** (verification condition generator) translates a Java method or
constructor annotated with JML into a set of SMT formulas — the *verification
conditions* — that an SMT solver (Z3, via the [SMT module](../smt/)) checks to
prove the contract. It is the deductive verification backend of JMLtk: instead
of running the program, it encodes its semantics and the contract as logic.

```text
  Java + JML source
        │  parse with symbol resolution (jmltk-javaparser)
        ▼
  CallableDeclaration + JmlContract
        │  Normalizer (three-address form)
        ▼
  normal-form IR
        │  Vcg (SP-based condition generation)
        ▼
  VcgResult (SmtQuery + VerificationConditions)
        │  Solver (z3)
        ▼
  PROVEN / FAILED / UNKNOWN per condition
```

Every proof obligation comes out as a *negated* assertion in its own
`push / check-sat / pop` block with a `:named` annotation — the solver must
answer **unsat** for the obligation to hold. See
[Proof Obligations & SMT Encoding](obligations/) for worked examples.

## Capabilities

* **Contracts** — `requires`, `ensures`, `signals`, `assignable`, class
  invariants (`\invariant_for`, `\static_invariant_for`) and `//@ assert`
  statements. Multiple JML spec cases (`also`) keep their disjunctive JML
  semantics (P1.1).
* **Data types** — two verification modes:
  * `UNBOUNDED` — `int`/`long` are mathematical integers (`Int` sort), no
    overflow. Loops are abstracted by invariants/loop contracts or unrolled.
  * `BOUNDED` — primitive types are bit-vectors with Java overflow, wraparound
    and binary numeric promotion semantics (JLS 5.6, like JBMC). Loops are
    unrolled or bounded.
* **Loops** — unrolling (global default depth, per-loop overrides) or
  abstraction by a (three-part) loop invariant / loop contract with
  `maintaining`, `decreases`, `breaks` and `continues` clauses.
* **Calls** — inline the callee's body, or replace the call by its JML
  contract (assert the precondition, havoc the `assignable` locations, assume
  the postcondition). Constructor contracts are applied at creation sites
  (`new T(...)`, P2.1).
* **Runtime checks (on by default, P3.3)** — the encoded model never throws;
  without checks a *proven* method could still crash in Java. The six checks
  restore Java-faithful obligations: division-by-zero, array bounds, null
  dereference, reference cast, negative array size and string index.
* **References** — a `T`/`U` sort hierarchy with `subtype`/`instanceof`/`cast`
  and per-field heap selectors; arrays are ordinary nullable references (P4.2);
  class invariants are visible-state obligations at call sites (P4.1).
* **String model (P4.3)** — under the string-index feature, common `String`
  calls become reads of an abstract per-position character model
  (`equals`, `charAt`/`codePointAt`, `concat`, `indexOf(int/char)`,
  `substring`, `startsWith`, `replace(char,char)`), so `String`-heavy methods
  verify instead of being rejected as unrefined library calls.
* **Quantifiers (P6.1)** — JML binders `\forall`, `\exists` and `\sum` are
  modeled in their classic form `Binder Type v; range; body`; every other
  binder (`\num_of`, `\min`, `\max`, `\product`, …) and the element/range-domain
  binding forms (`\forall int e : a; …`) are rejected with structured
  diagnostics. A `\sum` with a *bounded* integer range and a *direct array-read
  body* compiles to a lazily-declared recursive SMT summation that unfolds along
  the index range, so KeY's firstTouch 08 for-each sum
  (`maintaining s == \sum int j; 0 <= j && j < \index; a[j]`) verifies in both
  modes over symbolic ranges (`a.length`, the KeY `\index`). See
  [JML Binders & Quantified Expressions](binders/) for the JML↔SMT
  formalization of every form, and the [worked example](obligations/) for the
  `\sum` encoding in full.
* **Diagnostics** — constructs the engine cannot model (lambdas, method
  references, anonymous classes, multi-dimensional arrays, …) are rejected with
  structured `UnsupportedFeatureException` diagnostics carrying the source
  range; contractless-and-bodyless callees are rejected loudly by default
  (`--allow-unrefined-calls` opts into a sound havoc over-approximation).

## Command line

The `jmltk` CLI exposes the `vcg` subcommand. It parses the given files with
symbol resolution and JML processing, then verifies **every** method or
constructor that carries a JML contract:

```text
jmltk vcg [options] File.java ...
```

Per-condition output lines look like

```text
  ok   VcgExamples#abs(int)#postcondition-1@8:0  postcondition of method abs
  FAIL VcgExamples#buggy(int)#postcondition-1@14:0  postcondition of method buggy
  ???? VcgExamples#opaque(int)#postcondition-1@22:0  postcondition of method opaque
```

`ok` means the obligation is proven (unsat), `FAIL` that a counterexample model
was found (sat), `????` that the solver could not decide. The condition id has
the form `<class>#<method>(<params>)#<kind>-<n>@<line>:<column>`; the run ends
with a `N conditions, M failing` summary.

{{< callout type="info" >}}
`????`/UNKNOWN is a solver-side outcome: Z3 found no model and could not prove
the (negated) obligation. Quantified bit-vector queries — e.g. a `\exists` over
array indices in BOUNDED mode — are the common case, and Z3 older than 4.15 may
search them indefinitely instead of deciding. The repository's CI installs
**Z3 4.15.4** (works on Linux/macOS/Windows), matching local development; use
4.15 or newer for reliable verdicts on quantifier-heavy contracts.
{{< /callout >}}

### Options

| Option | Meaning |
| ------ | ------- |
| `--unbounded` | unbounded mathematical integers instead of bounded bit-vectors (default mode is BOUNDED) |
| `--loop-unroll N` | unroll loops `N` times (default `10`) |
| `--loop-invariant` | handle loops via their loop invariants instead of unrolling |
| `--checks {all,none,default}` | runtime-check policy; `default` is the six exception checks on, overflow off |
| `--check-overflow` | emit VCs asserting no signed overflow (BOUNDED only; off by default — bit-vectors already wrap like Java, this only *flags* wraparounds) |
| `--check-division` | … no division / modulo by zero |
| `--check-index` | … array indices in bounds |
| `--check-null` | … no null-pointer dereference |
| `--check-cast` | … reference casts type-correct |
| `--check-negative-array-size` | … no negative array sizes |
| `--check-string-index` | … `String`/`StringBuilder` indices in bounds (+ the P4.3 string model) |
| `--allow-unrefined-calls` | havoc the caller-visible frame for calls whose callee has neither JML contract nor body, instead of rejecting them |
| `--vcg-include GLOB` | only report conditions whose id matches this glob (repeatable) |
| `--vcg-exclude GLOB` | suppress conditions whose id matches this glob (repeatable) |
| `--vcg-cache FILE` | persist and reuse solver answers keyed by query *content* |

Individual `--check-*` flags always only *enable* a check on top of the chosen
`--checks` policy.

{{< callout type="info" >}}
The default policy (P3.3) already emits the six runtime-exception checks —
`--check-division` etc. are needed to turn them *off* via `--checks=none`, or to
re-enable a specific one. `--check-overflow` is the only check that is genuinely
off by default.
{{< /callout >}}

## Editor support

The language server exposes a **Verify method (VCG)** code lens on
JML-annotated methods. Activating it runs the generator and reports the
`proven / failed / unknown` counts (plus failing condition descriptions) in the
editor, without leaving it. See the [LSP](../lsp/) documentation.

## Further reading

* [JML Binders & Quantified Expressions](binders/) — which binders are
  modeled, how the range is formalized (`\forall` guards, `\exists` conjoins,
  `\sum` becomes a recursive summation), and the JML↔SMT examples.
* [Proof Obligations & SMT Encoding](obligations/) — what a proof obligation
  is, every obligation kind, and real encoded examples.
* [API](api/) — using the `Vcg`, `VcgResult` and `VcgFacade` API
  programmatically.
* The soundness pass that closed the semantic gaps between the encoded model
  and Java/JML is documented in `doc/vcg-semantics-plan.md` in the source
  repository (phases P1.1–P6.1); the remaining divergences are listed in the
  [PR description](https://github.com/jmltoolkit/jmltk/pull/69).
