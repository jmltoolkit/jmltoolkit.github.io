---
title: Passive Expressions
type: docs
weight: 70
---

A passive expression marks its argument as side-effect free for a schema
transformation:

```java
@( expression )
```

## Grammar

```text
"@" "(" expression ")"
```

## Example

From `javaparser-key-testing/src/test/resources/com/github/javaparser/schemajava.txt`:

```text
{.. #lhs = @(#sv); ...}
{.. #lhs = @(#t.#mn(#elist)); ...}
```

## Semantics and variations

- The `@` form is a marker; the wrapped expression is unchanged.
- It tells the transformation tool that evaluating the expression has no
  side effects.
- It is an expression, so it can appear wherever an expression is allowed.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyPassiveExpression` | `...ast.key` | `expr` (the wrapped expression) |

## See also

- [Method calls](../method-calls/)
- [Schema variables](../schema-variables/)
