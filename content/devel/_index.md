---
title: Development
weight: 100
---

The project is built with **Gradle** — the root project is `jmlparser-parent`
and everything is driven with the wrapper, so no global Gradle installation is
needed:

```
./gradlew build
```

## Common tasks

| Task | Command |
| ---- | ------- |
| Compile the sources | `./gradlew compileJava` |
| Run all tests | `./gradlew test` |
| Run one test class | `./gradlew test --tests "com.github.javaparser.ast.stmt.ForStmtTest"` |
| Test one module | `./gradlew :jmlparser-core:test` |
| Auto-format the code | `./gradlew spotlessApply` |
| Verify formatting (CI) | `./gradlew spotlessCheck` |
| Checkstyle | `./gradlew checkstyleMain` |
| Regenerate the generated sources | `./scripts/run-generators.sh` |
| Regenerate the parser from the grammar | `./gradlew :jmlparser-core:compileJavacc` |

## Modules

The two core libraries are `:jmlparser-core` and
`:jmlparser-symbol-solver-core` (the directories `javaparser-core` /
`javaparser-symbol-solver-core`). The packaged jars for a module are written to
that module's `build/libs/` directory, e.g.
`javaparser-core/build/libs/jmlparser-core-<version>.jar`.

Beside them the build defines:

* **test suites** — `:jmlparser-core-testing`, `:jmlparser-core-testing-bdd`,
  `:jmlparser-symbol-solver-testing`, `:jmlparser-key-testing`,
  `:jmlparser-jml-tests`;
* **code generators** — `:jmlparser-core-metamodel-generator`,
  `:jmlparser-core-generators`, `:jmlparser-core-serialization`;
* **tools** — the modules under `:tools` (`cli`, `lint`, `lsp`, `smt`, `stat`,
  `vcg`, `wd`, `web`, `xpath`, `redux`, `jml2java`, `jmlstub`,
  `prettyprinting`, `utils`, …).

## Generated sources

If you modify the AST nodes — add or remove fields or node classes — the code
generators update a lot of code for you. The metamodel generator rebuilds the
metamodel, which the core generators consume; make sure `:jmlparser-core` at
least compiles before running them:

```
./scripts/run-generators.sh
```

`run-generators.sh` runs the metamodel and core generators followed by
`spotlessApply`, and finishes with `git diff --exit-code`, so a missing
regeneration fails CI. Changes to the grammar
(`javaparser-core/src/main/javacc/java.jj`) need the parser regenerated:

```
./gradlew :jmlparser-core:compileJavacc
```

Never hand-edit the generated output (visitors, metamodel, pretty printer,
`JavaToken` kinds): change the sources, then regenerate.

## Versioning

The project version is `version=` in `gradle.properties` (fork-local SemVer,
kept `-SNAPSHOT` between releases); the embedded upstream JavaParser release is
tracked via `upstreamBase=`. Cut releases following the workflow in the
repository's `CONTRIBUTING.md`.
