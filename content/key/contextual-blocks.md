---
title: Contextual Blocks
type: docs
weight: 100
---

A contextual block carries an execution context for a sequence of schema
statements. The parser represents it with `KeyContextStatementBlock`.

## Grammar

```text
"{" ( "." [ context ] ".." statement* "..."
    | statement*
    )
"}"
```

The context is one of:

```text
methodSignatureSV "@" typeSV "(" expressionSV? ")"
execCtxtSV
```

## Example

From `javaparser-key-testing/src/test/resources/com/github/javaparser/schemajava.txt`:

```text
{.. ...}
{.. #abortJavaCardTransaction; ...}
{.. #lhs = @(#sv); ...}
```

With an explicit execution context:

```text
{ . #sig@#T(#e) .. <statements> ... }
{ . #ctx .. <statements> ... }
```

## Semantics and variations

- `{ ... }` is an ordinary block.
- `{ .. <statements> ... }` marks a schema block without an explicit context.
- `{ . <context> .. <statements> ... }` fixes the execution context for the
  statements.
- The context can be a method-signature/type pair plus an optional expression,
  or an execution-context schema variable.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyContextStatementBlock` | `...ast.key.sv` | `statements`, `context` (`KeyExecCtxtSV`), `tr` (`KeyTypeSV`), `signature` (`KeyMethodSignatureSV`), `expression` (`KeyExpressionSV`) |

## See also

- [Schema variables](../schema-variables/)
- [Meta-constructs](../meta-constructs/)
