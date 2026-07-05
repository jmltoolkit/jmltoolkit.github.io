---
title: Development
weight: 100
---




## How To Compile Sources

If you checked out the project's source code from GitHub, you can build the project with maven using:
```
mvnw clean install
```

If you want to generate the packaged jar files from the source files, you run the following maven command:
```
mvnw package
```

**NOTE** the jar files for the two modules can be found in:
- `javaparser/javaparser-core/target/javaparser-core-\<version\>.jar`
- `javaparser-symbol-solver-core/target/javaparser-symbol-solver-core-\<version\>.jar`

## Development

If you modify the code of the AST nodes, specifically if you add or remove fields or node classes,
the code generators will update a lot of code for you.
The `run_metamodel_generator.sh` script will rebuild the metamodel,
which is used by the code generators which are run by `run_core_generators.sh`
Make sure that `javaparser-core` at least compiles before you run these.

**Note**: for Eclipse IDE follow the steps described in the [wiki](https://github.com/javaparser/javaparser/wiki/Eclipse-Project-Setup-Guide).

