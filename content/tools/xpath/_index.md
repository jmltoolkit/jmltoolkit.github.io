---
title: "XPath"
weight: 120
---

# XPath

The `:tools:xpath` module exposes the JavaParser AST as an **XML document and
queries it with XPath 1.0**. This is the power tool for *ad-hoc* structural
queries — "every method with a `requires` clause", "all `this` accesses inside
loops" — expressed as standard XPath instead of visitor code.

## The mapping

JavaParser nodes become elements; the document root is a `project` element
wrapping one or more compilation units:

```text
project
└── compilationUnit [@package=..., @name=...]
    └── classOrInterfaceDeclaration [@name="Account"]
        └── methodDeclaration [@name="withdraw", @signature=..., ...]
            ├── parameter [@name="amount", @type="int"]
            ├── blockStmt ...
            └── jmlContract ...
```

* `JPDocument` implements the W3C `Document` interface (read-only; creation
  operations throw `DOMException.NOT_SUPPORTED_ERR`).
* `JPRootElement` is the `project` root built from a list of `CompilationUnit`s.
* `JPElement` wraps any single AST node; node properties (name, modifiers,
  type, begin/end line, …) are available as **attributes**, and pseudo
  attributes (via `PseudoAttributeProvider`) expose computed values such as
  `@name`, `@signature` or `@beginLine`.

## Usage

```kotlin
object XPathFacade {
    // serialize a compilation unit as indented XML
    @Throws(TransformerException::class)
    fun printXml(n: CompilationUnit): String

    // evaluate an XPath expression and print every matching AST node
    @Throws(XPathExpressionException::class)
    fun query(n: CompilationUnit, query: String?)
}
```

Because the document is backed by the live AST nodes, the *result set* of a
query contains the actual JavaParser nodes — `(res.item(i) as JPElement).astNode`
gives you the `Node` to keep working with:

```kotlin
XPathFacade.query(cu, "//methodDeclaration[@name='withdraw']")
```

Typical queries (standard XPath 1.0):

```text
//methodDeclaration[contains(@modifiers, 'static')]   static methods
//jmlContract                                         all contracts
//classOrInterfaceDeclaration[@name='Account']//fieldDeclaration
```

## CLI

```text
jmltk xpath "//methodDeclaration[@name='foo']" File.java
```

The `xpath` subcommand is registered in the CLI (help: "Evaluate XPath queries
on a set of Java/JML files") but its `run()` is not yet implemented — use
`XPathFacade.query` programmatically in the meantime.
