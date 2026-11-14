---
title: Catch-all Statements
type: docs
weight: 40
---

`#catchAll` wraps a block with a catch-all target. It is a KeY statement for
exception/completion handling.

## Grammar

```text
#catchAll "(" name ")" block
```

## Example

The parser production is exercised by the grammar, but no dedicated sample was
found in the current test corpus:

```java
#catchAll (e) {
    // block
}
```

{{< callout type="info" >}}
`#catchAll` is a KeY statement; it is not part of JML. The parser stores the
target name in `KeyCatchAllStmt`.
{{< /callout >}}

## Semantics and variations

- The parenthesized name is the catch-all target.
- The following block is the handler.
- The construct is a statement, not an expression.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyCatchAllStmt` | `...ast.key` | `label` (target name), `block` |

## See also

- [`exec` and `ccatch`](../exec-ccatch/)
- [Loop scopes](../loop-scopes/)
