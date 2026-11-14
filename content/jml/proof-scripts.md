---
title: Proof Scripts
type: docs
weight: 90
---

A JML statement (`assert`, `assume`, `set`, `hence_by`, …) or a lemma can carry
a proof script after `\by`. The parser stores the script; the proof tool
interprets the commands.

**JML Reference:** proof scripts are a JMLtk extension and have no section in
the JML Reference Manual. The surrounding assertion statement is §11.1, printed
p. 146 —
[PDF p. 157](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=157).

## Grammar

```text
proof-block ::= "{" proof-stmt* "}" | proof-stmt

proof-stmt  ::= proof-case | proof-cmd

proof-cmd   ::= "obtain" Type ident
                  ( "=" expression
                  | "\such_that" expression
                  | "\from_goal" )
                  proof-suffix
              | "use_lemma" proof-arg* proof-suffix
              | SimpleName proof-arg* proof-suffix

proof-case  ::= ( "case" [ string-literal ] | "default" ) ":"
                 proof-cmd+

proof-suffix ::= ";" | "\by" proof-block

proof-arg   ::= [ label ":" ] expression
```

`obtain` and `use_lemma` are contextual keywords, not reserved words. The
`\from_goal` token is `FROM_GOAL`.

## Example

From
`javaparser-core-testing/src/test/java/com/github/javaparser/JmlProofScriptTest.java`:

```jml
//@ assert (\forall int x; x != mx; 2 * count(a, k + 1, x) <= k + 1 - mc)
//@   \by {
//@     oss;
//@     obtain int x \from_goal;
//@     expand on: "self.count(a, k_0 + 1, x)";
//@     macro "nosplit-prop";
//@     instantiate var: "x" with: x;
//@     auto classAxioms: false;
//@   };
```

Cases and the three `obtain` forms:

```jml
//@ assert true \by {
//@   case "a":
//@     expand on: "x";
//@   default: oss;
//@   case: auto;
//@ };

//@ assert true \by { obtain int x = foo(); };
//@ assert true \by { obtain int y \such_that y > 0; };
//@ assert true \by { obtain int z \from_goal; };
```

Lemmas use the same script language
(`jmlparser-jml-tests/src/test/resources/fullexamples/tested/Lemmas.java`):

```jml
//@ lemma L(int x) \by { auto; };
//@ lemma nospace(\seq s) \by { oss; use_lemma nospace(x); auto; };
```

## Semantics

- A proof script is a sequence of commands and cases; JMLtk does not interpret
  the commands.
- `obtain` introduces an auxiliary witness, either by value (`=`), by a
  satisfying predicate (`\such_that`), or from the current goal (`\from_goal`).
- `use_lemma Name(args)` invokes a lemma.
- A command may carry labeled arguments (`expand on: "x"`) and end with `;` or
  a nested `\by { ... }` block.
- `case "label":` / `default:` / `case:` select proof branches.

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlProofStmt` | `...ast.jml.proof` | abstract base for proof statements |
| `JmlProofCmdStmt` | `...ast.jml.proof` | command `name`, `args`, `suffix` |
| `JmlProofCaseStmt` | `...ast.jml.proof` | `label` (optional), `commands` |
| `JmlProofObtainStmt` | `...ast.jml.proof` | `type`, `var`, `kind` (`EQUAL`, `SUCH_THAT`, `FROM_GOAL`), `value`, `suffix` |
| `JmlProofArg` | `...ast.jml.proof` | optional `label`, `expr` |

`JmlExpressionStmt#getScript()` returns `Optional<NodeList<JmlProofStmt>>`;
`JmlLemmaDeclaration#getScript()` returns `NodeList<JmlProofStmt>`.

## See also

- [Statements](../statements/)
- [Body declarations](../body-declarations/)
- [Contracts](../contracts/)
