---
title: Getting Started
type: docs
weight: 1
---


## Setup

The project binaries are available in Maven Central.

We strongly advise users to adopt Maven, Gradle or another build system for their projects.
If you are not familiar with them we suggest taking a look at the maven quickstart projects
([javaparser-maven-sample](https://github.com/javaparser/javaparser-maven-sample),
[javasymbolsolver-maven-sample](https://github.com/javaparser/javasymbolsolver-maven-sample)).

Just add the following to your maven configuration or tailor to your own dependency management system.

**Maven**:

```xml
<dependency>
    <groupId>org.key-project.proofjava</groupId>
    <artifactId>javaparser-symbol-solver-core</artifactId>
    <version>3.28.0-J8.0-K13.5</version>
</dependency>
```

**Gradle**:

```
implementation 'com.github.javaparser:javaparser-symbol-solver-core:3.28.0-J8.0-K13.5'
```

Since Version 3.5.10, the JavaParser project includes the JavaSymbolSolver.
While JavaParser generates an Abstract Syntax Tree, JavaSymbolSolver analyzes that AST and is able to find
the relation between an element and its declaration (e.g. for a variable name it could be a parameter of a method, providing information about its type, position in the AST, ect).

Using the dependency above will add both JavaParser and JavaSymbolSolver to your project. If you only need the core functionality of parsing Java source code in order to traverse and manipulate the generated AST, you can reduce your projects boilerplate by only including JavaParser to your project:

**Maven**:

```xml
<dependency>
    <groupId>org.key-project.proofjava</groupId>
    <artifactId>javaparser-core</artifactId>
    <version>3.28.0-J8.0-K13.5</version>
</dependency>
```

**Gradle**:

```
implementation 'com.github.javaparser:javaparser-core:3.28.0-J8.0-K13.5'
```



The quick and the full API of JavaParser
Mar 3, 2018

The quick and the full API of JavaParser
Lost in a dark corner of the JavaParser site is the idea behind the two API’s of JavaParser. Here’s an attempt to put it back into the light :-) The API I discuss here is literally the API from the JavaParser and StaticJavaParser classes.

Quick!
This API was built to make common use cases as painless as possible. In the end, this API is a collection of shortcuts to the full API.

    import static com.github.javaparser.StaticJavaParser.*;
    // ...
    CompilationUnit cu = parse("class X{}");
The quick API consists of all the static methods on the StaticJavaParser class.
All these methods throw an unchecked ParseProblemException if anything goes wrong. This exception contains a list of the problem(s) encountered.
The static methods called parse and parseResource offer various ways of reading Java code for parsing. They all expect a full Java file. So, even though the example parses a String, you could pass an InputStream, a File or various other inputs.
The remaining static methods parse a fragment of source code in a String. Here is one that parses just an expression:
Expression e = parseExpression("1+1");
parseJavadoc is a special case. Comments normally remaing unparsed, including Javadoc comments. This method is a separate parser for a JavadocComment node.
Changing configuration is done by modifying the staticConfiguration field.
StaticJavaParser.getConfiguration().setAttributeComments(false);
Full!
This API was built to give access to all flexibility there is, and to provide a little more performance.

    import static com.github.javaparser.ParseStart.*;
    import static com.github.javaparser.Providers.provider;
    ...
    JavaParser javaParser = new JavaParser();
    ParseResult result = javaParser.parse(COMPILATION_UNIT, provider("class X{}"));
    result.ifSuccessful(cu ->
        // use cu        
    );
or, thanks to the fake builder pattern:

    import static com.github.javaparser.ParseStart.*;
    import static com.github.javaparser.Providers.provider;
    ...
    new JavaParser().parse(COMPILATION_UNIT, provider("class X{}")).ifSuccessful(cu ->
            System.out.println(cu)        
    );
The full API consists of the JavaParser constructors, and the whole suite of parse methods, with one extra - the one that does the actual parsing work.
Never does it throw an exception. ParseResult can tell you if parsing went fine, and if not what problems were encountered.
Reusing the JavaParser instance will give a small speed boost.
A JavaParser instance is not thread safe!
The first parameters for the extra parse method indicates what kind of source you will be passing. Normally it’s a compilation unit, but you can parse expressions, names, etc.
The second parameter for the extra parse method provides the source code. A Provider is an abstraction over any kind of input.
The full API lets you combine these parameters however you like.
Parsing Javadoc is an exception again. You need the JavadocParser for that.
Configuration can be passed in the constructor.
    ParserConfiguration configuration = new ParserConfiguration();
    JavaParser parser = new JavaParser(configuration);
    ParseResult parseResult = parser.parse(EXPRESSION, provider("1+1"));
    if (!parseResult.isSuccessful()) {
        System.out.println(parseResult.getProblems().toString());
    }
    // a failed parse does not always mean there is no result.
    parseResult.getResult().ifPresent(System.out::println);
    if (parseResult.getCommentsCollection().isPresent()) {
        // ...
    }
