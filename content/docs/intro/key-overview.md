---
title: KeY's Extension to Java
weight: 1000
---

The [KeY theorem prover](https://key-project.org) requires some special Java syntax constructs, that do not appear on regular Java code. 
Traditionally, we distinguish between (a) *ProofJava* and (b) *SchemaJava*. ProofJava contains contructs that contains additionally information during a proof in KeY's sequent calculus on JavaDL. SchemaJava brings placeholder in the AST, e.g., schema variable `#x`, that allow to write tree matching algorithms. (Currently (*2026*), jmltk has no built-in matching, ask your favourite Agent to write it.)

Here we are only describing the differences on top of *JmlJava*.

## Proof Java

### Statements 
  
#### Method Frames

Method are used to store information about the context of Java blocks, that is possible lost on method inlineing and similar actions. 

```java
methodFrame ( [ result-> <name> ,] 
               source = <method-signature>@<type> 
               [, this = <expr>] ) : 
    <block>
```

ASTNode: [MethodCallStatement]

### Method Calls with target type

```java
<expr> @ <type>;
<name> = <expr> @ <type>;
```

AstNode [MethodBodyStatement]

### Java Card Transaction markers

* `#beginJavaCardTransaction ;`
* `#commitJavaCardTransaction ;`
* `#finishJavaCardTransaction ;`
* `#abortJavaCardTransaction ;`

ASTNode: [TransactionStatement]

### MergePointStatement

```java
merge_point ( <expr> );
```

### Loop Scope

```
loop-scope ( <expr> ) <block>
```

AstNode: [KeyLoopScope].

### CatchAllStatement

### ExecStatement

```
exec <block>
[ ccatch ( \Return ) <block> ]
(ccatch( \Return <type> <id> ))*
[ ccatch( \\Break ) <block>]
(  ccatch (  "\\Break" <id> ) <block> )*
[ ccatch ( \Break * ) <block> ]
[ ccatch ( \Continue ) <block> ]
( ccatch ( \Continue name ) <block> )*
[ ccatch ( \Continue * ) <block> ]
( ccatch ( <parameter> )<block>
```

### Expressions


### Passive Expression

`@ ( <expr> )`

I do not know.


### Implicit Identifiers 

KeY uses a third identifier kind, the implicit identifiers. These are
Java identifiers enclosed by angular brackets `<...>`.

!!! note weigl   
   We should change this into something unambigous. Normally,
   synthetic fields or classes uses the dollar sign `$`.


## Schema Java

The second extension is *Schema Java* (SJava) for the specification of
patterns. SJava has new construct, which are translated into
placeholder AST, also known as Schemavariables (SV). Beside of these
placeholder, where are some meta-construct for the term rewriting.

In particular, the extension has following 


### Schema Variables

Schema variables are the new main feature of SJava. A schema variable
is a regular Java identifier but it start with an hash `#`, e.g.,
`#se`, `#a`, `#averlongvariable123`. A schema variable is not allowed
to start with a number, e.g., `#1`, `#2a`.

A schema variable can occur at every position where a normal
identifier can occur. In some cases it has a refined meaning:

* `#a + #b`
* `(#T) (#b - #q)`
* `class #NAME { }`
* `#var + 2 - obj.abc()`
* `#obj.#field1.#field2.#method(#arg1, #arg2);`

Schema variables also be combined with the constructs of PJava.

Refined meaning occurs when a schema identifier occurs in certain
spots, i.e., as a *type*, as a *statement*, ...

### Contextual Block Statement (Start Block)

A block with context information

* ` { . <method-signature>@<type>(<expr>)  .. <statements>  ... }`
* ` { . <exec>  .. <statements>  ... }`
* ` { .. <statements>  ... }`
* ` { <statements> }`

### StaticEvaluate

* `#evaluate(<expr>)`

### IsStaticMC

### MetaConstructStatement

* `#unwind-loop( <label> , <label>, <loopStatement>);`
* `#unwind-loop-bounded(<label>, <label>, <loopStatement>);`
* `#FORINITUNFOLDTRANSFORMER(ForInit);`
* `#LOOPSCOPEINVARIANTTRANSFORMER(<whileStatement>);`
* `#unpack(<forStatement>);`
* `#for-to-while(<label>, <label>, <statement>);`
* `#switchof(<statement>)`
* `#do-break(<labeledStatement>);`
* `#evaluate-arguments(<expression);`
* `#replace(<statement>, <variable>);`
* `#method-call([<variable>,] [<variable>,], <primaryExpression>);`
* `#expand-method-body(<statement>[, <variable>]);`
* `#constructor-call(<variable>, <variable>);`
* `#special-constructor-call(<variable>);`
* `"#post-work" ( consRef = ExpressionSV() ) ";"`
* `"#static-initialisation" ( activeAccess = PrimaryExpression() ) ";"`
* `"#resolve-multiple-var-decl" ( stat = Statement() ) ";"`
* `"#array-post-declaration" ( stat = Statement() ) ";"`
* `"#init-array-creation" ( sv = VariableSV() "," consRef = ExpressionSV() ) ";"`
* `"#init-array-creation-transient" ( sv = VariableSV() "," consRef = ExpressionSV() ) ";"`
* `"#init-array-assignments" ( sv = VariableSV() "," consRef = ExpressionSV() ) ";"`
* `"#enhancedfor-elim" ( loopStat=ForStatement() ) ";"`
* `<REATTACHLOOPINVARIANT> ( loopStat = WhileStatement() ) ";"`

### Schema Statement

### Schema Type

* `<schemaId>`
* `#typeof(<expr>)`