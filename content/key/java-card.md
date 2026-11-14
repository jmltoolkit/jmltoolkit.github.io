---
title: Java Card Transactions
type: docs
weight: 60
---

KeY's ProofJava supports Java Card transaction markers as standalone statements.

## Grammar

```text
#beginJavaCardTransaction ;
#commitJavaCardTransaction ;
#finishJavaCardTransaction ;
#abortJavaCardTransaction ;
```

## Example

From `javaparser-key-testing/src/test/resources/com/github/javaparser/schemajava.txt`:

```text
{.. #beginJavaCardTransaction; ...}
{.. #commitJavaCardTransaction; ...}
{.. #finishJavaCardTransaction; ...}
{.. #abortJavaCardTransaction; ...}
```

## Semantics and variations

- Each marker is a statement terminated by `;`.
- The four markers map to `KeyTransactionStmt.TransactionType.BEGIN`,
  `COMMIT`, `FINISH`, and `ABORT`.
- The markers are only meaningful to tools that model Java Card transactions.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyTransactionStmt` | `...ast.key` | `type` is `TransactionType.BEGIN` / `COMMIT` / `FINISH` / `ABORT` |

## See also

- [Method calls](../method-calls/)
- [Passive expressions](../passive-expressions/)
