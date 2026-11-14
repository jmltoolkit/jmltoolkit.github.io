---
title: Method Frames
type: docs
weight: 10
---

`method-frame` stores the execution context of a Java block that may be lost
when a method is inlined. It records the source method signature and type, an
optional `this` instance, and an optional result binding.

## Grammar

```text
method-frame ( [ "result->" name "," ] context ) [ ":" ] block

context       ::= "source" "=" signature "@" type [ "," "this" "=" expression ]
                | SVIDENTIFIER

signature     ::= name "(" [ type ("," type)* ] ")"
```

The `$methodFrame` spelling is accepted as an alias.

## Example

From `javaparser-key-testing/src/test/resources/nameResolution/A.java`:

```java
method-frame(result->a, source=bar()@A, this=self) : {
    this.x = 0;
}
```

SchemaJava may use a schema variable as the entire context
(`javaparser-key-testing/src/test/resources/com/github/javaparser/schemajava.txt`):

```text
{.. method-frame(#ex):{ return #se; } ...}
```

## Semantics and variations

- `result->name` optionally binds the result value to `name`.
- `source = signature @ type` fixes the declaration whose context is used.
- `this = expression` fixes the runtime instance; without it the frame has no
  explicit `this`.
- The block is parsed in the given context, so name resolution sees the source
  method's parameters and `this` type.
- `KeyMethodCallStmt` is also used for the method-frame statement; the name
  `KeyMethodCallStmt` is historical.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyMethodCallStmt` | `...ast.key` | `name` (optional result binding), `context`, `block` |
| `KeyAbstractExecutionContext` | `...ast.key` | common base for concrete/schema contexts |
| `KeyExecutionContext` | `...ast.key` | `context` (source type), `signature`, `instance` (optional `this`) |
| `KeyExecutionContextSV` | `...ast.key.sv` | schema-variable context (`text`) |
| `KeyMethodSignature` | `...ast.key` | `name`, `paramTypes` |

## See also

- [Method calls](../method-calls/)
- [No-body declarations](../no-body-declarations/)
- [Schema variables](../schema-variables/)
