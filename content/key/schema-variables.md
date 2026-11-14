---
title: Schema Variables
type: docs
weight: 90
---

Schema variables are placeholders for syntax-tree fragments. They are written
with a leading `#` and are refined by the position in which they appear (type,
expression, statement, method signature, …).

## Grammar

```text
SVIDENTIFIER       ::= "#" identifier

schema-type        ::= SVIDENTIFIER                 // e.g. #T
                     | "#typeof" "(" expression ")"

static-eval name   ::= "#staticEvaluate" "(" expression ")"
                     | "#createObject"   "(" expression ")"
                     | "#lengthReference" "(" expression ")"
```

## Example

From `javaparser-key-testing/src/test/resources/com/github/javaparser/schemajava.txt`:

```text
{.. #lhs = #a + #b; ...}
{.. #lhs = #t.#mn(#elist); ...}
{.. #lhs = (#typeof(#lhs))(#lhs + #e); ...}
{.. #v0 = #createObject(#n); ...}
{.. #v1 = #lengthReference(#a); ...}
{.. #v2 = #staticEvaluate(#e); ...}
```

## Typed schema variables

| Class | Position / use |
| ----- | -------------- |
| `KeyTypeSV` | type position (`#T`) |
| `KeyExpressionSV` | expression position; bare `#x` meta-construct argument |
| `KeyStatementSV` | statement position |
| `KeyMethodSignatureSV` | method signature in a contextual block |
| `KeyProgramVariableSV` | program-variable position |
| `KeyCatchClauseSV` | catch-clause position |
| `KeyCcatchSV` | `ccatch` branch |
| `KeyJumpLabelSV` | jump-label position |
| `KeyExecCtxtSV` | execution-context position |

The `sv` package also contains `KeyMetaConstructType` (`#typeof(expr)`) and
`KeyContextStatementBlock` (see [Contextual blocks](../contextual-blocks/)).
Some typed-SV classes are provided for schema tools even when a given grammar
production does not instantiate them.

## Schema types and `#typeof`

- `#T` is a type schema variable; it is a `KeyTypeSV`.
- `#typeof(expr)` is a type-of construct; it is a `KeyMetaConstructType` whose
  `kind` is `#typeof` and whose `expr` is the argument.

## Static-evaluation names

`#staticEvaluate`, `#createObject`, and `#lengthReference` are **not** reserved
meta-constructs. They have no dedicated grammar production and parse as ordinary
`MethodCallExpr` calls (with their arguments). `#isstatic` and its
`IsStaticMC()` production were removed.

{{< callout type="info" >}}
These names are accepted for KeY schema compatibility, but the parser does not
attach a special AST node to them. If your tool needs marker semantics, inspect
the `MethodCallExpr` name.
{{< /callout >}}

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyTypeSV` | `...ast.key.sv` | `text` |
| `KeyExpressionSV` | `...ast.key.sv` | `text` |
| `KeyStatementSV` | `...ast.key.sv` | `text` |
| `KeyMethodSignatureSV` | `...ast.key.sv` | `text` |
| `KeyProgramVariableSV` | `...ast.key.sv` | `text` |
| `KeyCatchClauseSV` | `...ast.key.sv` | `schemaVar` |
| `KeyCcatchSV` | `...ast.key.sv` | `text` |
| `KeyJumpLabelSV` | `...ast.key.sv` | `text` |
| `KeyExecCtxtSV` | `...ast.key.sv` | `text` |
| `KeyMetaConstructType` | `...ast.key.sv` | `kind` (`#typeof`), `expr` |

## See also

- [Contextual blocks](../contextual-blocks/)
- [Meta-constructs](../meta-constructs/)
- [Method frames](../method-frames/)
