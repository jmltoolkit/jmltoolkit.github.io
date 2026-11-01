---
title: AST Classes
type: docs
weight: 150
---

# AST Classes

JMLtk's abstract syntax tree is the JavaParser AST extended with JML and KeY
nodes. Every construct the parser accepts — a statement, an expression, a type,
a JML clause — is represented by exactly one class that inherits from `Node`.
This page describes the design philosophy behind those classes: how they are
named, how they are structured, and the conventions every AST class follows.
The syntax they represent is documented, element by element with examples, on
the [Syntax Elements](../syntax-elements/) page.

## One class per syntax element

The AST mirrors the grammar `javaparser-core/src/main/javacc/java.jj` almost
one-to-one: a grammar rule produces a node of the same name. If two rules can't
be told apart syntactically, they still get distinct classes; if a rule is a
simple choice of others, a single class with a kind discriminator is used.

The classes live in three worlds, clearly separated by package and prefix:

| Package | Prefix | Example | Represents |
| ------- | ------ | ------- | ---------- |
| `com.github.javaparser.ast.*` | *(none, JavaParser names)* | `MethodCallExpr`, `ForStmt`, `ClassOrInterfaceType` | plain Java |
| `com.github.javaparser.ast.jml.*` | `Jml` | `JmlContract`, `JmlQuantifiedExpr`, `JmlGhostStmt` | JML (below, split into `body`, `clauses`, `doc`, `expr`, `proof`, `stmt`, `type`) |
| `com.github.javaparser.ast.key.*` | `Key` | `KeyCatchAllStmt`, `KeyExecStmt`, `KeyTransactionStmt` | KeY's ProofJava / SchemaJava extensions |

The `jml` sub-packages follow the node *kind*: `clauses` holds the contract
parts (`JmlClause`, `JmlContract`), `expr` the JML-only expressions
(`JmlQuantifiedExpr`, `JmlLetExpr`, `JmlMultiCompareExpr`, `JmlLabelExpr`),
`stmt` the JML statements (`JmlGhostStmt`, `JmlRefiningStmt`,
`JmlBeginStmt`/`JmlEndStmt`), `type` the specification-only types
(`JmlLogicType`), and `doc` the JML documentation constructs.

## Naming

* **Suffixes encode the grammatical category**: expressions end in `Expr`
  (`BinaryExpr`, `MethodCallExpr`), statements in `Stmt` (`IfStmt`,
  `JmlGhostStmt`), types in `Type` (`PrimitiveType`,
  `ClassOrInterfaceType`), and JML specification parts in `Clause` /
  `Contract` (`JmlClause`, `JmlContract`). One class per clause *shape*:
  `JmlConditionalClause` (predicate clauses: `requires`/`ensures`/`invariant`),
  `JmlSignalsClause` / `JmlSignalsOnlyClause` (`signals (E e) P` /
  `signals_only T1, T2`), `JmlSimpleExprClause` / `JmlMultiExprClause`
  (single- and multi-expression clauses such as `assignable`),
  `JmlCallableClause` (`callable`), `JmlForallClause`, `JmlOldClause`,
  `JmlLabeledClause`, `JmlInfFlowClause`. The specific keyword is then an
  enum discriminator, `JmlClauseKind` (`REQUIRES`, `ENSURES`, `ASSIGNABLE`, …).
* **`Jml` / `Key` prefixes are mandatory**: they are the only way to distinguish
  JML/KeY constructs from plain Java in a mixed AST, and they keep the `jml` /
  `key` sub-packages self-identifying.
* **Names are the grammar names**: renaming a production means renaming its
  class, its visit methods, its pretty-printer rule and the metamodel entry
  together (see [generated code](#generated-code)).

## Structure of an AST class

* **Everything is a `Node`.** `Node` provides parent/child navigation
  (`getParentNode`, `findAncestor`), ranges (`TokenRange`, `Range`),
  `DataKey`-based annotations and the visitor machinery.
* **Fields are the syntactic parts.** Children are `Node` properties, other
  parts (names, modifiers, keywords) are regular fields. Both get plain
  getter/setter pairs. There are no `protected` back doors; accessors are the
  API.
* **Interfaces express shared shape.** About 30 `NodeWith*` mixins
  (`NodeWithName`, `NodeWithModifiers`, `NodeWithJavadoc`, `NodeWithBody`, …)
  capture behaviour shared across classes; JML adds `NodeWithContracts` and
  `NodeWithJmlTags`. A class implements the mixins that fit its shape instead
  of inheriting them.
* **One constructor.** Every node has an `@AllFieldsConstructor` whose
  parameter list mirrors the fields in declaration order — the constructor
  *is* a declaration of the node's structure.
* **Generation annotations.** `@OptionalProperty` marks fields that may be
  absent (used by the code generators, the observers and the visitors);
  `@DerivedProperty` marks fields that are redundant with others and should
  be treated specially.
* **`isXxx()` / `asXxx()` helpers.** Type-test predicates and unchecked casts
  follow the `Expression`-style JavaParser idiom.

## Generated code — never hand-edit

The metamodel, the visitors, the pretty printer and the token kinds are
**generated**: `Node*MetaModel.java` in `metamodel`, the clone/equals/hashcode/
modifier/observer visitors, `ObservableProperty`, `JavaToken` kinds and the
pretty-printing strategies. You do not edit them — you change the AST class and
regenerate:

```text
./scripts/run-generators.sh          # metamodel + core generators + spotless
./gradlew :javaparser-core:compileJavacc   # regenerate the parser from java.jj
```

`./scripts/run-generators.sh` finishes with `git diff --exit-code`, so a
missing regeneration fails CI (the "Metamodel/Model are fresh" check).
Manual edits to generated files are rejected in review.

**Grammar and tokens.** New tokens need a dedicated lexer rule in `java.jj`
(existing rules must not be reordered), and *every* token kind must be
classified in `TokenTypes#getCategory(int)` — `TokenTypesTest` enforces it.

## Javadoc shows the syntax

Every AST class documents — in its Javadoc — **an example of the underlying
syntax construct**. A statement node shows a piece of code; a clause node shows
a JML phrase; an expression node shows the textual operator. This is the
single source of truth that the [Syntax Elements](../syntax-elements/) page is
built from, and it keeps the tree answerable to "what does this class parse?":

```java
/**
 * A {@code for} statement.
 * <p>Example:
 * <pre>
 * for (int i = 0; i &lt; 10; i++) { … }
 * </pre>
 */
public final class ForStmt extends Statement { … }
```

## Coding style

* four-space indentation, no tabs;
* wrap at 120 columns; wrapped arguments align to the opening parenthesis;
* type and method annotations go on a separate line;
* every new file carries the project license header (LGPL-3.0/Apache-2.0),
  separated from the `package` declaration by a blank line;
* `spotlessApply` enforces the formatting, `spotlessCheck` in CI.

## Extending the AST

Adding or removing classes and fields is a guided process — the full checklist
is the *Guide to Adding New Nodes and Fields* in the repository's
`CONTRIBUTING.md`. The condensed workflow:

1. **Add** the node outline: class in the `Node` hierarchy, fields with
   `@OptionalProperty` where needed, `NodeWith*` mixins, an
   `@AllFieldsConstructor`, and stubbed visitor methods — enough to compile.
2. Register the class in `ALL_NODE_CLASSES` of the metamodel generator
   (after any parent classes).
3. Run `./scripts/run-generators.sh` — then fix the pretty-printer `visit`
   methods (both `DefaultPrettyPrinterVisitor` and `PrettyPrintVisitor`) and
   the `ConcreteSyntaxModel` entry (`concreteSyntaxModelByClass.put(…, sequence())`).
4. Add grammar rules (`java.jj`), language-level validators, and AST tests for
   the new node (see [examples in the repo](https://github.com/jmltoolkit/jmltk)).
5. **Remove** a class or attribute: remove it from `ALL_NODE_CLASSES`,
   regenerate, and follow the compiler errors (visitors lose the `visit`
   method; attributes lose their getter/setter stubs).

JML nodes follow the *same* process inside `com.github.javaparser.ast.jml`;
KeY nodes inside `com.github.javaparser.ast.key`.

See the [Development](../../devel/) section for building the sources and the
generator tooling.
