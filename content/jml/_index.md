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
- `//@ reachable;`, the `debug` and `nowarn` pragmas, and the
  `static_initializer` / `readonly` modifiers are not supported.
- Extensions beyond the reference include infix set operators, relational
  chains, block/loop contract behaviors, heap-on-clause annotations
  (`requires<trans><h> ...`), and the `determines` / `separates` family.

## Overview

{{< cards cols="2" >}}
  {{< card link="annotations-and-key-sets/" title="Annotations and key sets" icon="tag" subtitle="Comment forms, conditional annotations, `setJmlKeys`, `jmlTags`, JMLDoc" >}}
  {{< card link="contracts/" title="Contracts" icon="document-text" subtitle="Method, constructor, loop, block, and lambda contracts; clauses; `also`; nesting" >}}
  {{< card link="body-declarations/" title="Body declarations" icon="collection" subtitle="Invariants, `constraint`, `initially`, `axiom`, lemmas, `represents`, model/ghost members" >}}
  {{< card link="modifiers/" title="Modifiers" icon="adjustments" subtitle="JML modifiers and where they are legal" >}}
  {{< card link="expressions/" title="Expressions" icon="code" subtitle="Java/JML expressions, side-effect restrictions, operators, `\old`, `\result`, types" >}}
  {{< card link="quantifiers/" title="Quantifiers" icon="beaker" subtitle="`\forall`, `\exists`, `\sum`, `\product`, `\num_of`, element domains" >}}
  {{< card link="let-and-labels/" title="Let and labels" icon="bookmark" subtitle="`\let`, `\such_that`, `\lbl`" >}}
  {{< card link="statements/" title="Statements" icon="terminal" subtitle="`assert`, `assume`, `set`, ghost declarations, `refining`, `begin`/`end`, `unreachable`" >}}
  {{< card link="proof-scripts/" title="Proof scripts" icon="shield-check" subtitle="`\by` scripts, `obtain`, `use_lemma`, cases" >}}
  {{< card link="merge-point/" title="Merge points" icon="link" subtitle="`merge_point` (`\by`, `\lattice`, `\predicate`)" >}}
{{< /cards >}}

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

