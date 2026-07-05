---
title: JMLtk -- JML Toolkit
toc: false
---

[![Maven Central](https://img.shields.io/maven-central/v/com.github.javaparser/javaparser-core.svg)](http://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.github.javaparser%22%20AND%20a%3A%22javaparser-core%22)
[![Build Status](https://travis-ci.org/javaparser/javaparser.svg?branch=master)](https://travis-ci.org/javaparser/javaparser)
[![Coverage Status](https://codecov.io/gh/javaparser/javaparser/branch/master/graphs/badge.svg?branch=master)](https://app.codecov.io/gh/javaparser/javaparser?branch=master)
[![License LGPL-3/Apache-2.0](https://img.shields.io/badge/license-LGPL--3%2FApache--2.0-blue.svg)](LICENSE)

This project provides a library for the parsing of Java with the Java
Modelling Language (JML). JML is a formal specification for Java to
describe the functional behavior, e.g., pre- and post-conditions of
methods, class and loop invariants.

The bases of this project is the [Java
Parser](https://github.com/javaparser/javaparser) project, which is
extended in the following ways:

* lexer and grammar rules for JML

* new AST classes for representing JML extension to Java expressions,
  contracts, clauses, JML statements, JML body declarations etc.

* new attributes for contract carrying Java statements and entities
  (loop statements, block statements, constructors and methods)

* extension of the name resolution

You can find the extension of the AST very easily, they are marked
with the interface `Jmlish` and are also inside
`com.github.javaparser.ast.jml` package.


## Explore

{{< cards >}}
  {{< card link="docs/devel" title="Getting Started" icon="book-open" >}}
  {{< card link="docs/tools" title="Tools" icon="cog" >}}
  {{< card link="docs/tools" title="Development" icon="code" >}}
{{< /cards >}}



## Documentation

For more information, visit [Hextra](https://imfing.github.io/hextra).
