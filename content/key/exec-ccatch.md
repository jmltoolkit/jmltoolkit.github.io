---
title: exec and ccatch
type: docs
weight: 50
---

`exec` runs a block and attaches completion handlers with `ccatch`. Handlers
can catch normal returns, breaks, continues, and exception parameters.

## Grammar

```text
exec block
[ ccatch "(" "\\Return" ")" block ]
( ccatch "(" "\\Return" parameter ")" block )*
[ ccatch "(" "\\Break" ")" block ]
( ccatch "(" "\\Break" name ")" block )*
[ ccatch "(" "\\Break" "*" ")" block ]
[ ccatch "(" "\\Continue" ")" block ]
( ccatch "(" "\\Continue" name ")" block )*
[ ccatch "(" "\\Continue" "*" ")" block ]
( ccatch "(" parameter ")" block )*
( ccatch SVIDENTIFIER )*
```

`ccat` is accepted as a short spelling of `ccatch`.

## Example

From
`jmlparser-jml-tests/src/test/resources/fullexamples/key/completionscopes/src/CompletionScopes.java`:

```java
exec {
    return -1;
}
ccatch(\Return) {
    return -7;
}
ccatch(\Return int val) {
    return ++val;
}
ccatch(ArithmeticException t) {
    return -3;
}
ccatch(Throwable t) {
    return -4;
}
```

## Semantics and variations

- `\Return` catches normal returns; an optional parameter receives the value.
- `\Break` catches break completion; an optional label restricts it; `*`
  matches any label.
- `\Continue` catches continue completion with the same label/wildcard rules.
- An ordinary parameter catches an exception of that type.
- A final `ccatch` schema variable provides a schema-level catch branch.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyExecStmt` | `...ast.key` | `execBlock`, `branches` |
| `KeyCcatchBranch` | `...ast.key` | abstract branch base |
| `KeyCcatchReturn` | `...ast.key` | `parameter` (optional), `block` |
| `KeyCcatchBreak` | `...ast.key` | `label` (optional, `*` allowed), `block` |
| `KeyCcatchContinue` | `...ast.key` | `label` (optional, `*` allowed), `block` |
| `KeyCcatchParameter` | `...ast.key` | `parameter`, `block` |
| `KeyCcatchSV` | `...ast.key.sv` | schema-variable catch branch (`text`) |

## See also

- [Catch-all statements](../catch-all/)
- [Loop scopes](../loop-scopes/)
