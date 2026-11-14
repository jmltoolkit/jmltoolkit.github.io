---
title: Method Calls with Target Type
type: docs
weight: 20
---

A KeY method call can state the target/source type explicitly with `@`:

```java
<expr> @ <type>;
<name> = <expr> @ <type>;
```

This is useful in schemas where the dynamic type of the receiver is not known
from the ordinary Java type system.

## Grammar

```text
method-call ::= [ name "=" ] expression "@" type ";"
```

## Example

From `javaparser-key-testing/src/test/resources/com/github/javaparser/schemajava.txt`:

```text
{.. #jcsystemType.#abortTransaction()@#jcsystemType; ...}
{.. #jcsystemType.#beginTransaction()@#jcsystemType; ...}
{.. #jcsystemType.#commitTransaction()@#jcsystemType; ...}
```

## Semantics and variations

- The expression before `@` is the call or value.
- The type after `@` is the source/target type used by the schema matcher.
- An optional `name =` binds the result to a schema variable or local name.
- The trailing `;` is required.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyMethodBodyStatement` | `...ast.key` | `name` (optional), `expr`, `source` (the `@type`) |

## See also

- [Method frames](../method-frames/)
- [Schema variables](../schema-variables/)
- [Passive expressions](../passive-expressions/)
