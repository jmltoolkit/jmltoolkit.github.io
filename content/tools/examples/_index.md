---
title: "Examples"
weight: 10
---

# Examples

The `:tools:examples` module bundles JML-annotated programs that exercise the
whole tool chain — the parser, the linting rules, the statistics, the
well-definedness checker and the verification condition generator. The module
has no library code of its own; it is a corpus for tests and benchmarks.

## Contents

Currently one showcase source: **`VerifiedIdentityHashMap`** (package `ihm`), a
faithful re-implementation of `java.util.IdentityHashMap` (derived from the
JDK sources) heavily annotated with JML:

```java
//@ requires key != null;
//@ ensures key == null ==> \result == NULL_KEY;
//@ ensures key != null ==> \result == key;
public V put(K key, V value) { ... }
```

The file mixes full method contracts (`requires` / `ensures`), model fields,
class invariants and helper clauses, which makes it a realistic input for

* the [linter](../lint/) — name clashes, missing contracts, forbidden clauses;
* the [statistics tool](../stat/) — clause counts and expression costs;
* the [well-definedness checker](../wd/) — `containsKey` / `get` style
  expressions with `null` and bounds conditions;
* the [VCG](../vcg/) — contract verification on a real class.

It intentionally covers edge-heavy Java (lambdas, generics, `null` handling)
so that unsupported constructs surface early.

## Using the corpus

The sources double as integration-test fixtures: the `tools` modules parse the
file with symbol resolution enabled and run their pipeline over it. Use them as
the input to the CLI tools, e.g.

```text
jmltk stat tools/examples/src/main/java/ihm/VerifiedIdentityHashMap.java
```

or load the same artifact as a test resource in your own integration suite.

See also the [Showcases](../../intro/showcase/) introduction for a guided
tour of the JML features these examples demonstrate.
