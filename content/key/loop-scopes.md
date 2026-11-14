---
title: Loop Scopes
type: docs
weight: 30
---

`loop-scope` marks a block that belongs to a loop for inlining. It names the
loop-variant/index program variable used by the scope.

## Grammar

```text
loop-scope "(" expression ")" block
```

The `$loopScope` spelling is accepted as an alias.

## Example

From `javaparser-key-testing/src/test/resources/com/github/javaparser/schemajava.txt`:

```text
{.. loop-scope(#lhs) { break #lb; #slist } ...}
{.. loop-scope(#lhs) { continue #lb; #slist } ...}
{.. loop-scope(#lhs) { return #se; #slist } ...}
{.. boolean #x; loop-scope(#x) { if (#nse) { #body continue; } } ...}
```

## Semantics and variations

- The parenthesized expression is the loop index/variant program variable.
- The block is the loop body or a loop-scoped statement sequence.
- `break`, `continue`, `return`, and `throw` inside the block are scoped to the
  loop-scope construct.
- The `$loopScope` alias is equivalent to `loop-scope`.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyLoopScopeBlockStmt` | `...ast.key` | `indexPV` (the loop variable), `block` |

## See also

- [`exec` and `ccatch`](../exec-ccatch/)
- [Method frames](../method-frames/)
