---
title: No-body Declarations
type: docs
weight: 80
---

KeY's classpath and schema sources may declare constructors and methods without
a body. The declaration fixes the signature for name resolution and inlining.

## Grammar

```text
constructor ::= modifiers name "(" [ parameter ("," parameter)* ] ")" ";"
method      ::= modifiers type name "(" [ parameter ("," parameter)* ] ")" ";"
```

## Example

From
`jmlparser-jml-tests/src/test/resources/fullexamples/key/standard_key/BookExamples/10UsingKeY/Bank-JML/classpath/AbstractButton.java`:

```java
public AbstractButton();
```

The old syntax page uses the same pattern for `String`:

```java
class String { public String(); }
```

## Semantics and variations

- A bodyless method/constructor is a declaration only; it has no executable
  block.
- The declaration is still available to the symbol solver and the method-frame
  machinery.
- JMLtk's Java grammar accepts the missing body where ordinary Java would
  require one.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `ConstructorDeclaration` | `...ast.body` | `getBody()` is absent (`Optional.empty()`) |
| `MethodDeclaration` | `...ast.body` | `getBody()` is absent (`Optional.empty()`) |

## See also

- [Method frames](../method-frames/)
- [Method calls](../method-calls/)
