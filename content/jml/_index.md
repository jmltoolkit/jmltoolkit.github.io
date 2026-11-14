---
title: JML
weight: 25
---

JMLtk parses Java plus the Java Modeling Language (JML). This section documents
**JML only**. KeY/ProofJava/SchemaJava and Meta-Java constructs are documented
in the [Meta-Java](../key/) section.

## JML in JMLtk

- JML is written in comments: `//@ ...` and `/*@ ... @*/`.
- The parser lifts JML into the AST only when JML processing is enabled:
  `new ParserConfiguration().setProcessJml(true)`.
- JMLtk is intentionally liberal: it accepts a superset of the JML Reference
  Manual and leaves the semantics to the tool that consumes the AST.
- The parser does **not** verify or execute specifications.

## Dialect notes

JMLtk follows the JML Reference Manual in the common parts, but it is a liberal
parser:

- `non_null_by_default` is accepted; OpenJML-style `static public datatype`
  declarations are not.
- Multi-line contracts written with single-line comments are handled leniently.
- A visibility keyword before a behavior is stored on `JmlContract#getModifiers()`,
  not as a clause; declaration modifiers inside a contract (OpenJML-style
  `model public static void ...`) are not part of the contract either.
- `//@ reachable;` and the `static_initializer` / `readonly` modifiers are not
  supported.
- Extensions beyond the reference include infix set operators, relational
  chains, block/loop contract behaviors, heap-on-clause annotations
  (`requires<trans><h> ...`), and the `determines` / `separates` family.

## Reading order

| Page | What it covers |
| ---- | -------------- |
| [Annotations and key sets](annotations-and-key-sets/) | Comment forms, conditional annotations, `setJmlKeys`, `jmlTags`, JMLDoc |
| [Contracts](contracts/) | Method, constructor, loop, block, and lambda contracts; clauses; `also`; nesting |
| [Body declarations](body-declarations/) | Invariants, `constraint`, `initially`, `axiom`, lemmas, `represents`, model/ghost members |
| [Modifiers](modifiers/) | JML modifiers and where they are legal |
| [Expressions](expressions/) | Java/JML expressions, side-effect restrictions, operators, `\old`, `\result`, types |
| [Quantifiers](quantifiers/) | `\forall`, `\exists`, `\sum`, `\product`, `\num_of`, element domains |
| [Let and labels](let-and-labels/) | `\let`, `\such_that`, `\lbl` |
| [Statements](statements/) | `assert`, `assume`, `set`, ghost declarations, `refining`, `begin`/`end`, `unreachable` |
| [Proof scripts](proof-scripts/) | `\by` scripts, `obtain`, `use_lemma`, cases |
| [Merge points](merge-point/) | `merge_point` (`\by`, `\lattice`, `\predicate`) |

## AST conventions

JML nodes live in `com.github.javaparser.ast.jml.*` and use the `Jml` prefix:
`clauses`, `body`, `expr`, `proof`, `stmt`, `type`, and `doc`. Each construct
page lists the classes and properties. The parser's AST classes are generated
from the grammar, so never edit them by hand; see the parser repository's
`javaparser-core/AGENTS.md` for the AST change workflow.

## JML Reference Manual

The [JML Reference Manual](https://www.openjml.org/documentation/JML_Reference_Manual.pdf)
is the normative reference. JMLtk follows it in the common parts and accepts
additional forms where the construct pages say so.

A local copy is available as
[JML_Reference_Manual.pdf](JML_Reference_Manual.pdf). The maintainer page map
(construct → manual section → PDF page) is `JML_REFERENCE.txt`; it is not part
of the site navigation.
