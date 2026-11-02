---
title: Syntax Elements
type: docs
weight: 200
---

# Syntax Elements

This page is the single reference for the syntax JMLtk understands — plain Java
plus the Java Modeling Language (JML) plus KeY's ProofJava and SchemaJava
extensions — element by element, with an example for each. The classes of the
AST that represent these elements, and the philosophy behind their naming and
structure, are described on the [AST Classes](../ast-classes/) page.

> **Dialect.** JML is not standardized: the
> [JML reference manual](https://www.cs.ucf.edu/~leavens/JML/jmlrefman/jmlrefman.html)
> defines the common core, but the tools interpret it differently. JMLtk tries
> to follow the reference manual in the common parts, while staying compatible
> with [OpenJML](https://github.com/OpenJML) and [KeY](https://key-project.org/),
> and it often accepts a *liberal superset* of the reference syntax so that all
> dialects can be parsed. Note that the parser provides **no semantics** — it
> lifts the textual JML into an AST, and you, the library user, are responsible
> for giving the constructs meaning.

## Java

JMLtk parses the Java language itself, currently declared to **support Java 25**
(see the project `README.md`). The language features tracked since the
`java-features` documentation are the JDK 8 to JDK 17 set below plus the
subsequent releases; non-language changes (JVM, GC, packaging — "NA") are
irrelevant for a parser. Language-related changes normally come with a
*validator* used in conjunction with the grammar as part of the parsing process.

| JDK | Language features JMLtk covers |
| --- | ------------------------------ |
| **8** (2014) | lambda expressions, functional-style stream operations, default (virtual extension) methods, type annotations (JSR 308), repeating annotations (JSR 337), Date/Time API |
| **9** (2017) | modules (Project Jigsaw), JShell, plus Milling Project Coin: private interface methods, diamond with anonymous classes, safe `var`-free improvements |
| **10** (2018) | local-variable type inference (`var`) |
| **11** (2018) | local-variable syntax for lambda parameters (`(var x, var y) -> ...`), nest-based access control |
| **12** (2019) | switch expressions (preview) |
| **13** (2019) | text blocks (preview) |
| **14** (2020) | switch expressions (standard), text blocks (2nd preview), pattern matching for `instanceof` (preview), records (preview) |
| **15** (2020) | text blocks (standard), records (2nd preview), pattern matching for `instanceof` (2nd preview), sealed classes (preview) |
| **16** (2021) | records (standard), pattern matching for `instanceof` (standard), sealed classes (2nd preview) |
| **17** (2021) | sealed classes (standard), always-strict floating point, pattern matching for `switch` (preview); the current preview baseline |
| **18+** (2022→) | pattern matching for `switch` matures (JEP 420); the project tracks newer previews and releases as they stabilize |

## JML specification comments

JML lives inside Java comments. JMLtk recognizes two comment shapes:

```java
//@ requires x != null;         // single-line form
/*@ ensures \result >= x; @*/   // block form
```

They are only processed when JML processing is enabled in the
`ParserConfiguration` (for example `setProcessJml(true)`); the CLI and the
library default the *KeY* key set on.

## Method contracts

A contract groups clauses under a *behavioral keyword* and is attached to a
method, constructor, or block. Behaviors may be joined with `also`:

```java
/*@ normal_behavior
  @ requires x != null;
  @ ensures \result == x.length;
  @ also
  @ exceptional_behavior
  @ signals (NullPointerException) x == null;
  @*/
public int size(String x) { ... }
```

Behavioral keywords: `behavior`, `normal_behavior`, `exceptional_behavior`,
`model_behavior`, `abrupt_behavior`, `break_behavior`, `continue_behavior`,
`feasible_behavior`, `diverges`. Contract elements are clauses; the parser
knows the following kinds (`JmlClauseKind`):

### Pre- and postconditions

| Clause | Meaning | Example |
| ------ | ------- | ------- |
| `requires` <br/> `requires_free` <br/> `requires_redundantly` | precondition | `//@ requires size > 0;` |
| `ensures` <br/> `ensures_free` <br/> `ensures_redundantly` | postcondition | `/*@ ensures size() == \old(size()) + 1; @*/` |
| `pre` / `pre_redundantly` | openJML-style precondition | `//@ pre x >= 0;` |
| `post` / `post_redundantly` | openJML-style postcondition | `//@ post \result >= 0;` |

The `_free` variants must hold independent of any other contract (they may not
be weakened); `_redundantly` variants may state what follows from the other
clauses, helping verification tools.

### Frame (assignable) clauses

| Clause | Meaning | Example |
| ------ | ------- | ------- |
| `assignable` / `assignable_redundantly` | locations the body may assign | `//@ assignable \nothing;` |
| `modifiable` / `modifiable_redundantly` | synonym of `assignable` | `//@ modifiable this.f;` |
| `modifies` / `modifies_redundantly` | synonym of `assignable` | `//@ modifies arr[*];` |
| `accessible` | locations the contract may read | `//@ accessible this.f, this.g;` |

Location sets are ordinary JML expressions — fields, array ranges
(`arr[*]`, `arr[i..j]`) — including the special sets `\nothing`,
`\strictly_nothing` and `\not_specified`.

### Exceptional behavior

| Clause | Meaning | Example |
| ------ | ------- | ------- |
| `signals` / `signals_redundantly` | what holds when the given exception is thrown | `/*@ signals (IndexOutOfBoundsException) i >= size; @*/` |
| `signals_only` | the exception types that may escape | `//@ signals_only NumberFormatException, NullPointerException;` |

The `signals` clause binds the exception variable: `signals (E e) P` means
"whenever `e` of type `E` is thrown, `P` holds".

### Concurrency, resources, termination

| Clause | Meaning | Example |
| ------ | ------- | ------- |
| `when` | lock/condition required to call the method (`\lockset` predicates) | `//@ when \lockset == EmptySet;` |
| `working_space` / `working_space_redundantly` | resource consumption bound | `//@ working_space \bigint_math bounds o;` |
| `captures` / `captures_redundantly` | objects that may be captured on the method result | `//@ captures fresh[*];` |
| `duration` / `duration_redundantly` | time bound | `//@ duration 0, 5;` |
| `callable` / `callable_redundantly` | the methods that may be called by the body | `//@ callable foo, bar;` |
| `diverges` / `diverges_redundantly` | condition under which the method need not terminate | `//@ diverges !terminates;` |
| `determines` / `separates` <br/> `loop_determines` / `loop_separates` | termination / equivalence for statements and loops (extended kinds) | `//@ determines \not_specified;` |

### Loop specifications (KeY-style keywords)

| Clause | Meaning | Example |
| ------ | ------- | ------- |
| `maintaining` / `maintaining_redundantly` | loop invariant (synonym of `loop_invariant`) | `//@ maintaining 0 <= i && i <= n;` |
| `loop_invariant` / `loop_invariant_free` / `loop_invariant_redundantly` | loop invariant | `/*@ loop_invariant sum == (\sum int k; 0<=k && k<i; a[k]); @*/` |
| `decreases` / `decreases_redundantly` <br/> `decreasing` (alias) | loop variant term | `//@ decreases n - i;` |
| `measured_by` | variant term for recursive or block contracts | `//@ measured_by n - i;` |
| `breaks` / `breaks_redundantly` | contract on `break` out of a loop (`break_behavior`) | `//@ breaks (Label) i == n;` |
| `continues` / `continues_redundantly` | contract on `continue` in a loop (`continue_behavior`) | `//@ continues i < n;` |

Block and loop contracts can be written with their own behavior section:

```java
/*@ loop_contract normal_behavior
  @ requires true;
  @ ensures true;
  @ assignable \strictly_nothing;
  @*/
while (cond) { ... }
```

### Class-level members (`JmlBodyClauseKind`)

Class-level specification elements are clauses of the `body` package:

| Element | Meaning | Example |
| ------- | ------- | ------- |
| `invariant` / `invariant_free` / `invariant_redundantly` | class invariant | `/*@ invariant balance >= 0; @*/` |
| `constraint` / `constraint_redundantly` | relational invariant between old and new state | `//@ constraint count >= \old(count);` |
| `axiom` | logical axioms usable in proofs | `//@ axiom \forall int x; x * 0 == 0;` |
| `initially` | invariant holding after construction | `//@ initially empty();` |

### Model, ghost and spec state

* `model` fields and methods are specification-only members with no Java
  implementation; `ghost` declarations introduce specification variables that
  can be assigned by JML statements (see [statements](#jml-statements));
  both carry the `model`/`ghost` modifiers (below).
* `represents` connects a model field to concrete state
  (`JmlRepresentsDeclaration`):

```java
//@ model int size;
//@ represents size <- items.length;

//@ ghost int count;
//@ model public static boolean conversionBad(String s);
```

* `spec_public`, `spec_package`, `spec_protected`, `spec_private` widen the
  Java visibility for specification access.

## JML expressions

### Quantified expressions

The reference quantifiers — `\forall`, `\exists`, `\max`, `\min`, `\sum`,
`\product`, `\num_of` — are supported, followed by a bound-var declaration with
an optional bound-var modifier, a `;`, one or more predicates, and the body:

```java
//@ ensures (\forall int i; 0 <= i && i < a.length; a[i] > 0);
//@ ensures (\sum int i; 0 <= i && i < n; a[i]) == total;
//@ ensures (\num_of int i; 0 <= i && i < n; a[i] == 0) == zeros;
```

The grammar is deliberately more liberal than the reference so that all
dialects parse: a quantified expression is

```text
"(" quantifier bound-var-decls ";" Expression (";" Expression)* ")"
```

i.e. as many range expressions as you like. This also covers the KeY form of a
bounded sum with lower **and** upper bound:

```java
//@ ensures (\bsum int i; i > 0; i <= n / 2; 2 * i) == total;
```

Since the reference manual only knows seven quantifiers with at most two
bound expressions, you are responsible for raising an error if your tool
cannot handle an unusual combination.
Represented by `JmlQuantifiedExpr`.

### `\let`, `\old` and friends

| Expression | Meaning | Example |
| ---------- | ------- | ------- |
| `\let t = e; P` | local binding, universally quantified over the bound term | `//@ ensures \let x = arr[i]; x == \old(x) + 1;` |
| `\old(e)` | value of `e` in the pre-state | `//@ ensures balance == \old(balance) + amount;` |
| `\pre(e)` | value of `e` in the precondition state (OpenJML) | `//@ ensures x == \pre(x);` |
| `\result` | return value of the annotated method | `//@ ensures \result >= 0;` |
| `\fresh(e)` | object newly created by the call | `//@ ensures \fresh(\result);` |
| `\reachable` / `\reach` | reachability in the object graph | `//@ ensures \reachable(f).isEmpty();` |
| `\lockset` | set of locks held | `//@ requires \lockset == EmptySet;` |
| `\type(T)` | the runtime `Type` of `T` | `//@ ensures \result.getClass() == \type(Foo);` |
| `\typeof(e)` | the dynamic type of the object | `//@ ensures \typeof(\result) <: \type(Foo);` |
| `\not_specified` | "any value" placeholder | `//@ assignable \not_specified;` |
| `\such_that` | "witness satisfying" binder | `//@ ensures \such_that int x; x > 0;` |

The full inventory of specification keywords the lexer recognizes includes
`\all_fields`, `\all_objects`, `\empty`, `\emptyset`, `\seq_singleton`,
`\seq_concat`, `\seq_get`, `\seq_length`, `\seq_put`, `\seq_reverse`,
`\seq_sub`, `\set_union`, `\set_minus`, `\intersect`, `\infinite_union`,
`\subset`, `\singleton`, `\locset`, `\lockset`, `\nonnullelements`,
`\not_assigned`, `\not_modified`, `\only_assigned`, `\only_accessed`,
`\only_called`, `\only_captured`, `\same`, `\new_elems_fresh`,
`\new_objects`, `\static_invariant_for`, `\invariant_for`,
`\is_initialized`, `\java_math`, `\bigint_math`, `\safe_math`,
`\from_goal`, and the `\lbl`-marked formulas used by KeY proof scripting.

### Relational chains

JML allows chaining comparison operators as a conjunction; JMLtk parses them
into a single multi-comparison node (`JmlMultiCompareExpr`):

```java
//@ requires 0 <= x <= a.length;      // 0 <= x && x <= a.length
//@ ensures  i < j <= n;
```

### Infix set and subtype operators

The lexical level permits infix use of the set operators (`JmlBinaryInfixExpr`
keeps the operator token as a name): a `\cup` b `\cap` c, `\subset`,
`\intersect`, `\set_union`, `\set_minus`, ... and the subtype operator `<:`:

```java
//@ ensures \typeof(\result) <: \type(Exception);
//@ ensures s1 \subset s2 \cup s3;
```

### Set comprehensions

```java
//@ ensures seen == { int i; 0 <= i && i < n; a[i] };   // JmlSetComprehensionExpr
```

### Logic types

Specification-only types are parsed into `JmlLogicType`:

```text
\bigint    mathematical arbitrary-precision integer
\bigfloat  mathematical real (bit-exact floats)
\real      mathematical reals
\locset    location set (a "store" of assignable locations)
\seq       immutable sequences of values
\set       finite sets of values
\map       total or partial maps (KeY)
```

## JML statements

Inside method bodies, JML contributes statements (`ast/jml/stmt`):

| Statement | Meaning | Example |
| --------- | ------- | ------- |
| `ghost` declarations / assignments | specification variable updates | `//@ ghost int n = 0;` … `//@ set n = n + 1;` |
| `assert` | in-spec assertion | `//@ assert i < n;` |
| `assume` | in-spec assumption | `//@ assume i >= 0;` |
| `refining` | refinement between spec levels (`JmlRefiningStmt`) | `//@ refining ...` |
| `begin` / `end` | block markers (`JmlBeginStmt` / `JmlEndStmt`) | `//@ begin ... //@ end` |
| `unreachable` | marks dead code (`JmlUnreachableStmt`) | `//@ unreachable;` |
| `merge_point` | state-merging / abstraction point (`JmlMergePointStmt`) | `//@ merge_point \by "MergeByPredicateAbstraction" \lattice conjunctive;` |

In addition, spec-only expressions can appear as statements via
`JmlExpressionStmt`.

### Merge points

A state-merging (abstraction) point tells the verification tool where and how
to merge symbolic execution states, as used by KeY's state-merging:

```java
//@ merge_point \by "MergeByPredicateAbstraction"
//@     \lattice conjunctive
//@     \predicate (int x) : x >= 0, x == \old(b) || x == -\old(b);
```

All three options are optional and must appear in this fixed order: `\by`,
then `\lattice`, then `\predicate`. The values of `\by` and `\lattice` may be
given as a string literal or as a plain identifier; both forms are normalised
to a `StringLiteralExpr` in the AST. `\predicate` binds a variable of the given
type and lists the abstraction predicates separated by commas. AST node:
`JmlMergePointStmt` (properties `by`, `lattice`, `predicateVariable`,
`predicates`).

## Modifiers

JML modifiers appear together with Java modifiers on members and fields
(`Modifier` class, `JML_*` keywords). The parser knows:

```text
ghost   model   helper   instance
nullable   non_null   non_null_by_default   nullable_by_default
nonnullelements
spec_public   spec_package   spec_protected   spec_private
no_state   two_state
code   code_java_math   code_bigint_math   code_safe_math
spec_java_math   spec_bigint_math   spec_safe_math
peer   rep   read_only
```

For example:

```java
public class Bag {
    private /*@ spec_public @*/ int n;
    private /*@ non_null @*/ int[] items;
    //@ ghost int count;
    //@ model int capacity;
    //@ invariant 0 <= n && n <= items.length;
    //@ invariant n == count;
}
```

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

```java
merge_point ( <expr> );
```

AST node: `KeyMergePointStmt`. This is the KeY *ProofJava* form; the JML
statement with the `\by`/`\lattice`/`\predicate` options is a different node
(`JmlMergePointStmt`) — see [JML statements](#jml-statements).

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

### Static evaluation

```java
#evaluate( <expr> )
```

### Schema types

```java
<schemaId>
#typeof( <expr> )
```

AST node: `KeyTypeSV`, `KeyMetaConstructType`.

### Meta-construct statements

A series of statement-level meta constructs for rewriting:

```java
#unwind-loop ( <label>, <label>, <loopStatement> );
#unwind-loop-bounded ( <label>, <label>, <loopStatement> );
#FORINITUNFOLDTRANSFORMER( ForInit );
#LOOPSCOPEINVARIANTTRANSFORMER( <whileStatement> );
#unpack ( <forStatement> );
#for-to-while ( <label>, <label>, <statement> );
#switchof ( <statement> );
#do-break ( <labeledStatement> );
#evaluate-arguments ( <expression> );
#replace ( <statement>, <variable> );
#method-call ( [<variable>,] [<variable>,], <primaryExpression> );
#expand-method-body ( <statement> [, <variable>] );
#constructor-call ( <variable>, <variable> );
#special-constructor-call ( <variable> );
"#post-work" ( consRef = ExpressionSV() ) ";"
"#static-initialisation" ( activeAccess = PrimaryExpression() ) ";"
"#resolve-multiple-var-decl" ( stat = Statement() ) ";"
"#array-post-declaration" ( stat = Statement() ) ";"
"#init-array-creation" ( sv = VariableSV(), consRef = ExpressionSV() ) ";"
"#init-array-creation-transient" ( sv = VariableSV(), consRef = ExpressionSV() ) ";"
"#init-array-assignments" ( sv = VariableSV(), consRef = ExpressionSV() ) ";"
"#enhancedfor-elim" ( loopStat = ForStatement() ) ";"
<REATTACHLOOPINVARIANT> ( loopStat = WhileStatement() ) ";"
```

AST node: `KeyMetaConstruct` and `KeyMetaConstructExpression`.

## Compatibility notes (deviations)

JMLtk may parse more than it can *interpret*. The following notes from the
original documentation describe the known edges:

### KeY

* the parser has support for `merge_point` statements at the syntactic level
  (see above), but no dedicated support for information-flow contracts;
* unclear whether `x instanceof int` should be accepted;
* KeY puts no modifiers in contracts and allows modifiers in arbitrary
  positions; JMLtk follows JML in requiring modifiers before the return type.

### OpenJML

* `non_null_by_default` is accepted as a modifier (see
  [modifiers](#modifiers)), but openJML-style `static public datatype N {}`
  declarations are not;
* multi-line contracts written with single-line comments are handled leniently;
* contract modifiers should not be part of the contract:
  ```java
  //@ model public static void conversionBad(nullable String s, Object o) {
  //@   ghost string s4 = o; // error
  //@ }
  ```
* `//@ reachable;` and the `static_initializer` / `readonly` modifiers are not
  supported.

### Extensions beyond the JML reference

* **infix set operators**: `a \cup b \cap c` (see above);
* **relational chains**: `0 <= x <= a.length` (see above);
* **block / loop contracts** with behavior sections (KeY, see above);
* **heap on clauses**: heap quantifiers written on the clause:
  ```java
  requires<trans><h> true;
  ensures<h1><h2> true;
  ```
* the `determines` / `separates` family (extended clause kinds).

## Differences from upstream JavaParser

For maintainers, the structural changes vs. the upstream JavaParser grammar
(JMLtk is a fork):

* **No-body constructors** are allowed (KeY);
* **New statement node types** — `KeyMetaConstruct`,
  `KeyMethodCallStatement`, `KeyMethodBodyStatement`,
  `KeyTransactionStatement`, `KeyMergePointStatement`,
  `KeyLoopScopeBlock`, `KeyCatchAllStatement`, `KeyExecStatement` and their
  `KeyCcatch*` parts;
* **New primitive logic types** — `\bigint`, `\real`, `\locset`, `\seq`,
  `\free`, `\map`;
* **New types** — schema types and meta-types (see SchemaJava);
* **New modifiers** — `ghost`, `model`, `no_state`, `two_state`;
* **A lot of new tokens** (all the JML keywords above), each declared with its
  own lexer rule and classified in `TokenTypes#getCategory`.

See the [AST Classes](../ast-classes/) page for how all of this is reflected in
the node hierarchy, and the [Development](../../devel/) section for the grammar
itself (`javaparser-core/src/main/javacc/java.jj`).
