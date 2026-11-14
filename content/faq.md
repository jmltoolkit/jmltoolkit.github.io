---
title: FAQ
toc: true
---

### What does the strange version means?

```
Version: 3.28.1-J8.0-K13.6-SNAPSHOT 
```

* `3.28.1` represents the version of the [JavaParser](https://github.com/javaparser/javaparser) project, which was merged into this branch
* `J8.0` determines the version counter for Java Modeling Language versions
* `K13.6` is the version for the KeY extensions.

In newer versions we changed to SemVer standard starting at 1.0.0.

### How does this JmlParser diverged from JavaParser? 

* **New:**
  * New `groupId` and `artefactId`
  * Switch to Gradle as the build
  * Conservative extensions towards the AST hierarchies (noticeable by prefix `Jml` or `Key`).
  * Fix for [JavaParser#4969](https://github.com/javaparser/javaparser/issues/4969)
  * Fix for visibility evaluation in resolution of interface methods, [PR #92](https://github.com/jmltoolkit/jmltk/pull/92)
  * Infrastructure: no codecov (Github instead), other CI workflow. 
* **Preserved:**
  * Folder structure
  * Most part of the AST hierarchy and parser
