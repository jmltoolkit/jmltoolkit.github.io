---
title: Modifiers
type: docs
weight: 40
---

JML modifiers refine Java declarations: they mark specification-only state,
change visibility for specifications, select a nullity policy, or select an
arithmetic mode. The parser stores them as `Modifier` nodes with a
`Modifier.DefaultKeyword.JML_*` keyword.

**JML Reference:** §3.3 *JML modifiers and Java annotations*, printed p. 17 —
[PDF p. 28](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=28).
Type declarations §7.1, printed p. 94 —
[PDF p. 105](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=105).
Method specifications §8.7, printed p. 128 —
[PDF p. 139](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=139).
Fields and variables §9.1, printed p. 133 —
[PDF p. 144](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=144).
Arithmetic modes §13, printed p. 197 —
[PDF p. 208](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=208).

## Modifier families

| Family | Keywords | Meaning |
| ------ | -------- | ------- |
| Specification state | `ghost`, `model` | declaration exists only for specification/proof |
| Purity | `pure`, `strictly_pure`, `helper` | method has no (or only strictly bounded) side effects; `helper` limits visibility |
| Instance/static | `instance` | member is instance-bound even when written in a static context |
| Specification visibility | `spec_public`, `spec_package`, `spec_protected`, `spec_private` | visibility used by specifications |
| Nullity | `nullable`, `non_null`, `nullable_by_default`, `non_null_by_default`, `nonnullelements` | nullness policy for values, declarations, or arrays |
| State | `no_state`, `two_state` | method reads no state / relates two states |
| Arithmetic mode | `code`, `code_java_math`, `code_bigint_math`, `code_safe_math`, `spec_java_math`, `spec_bigint_math`, `spec_safe_math` | arithmetic semantics for Java (`code_*`) or specification (`spec_*`) expressions |
| Ownership | `peer`, `rep`, `read_only` | ownership/alias discipline |

JMLtk validates where a modifier may appear; the exact rule set lives in
`ModifierValidator` and is exercised by the test corpus.

## Examples

Math-mode modifier on a class
(`javaparser-core-testing/src/test/resources/com/github/javaparser/jml/mathmods/TestClass.java`):

```java
public /*@ spec_java_math @*/ class TestClass { ... }
```

Bigint math mode on a class and a model method
(`javaparser-core-testing/src/test/resources/com/github/javaparser/jml/mathmods/Test.java`):

```java
/*@ spec_bigint_math @*/
public class Test {
    /*@ model_behaviour
      @ static spec_java_math model boolean testModel(int[] t) { ... }
      @*/
}
```

Ghost and spec visibility
(`jmlparser-jml-tests/src/test/resources/fullexamples/tested/GhostArrayQuantifier.java`):

```java
//@ ghost int[] array = new int[10];
private /*@ spec_public @*/ int[] a;
```

`spec_public` on a field
(`jmlparser-jml-tests/src/test/resources/fullexamples/key/heap/initially/Initially.java`):

```java
protected /*@spec_public@*/ int x;
```

Lemmas with modifiers
(`jmlparser-jml-tests/src/test/resources/csm_jml_classlevel.txt`):

```java
//@ public static no_state lemma nospace(\seq s) \by { ... };
```

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `Modifier` | `com.github.javaparser.ast` | JavaParser modifier node; JML keywords are `DefaultKeyword.JML_*` |
| `Modifier.DefaultKeyword` | `com.github.javaparser.ast` | `JML_GHOST`, `JML_MODEL`, `JML_PURE`, `JML_SPEC_PUBLIC`, `JML_CODE_JAVA_MATH`, … |
| `JmlDocModifier` | `...ast.jml.doc` | modifier-like JMLDoc carrier |
| `NodeWithModifiers` | `com.github.javaparser.ast.nodeTypes` | mixin used by declarations carrying modifiers |

## See also

- [Body declarations](../body-declarations/)
- [Contracts](../contracts/)
- [Annotations and key sets](../annotations-and-key-sets/)
