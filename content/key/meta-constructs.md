---
title: Meta-constructs
type: docs
weight: 110
---

A KeY meta-construct is a statement-level `#name(args)` call used by schema
transformations. JMLtk uses one generic production for the reserved names.

## Grammar

```text
meta-construct ::= "#" name "(" [ arg ( "," arg )* ] ")" [ ";" ]

arg            ::= SVIDENTIFIER
                 | expression
                 | assignment
                 | labeled-statement
                 | control-statement
```

The trailing `;` is optional; the pretty printer omits it.

## Example

From `javaparser-key-testing/src/test/java/com/github/javaparser/ast/key/sv/KeyMetaConstructTest.java`:

```text
{.. #forToWhile(#innerLabel, #outerLabel, #forloop) ...}
{.. #methodCall(#ex, #mn(#elist), #forloop); ...}
{.. #doBreak(#lb0: break #lb1;); ...}
```

A statement-level `#name(...)` whose name is **not** reserved stays an ordinary
expression statement:

```text
{.. #custom(#a, #b); ...}
```

## Configuring the reserved names

The reserved set is configured on `ParserConfiguration`:

```java
ParserConfiguration cfg = new ParserConfiguration();
cfg.setKeyMetaConstructNames(Set.of("#forToWhile", "#methodCall"));
```

- `setKeyMetaConstructNames(Set<String>)` **replaces** the whole set.
- `getKeyMetaConstructNames()` returns the current set.
- The default is `ParserConfiguration.DEFAULT_KEY_META_CONSTRUCT_NAMES`.
- An empty set disables meta-construct parsing entirely.
- Names must include the leading `#` and are matched exactly.
- A non-reserved `#name(...)` falls back to an ordinary `MethodCallExpr`
  expression statement (a bare `#ident` without `(` remains a statement
  placeholder).
- The parser uses `GeneratedJavaParserBase.isKeyMetaConstructName` as a
  statement-level lookahead over the configured set.

The default reserved names:

```text
#arrayPostDeclaration      #constructorCall        #doBreak
#enhancedforElim           #evaluateArguments      #expandMethodBody
#forInitUnfoldTransformer  #forToWhile             #initArrayAssignments
#initArrayCreation         #initArrayCreationTransient
#loopScopeInvariantTransformer  #methodCall        #postWork
#reattachLoopInvariant     #replace                #resolveMultipleVarDecl
#specialConstructorCall    #staticInitialisation   #switchToIf
#unpack                    #unwindLoop             #unwindLoopBounded
```

## Argument shapes

- a bare schema variable (`#innerLabel`) becomes a `KeyExpressionSV`;
- a nested meta-construct call (`#mn(#elist)`) stays a `MethodCallExpr`;
- an assignment, labeled statement, or control statement is kept as the
  corresponding AST node.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `KeyMetaConstruct` | `...ast.key.sv` | `kind` (the `#name` text), ordered `children` |
| `KeyExpressionSV` | `...ast.key.sv` | bare `#ident` arguments |

## See also

- [Schema variables](../schema-variables/)
- [Contextual blocks](../contextual-blocks/)
- [`exec` and `ccatch`](../exec-ccatch/)
