---
title: Annotations and Key Sets
type: docs
weight: 10
---

JML lives inside Java comments. JMLtk can additionally attach a **key** to a
comment, so that several tools can share one source file and each tool sees only
the annotations intended for it.

**JML Reference:** §4.2.5 *Conditional JML annotation comments* and §4.2.6
*Default keys*, printed p. 51 —
[PDF p. 62](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=62).

## Comment forms

| Form | Meaning |
| ---- | ------- |
| `//@ ...` | unconditional single-line JML annotation |
| `/*@ ... @*/` | unconditional block JML annotation |
| `//+key@ ...` | active only when the key set contains `key` |
| `/*+key@ ...*/` | block form of a positive conditional annotation |
| `//+key+openjml@ ...` | active when at least one listed positive key is enabled |
| `//-key@ ...` | ignored when the key set contains `key` |
| `/*-key@ ...*/` | block form of a negative conditional annotation |

A comment with no key is always active. A positive key (`+key`) is a filter:
the comment is included only if at least one positive key is enabled. A negative
key (`-key`) is an exclusion: if a negative key is enabled, the comment is
skipped even when a positive key also matches.

```jml
//+key@ requires x > 0;             // only the "key" tool sees this
//+openjml@ ensures \result > 0;    // only the "openjml" tool sees this
//@ invariant x >= 0;               // every tool sees this
//-key@ assignable \nothing;        // hidden from the "key" tool
/*+key+openjml@ requires y != 0;*/  // visible to "key" and "openjml"
```

## Configuring key sets

`ParserConfiguration` holds a list of key sets. Each inner list is one set of
active keys; JMLtk runs the JML processor once per key set.

```java
ParserConfiguration cfg = new ParserConfiguration();
cfg.setProcessJml(true);
cfg.setJmlKeys(List.of(
        List.of("key"),       // first pass: key is active
        List.of("openjml")    // second pass: openjml is active
));
```

The default is a single empty key set. That means unconditional comments are
processed once, and conditional comments are skipped.

Because the processor runs once per key set, the **same contract may appear
multiple times** in the resulting AST — once for each key set in which it is
active. Use `NodeWithJmlTags#getJmlTags()` (the `jmlTags` property) to see which
keys a node belongs to and select the copy for your tool:

```java
for (JmlContract contract : method.getContracts()) {
    if (contract.getJmlTags().stream().anyMatch(t -> t.asString().equals("key"))) {
        // use the contract intended for the "key" tool
    }
}
```

`JmlDocSanitizer` blanks annotations for inactive keys while keeping source
positions stable. `setKeepJmlDocs(true)` keeps the `JmlDoc` nodes for
documentation-oriented tools.

## Example from the test corpus

`javaparser-core-testing/src/test/java/com/github/javaparser/jml/JmlDocSanitizerTest.java`
uses one string that exercises all forms:

```jml
//+key@ A
//+openjml@ B
//@ C
//-key@ D
/*+key@ E*/
/*+key+openjml@ F*/
```

With the key set `{key}`, lines `A`, `C`, `E`, and `F` are active. With
`{openjml}`, lines `B`, `C`, `D`, and `F` are active. With no keys, only `C` and
`D` remain.

## JMLDoc

The `doc` package carries JML-aware documentation comments:

| Class | Represents |
| ----- | ---------- |
| `JmlDoc` | one JML documentation comment |
| `JmlDocType` | a type declaration carrying JMLDoc |
| `JmlDocDeclaration` | a body declaration carrying JMLDoc |
| `JmlDocStmt` | a statement carrying JMLDoc |
| `JmlDocModifier` | a modifier-like JMLDoc carrier (`[[JML modifiers]]`) |

These nodes preserve JMLDoc content; the parser does not interpret it.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `NodeWithJmlTags` | `com.github.javaparser.ast.jml` | mixin with `getJmlTags()` / `setJmlTags(NodeList<SimpleName>)` |
| `JmlDoc` | `com.github.javaparser.ast.jml.doc` | raw JMLDoc content |
| `JmlDocType`, `JmlDocDeclaration`, `JmlDocStmt` | `...ast.jml.doc` | declarations/statements with JMLDoc |
| `JmlDocModifier` | `...ast.jml.doc` | modifier carrying JMLDoc |

## See also

- [Contracts](../contracts/)
- [Body declarations](../body-declarations/)
- [Statements](../statements/)
