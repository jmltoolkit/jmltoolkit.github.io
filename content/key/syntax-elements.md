---
title: KeY / ProofJava / SchemaJava
type: docs
weight: 200
---

This page preserves the KeY/ProofJava/SchemaJava/Meta-Java material moved from
the former JML syntax page, without further editing.

## KeY extensions — ProofJava

KeY's theorem prover needs constructs that do not occur in ordinary Java.
*ProofJava* (PJava) adds information used during a proof in KeY's sequent
calculus on JavaDL; *SchemaJava* (SJava) adds placeholders for tree matching.
Both are parsed by JMLtk into the `ast/key` packages. The constructs below are
the differences **on top of JML-Java**.

### Method frames

A method frame stores the context of a Java block that may be lost by method
inlining; the execution context fixes the *source* declaration and, optionally,
the `this` instance:

```java
method-frame ( [ result-> <name>, ]
               source = <method-signature>@<type>
               [, this = <expr>] )
    <block>
```

AST nodes: `KeyMethodCallStmt` with a `KeyExecutionContext`,
`KeyMethodSignature`.

### Method calls with a target type

The result type of an expression is written explicitly:

```java
<expr> @ <type>;
<name> = <expr> @ <type>;
```

AST node: `KeyMethodBodyStatement`.

### Java Card transaction markers

```java
#beginJavaCardTransaction ;
#commitJavaCardTransaction ;
#finishJavaCardTransaction ;
#abortJavaCardTransaction ;
```

AST node: `KeyTransactionStmt`.

### Merge points

The KeY *ProofJava* form `merge_point ( <expr> );` is **no longer a dedicated
statement**: the `KeyMergePointStmt` AST node was removed. Because
`merge_point` is a contextual keyword, the form still parses — as an ordinary
method invocation (`ExpressionStmt` wrapping a `MethodCallExpr`), so existing
ProofJava sources keep parsing. The JML merge-point statement with the
`\by`/`\lattice`/`\predicate` options is `JmlMergePointStmt` — see
[JML statements](#jml-statements).

### Loop scopes

```java
loop-scope ( <expr> ) <block>
```

AST node: `KeyLoopScopeBlockStmt`.

### Catch-all statements

A `#catchAll` statement targets the exception variable and wraps a block:

```java
#catchAll ( <name> ) <block>
```

AST node: `KeyCatchAllStmt`.

### `exec` with catch-clauses

```java
exec <block>
[ ccatch ( \Return ) <block> ]
( ccatch ( \Return <type> <id> ) <block> )*
[ ccatch ( \Break ) <block> ]
( ccatch ( \Break <id> ) <block> )*
[ ccatch ( \Break * ) <block> ]
[ ccatch ( \Continue ) <block> ]
( ccatch ( \Continue <id> ) <block> )*
[ ccatch ( \Continue * ) <block> ]
( ccatch ( <parameter> ) <block> )*
```

AST nodes: `KeyExecStmt` with `KeyCcatchBranch`, `KeyCcatchReturn`,
`KeyCcatchBreak`, `KeyCcatchContinue`, `KeyCcatchParameter`.

### Passive expressions

```java
@( <expr> )
```

A *passive* expression has no side effects. AST node: `KeyPassiveExpression`.

### Implicit identifiers

KeY uses a third kind of identifier — Java identifiers enclosed in angle
brackets:

```java
<result>
<count>
```

AST node: `KeyEscapeExpression` and the implicit-id handling in the lexer.

### No-body constructors and methods

KeY allows declarations without a body (the grammar covers bodies as optional):

```java
class String { public String(); }
```

## KeY extensions — SchemaJava

SchemaJava adds *schema variables* (SVs) — placeholders that allow writing AST
patterns — plus meta-constructs for term rewriting.

### Schema variables

A schema variable is a regular identifier starting with `#` (not allowed to
start with a digit):

```java
#a + #b
(#T) (#b - #q)
class #NAME { }
#var + 2 - obj.abc()
#obj.#field1.#field2.#method(#arg1, #arg2);
```

A schema variable may occur anywhere a normal identifier can, and its meaning
is refined by position (as a *type*, as a *statement*, ...). The typed schema
variables are `KeyVariableSV`, `KeyTypeSV`, `KeyStatementSV`,
`KeyExpressionSV`, `KeyMethodSignatureSV`, `KeyProgramVariableSV`,
`KeyCatchClauseSV`, `KeyCcatchSV`, `KeyJumpLabelSV`, `KeyExecCtxtSV`.

### Contextual blocks

A block annotated with context (start/end markers `{ . ... .. ... ... }` and
`{ .. ... ... }`):

```java
{ . <method-signature>@<type>(<expr>)  .. <statements>  ... }
{ . <exec>  .. <statements>  ... }
{ .. <statements>  ... }
{ <statements> }
```

AST node: `KeyContextStatementBlock`.

### Static evaluation and expression-position constructs

KeY schemas use `#staticEvaluate( <expr> )`, `#createObject( … )` and
`#lengthReference( … )`. These names are not reserved meta-constructs and have
no dedicated grammar production: they parse as ordinary `MethodCallExpr` calls
in expression and statement position. The `#isstatic` token and its
`IsStaticMC()` production were removed, so `#isstatic(…)` also parses as an
ordinary `MethodCallExpr`.

### Schema types

```java
<schemaId>
#typeof( <expr> )
```

AST node: `KeyTypeSV`, `KeyMetaConstructType`.

### Meta-construct statements

SchemaJava meta-constructs share one function-call-style syntax:

```text
#name ( <arg>, … )
```

`#name` is a schema identifier; a statement is parsed as a meta-construct only
when the name is in the reserved set. The default set
(`ParserConfiguration.DEFAULT_KEY_META_CONSTRUCT_NAMES`) is:

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

Arguments may be schema variables (`#x`), nested meta-constructs
(`#mn(#elist)`), assignments, labeled statements, or control statements. The
trailing `;` is optional and the pretty printer omits it, keeping the canonical
no-semicolon form. The reserved set is configurable:

```java
ParserConfiguration cfg = new ParserConfiguration()
        .setKeyMetaConstructNames(Set.of("#forToWhile"));
```

`setKeyMetaConstructNames` replaces the whole set; an empty set disables
meta-construct parsing. A statement-level `#name(…)` with a non-reserved name
parses as an ordinary expression statement (a `MethodCallExpr`). AST node:
`KeyMetaConstruct` with a single ordered `children()` list; the old
`getChild()`/`getSchemas()` accessors and the `KeyMetaConstructExpression`
node are gone.

The expression-position names `#staticEvaluate`, `#createObject` and
`#lengthReference` are not reserved meta-constructs — they parse as ordinary
`MethodCallExpr` calls. `#typeof`, `#set`, `#commit`, `#finish`, `#abort` and
`#catchAll` keep their dedicated tokens/productions.


## Compatibility notes (KeY)

### KeY

* the parser supports the JML `merge_point` statement at the syntactic level
  (see above); the KeY ProofJava form `merge_point ( expr );` is parsed as an
  ordinary method invocation; no dedicated support for information-flow
  contracts;
* unclear whether `x instanceof int` should be accepted;
* KeY puts no modifiers in contracts and allows modifiers in arbitrary
  positions; JMLtk follows JML in requiring modifiers before the return type.


## Differences from upstream JavaParser

For maintainers, the structural changes vs. the upstream JavaParser grammar
(JMLtk is a fork):

* **No-body constructors** are allowed (KeY);
* **New statement node types** — `KeyMetaConstruct`,
  `KeyMethodCallStmt`, `KeyMethodBodyStatement`,
  `KeyTransactionStmt`, `KeyLoopScopeBlockStmt`, `KeyCatchAllStmt`,
  `KeyExecStmt` and their `KeyCcatch*` parts;
* **New primitive logic types** — `\bigint`, `\real`, `\locset`, `\seq`,
  `\free`, `\map`;
* **New types** — schema types and meta-types (see SchemaJava);
* **New modifiers** — `ghost`, `model`, `no_state`, `two_state`;
* **A lot of new tokens** (all the JML keywords above), each declared with its
  own lexer rule and classified in `TokenTypes#getCategory`.

See the [AST Classes](../ast-classes/) page for how all of this is reflected in
the node hierarchy, and the [Development](../../devel/) section for the grammar
itself (`javaparser-core/src/main/javacc/java.jj`).
