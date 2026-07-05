This pages explains the dialect of the Java Modeling Language (JML) accepted by *jmlparser*. 
Although there is [JML reference manual](https://www.cs.ucf.edu/~leavens/JML/jmlrefman/jmlrefman.html), JML is not standardized. 
Various syntactical dialects exists and also the semantics are not fixed and interpreted differently by the tools.  
We try to follow the syntax of the reference manual in the common parts, but also allow deviations to increase readability and intuitiveness.
Additionally, we focus on compatible with [OpenJML](https://github.com/OpenJML) and [KeY](https://key-project.org/).

Note that jmlparser does not provide any semantics. It is just a parsing library for JML which lifts textual contents into an Java/JML AST.
You, as the library user, are responsible for proper semantics. 

## Deviations 

### More liberal grammar 

As a parsing library, we want to cover various amount of JML constructs and dialects as possibles. For this, the grammar of jmlparser is often a super set of the JML reference. For example consider the grammar rule for quantified expressions:

```
spec-quantified-expr ::= ( quantifier quantified-var-decls ; [ [ predicate ] ; ] spec-expression )
quantifier ::= \forall | \exists | \max | \min | \num_of | \product | \sum
quantified-var-decls ::= [ bound-var-modifiers ] type-spec quantified-var-declarator
                         [ , quantified-var-declarator ] ...
```   

The JML reference only knows seven quantifiers, which can have arbitrary many bounded variables, and only one or two expressions. 
In jmlparser the rule is far more liberal. A quantified expression can have an arbitrary quantor and as many expression as possible:

```
spec-quantified-expr ::= "(" <JML_IDENT> quantified-var-decls ";" Expression (";" Expression)* ")"
```   
Therefore, this rule also covers, for example, the bounded sum with lower and upper bound `(\bsum int i; i>0; i <= n/2; 2*i)`
as used in the KeY.

You are responsible to raise an error, if you can not handle such constructs.

### `requires` non-split contracts

### KeY

* no support for `merge_points`
* no support for information flow
* unclear whether to support `x instanceof int`
* no modifiers in contracts
* modifier have to be before the return type. KeY is arbitrary.

### OpenJML

* `non_null_by_default` not supported
* `static public datatype N {}` not supported
* Multi-line contracts with a single-line comment
* Modifier should not be part of the contract
* ```
    //@ model public static void conversionBad4(nullable String s, Object o) {
    //@   ghost string s4 = o; // error
    //@}
  ```
* `//@ reachable;`
* Modifier `static_initializer` `readonly`
## Extensions to JML reference

### Infix operators

```
a \cup b \cap c
```

### Relational Chains

```
(\forall int x; 0<= x <= a.length; a[x]>0)
```

### Block and Loop contracts (KeY)
```java
/*@
 loop_contract normal_behvavior
 ensures true;
 requires true;
 assignable \strictly_nothing
 */ 
while(...) {

}
```

### Heap on contract clauses

```
requires<trans><h> true;
ensures<h1><h2> true;
``` 

### Named clauses?

