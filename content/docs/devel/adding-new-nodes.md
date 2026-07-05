
# Development of JML Parser

## How To Compile Sources

If you checked out the project from GitHub you can build the project with maven using:

```
mvn clean install
```

If you checkout the sources and want to view the project in an IDE, it is best to first generate some of the source files; otherwise you will get many compilation complaints in the IDE. (mvn clean install already does this for you.)

```
mvn javacc:javacc
```

## Extending the AST

If you modify the code of the AST nodes, specifically if you add or remove fields or node classes,
the code generators will update a lot of code for you.
The `run_metamodel_generator.sh` script will rebuild the metamodel,
which is used by the code generators which are run by `run_core_generators.sh`
Make sure that `javaparser-core` at least compiles before you run these.

**Note**: for Eclipse IDE follow the steps described in the wiki: https://github.com/javaparser/javaparser/wiki/Eclipse-Project-Setup-Guide



# A Detailed Guide to Adding New Nodes
An example of this can be found at https://github.com/javaparser/javaparser/pull/4432 where the commits starting at `Add RecordPatternExpr outline` show the results of the steps described below. The `Rename X` steps prior to that are there because this PR was part of changing the name of the existing `PatternExpr` node, but won't be relevant for adding any new nodes.

## Step 1: Add the node outline
Add a skeleton for the new node, with stubs for inherited interface/abstract class methods that have to be implemented, along with a constructor with the `@AllFieldsConstructor` annotation. As the annotation suggests, this constructor should have parameters for all the fields of the class.

There are some field annotations that affect code generation. In particular, `@DerivedProperty` and `@OptionalProperty` could be useful. For a better explanation of these, see the documentation.

## Step 2: Add the new class to the MetaModelGenerator
In `MetaModelGenerator.java`, there is an `ALL_NODE_CLASSES` list to which the new class must be added. Note that the new class must be added after any parent classes (for example, `RecordPatternExpr` must be added after `PatternExpr` which, in turn, must be added after `Expression`).

## Step 3: Run the core metamodel generator
From the project root, run `./run_core_metamodel_generator.sh`. 

Looking at the git diff at this point will show many changed files due to formatting changes, but ignore these for now.


## Step 4: Run the core generators
From the project root, run `./run_core_generators.sh`. 
 
This will most likely fail due to compilation errors caused by missing visit methods in the PrettyPrintVisitor and DefaultPrettyPrinterVisitor.

## Step 5: Fix PrettyPrinting compilation errors
For this step, `visit` methods for the new node type need to be added to both the `DefaultPrettyPrinterVisitor` and the `PrettyPrintVisitor`. These can either be the final implementations, or just stubs to fix compilation errors for now.

## Step 6: Re-run the core generators
This time, the generators should run successfully. If not, keep fixing compilation errors and re-running the generators until they run successfully.

## Step 7: Clean up generator output
At the time of writing, this step is rather cumbersome. The core generators use JavaParser to output new source files with generated code, but this comes with many formatting changes, even for files without "new" generated changes. It is therefore necessary to go through the files and search for relevant changes.

The best way I've found to do this is:
1. `git diff` and then do a case-insensitive search through the diff for words that could be relevant. This would include the name of the new node class, as well as the names of all the fields in the class.
2. `git add` all files discovered above and `git commit` (or `git commit --amend` when coming back to this step)
3. `git stash` all uncommitted changes
4. `./mvnw clean compile` JavaParser
5. If the compile succeeded, you're done! GOTO end
6. If the compile failed, take a note of what was missing
7. `git stash pop` to get back the previously stashed changes
8. GOTO 1, adding what was missing and caused the failure

## Step 8: Add a placeholder for the new node in `ConcreteSyntaxModel.java`
This means adding a line like `concreteSyntaxModelByClass.put(NewNodeClassName.class, sequence())`

This step is technically optional, but without this a lot of unit tests for unrelated components will fail due to concrete syntax model verification failing. Doing this step makes it easier to verify that smaller changes are working as expected without having to implement the concrete syntax model for the new class first.

## Step 9: Add AST tests for the new node
Add some tests to `javaparser-core-testing/src/test/java/com/github/javaparser/ast/...` that describe what the AST for the new node should look like. This will help verify that the grammar changes in the next step work, although at this point these tests will still fail. There are many existing tests to look at for examples of how this is done.

## Step 10: Add parser support by adding rules to `java.jj`
This grammar is used to generate the `GeneratedJavaParser` class used for all the parsing. It is necessary to do the above steps first since instantiating the new class would lead to compilation errors if it does not exist yet. This guide won't go into detail about how the grammar productions work, but looking at how rules for other classes is useful, along with reading javacc documentation. In particular, understanding how `LOOKAHEAD` works can help avoid some sneaky bugs later. See https://stackoverflow.com/questions/61385623/different-ways-to-declare-lookahead-in-javacc as an example.

Once all the rules are added, run `./mvnw clean javacc:javacc` and verify that the command succeeded. In particular, look for `Warning: Choice conflict in ...` message. This suggests that a `LOOKAHEAD` is required to disambiguate the grammar. Note that the absence of such a message does not mean that the lookaheads that are in place are correct. It is still possible for the parser to make an incorrect decision at these decision points if a lookahead is wrong, but this won't display a warning.

Run the tests from step 9 and, if they succeed, proceed to the next step.

## Step 11: Add symbol solver tests and support for the new node
The details of this step depend a lot on the specific node type being added, so not much can be said here that's generally useful. The best advice I can give is to look at tests for similar nodes in `javaparser-symbol-solver-testing` and to use those as a guide for what to test for the new node. Once tests are in place, finding out where changes are needed in the symbol solver can take some work, but looking at what's done for other nodes could again be useful.

## Step 12: Add PrettyPrinter support
Add some pretty printer tests to `javaparser-core-testing/src/test/java/com/github/javaparser/printer/PrettyPrinterTest.java` and, if it wasn't done in step 5, add the final implementation for the `PrettyPrintVisitor` and `DefaultPrettyPrinterVisitor`. `PrettyPrintVisitor` is deprecated, but using the same implementation for both is simple.

## Step 13: Add concrete syntax model support and `LexicalPreservingPrinter` tests
Start by adding some `LexicalPreservingPrinter` tests to `javaparser-core-testing/src/test/java/com/github/javaparser/printer/lexicalpreservation/transformations/ast/body/StatementTransformationsTest.java`. There are many examples in that file of how to implement this.

Then, go back to the stub added in step 8 and expand on it. The general structure should be similar to the grammar added in `java.jj`, but for details see how this was implemented for similar nodes. 

## Step 14: Add validators with tests
Validator tests are in `javaparser-core-testing/src/test/java/com/github/javaparser/ast/validator/JavaXValidatorTest.java`.

For adding the validators themselves, add a negative validator to `javaparser-core/src/main/java/com/github/javaparser/ast/validator/language_level_validations/Java1_0Validator.java` (that is, a validator that checks that the new node type is NOT being used) and then remove that condition in the validator for the relevant java version.

## Step 15: Final checks before PR
As a last verification step, run `./mvnw clean test` again, along with `./mvnw checkstyle:check`. If both of these run successfully, then the change is ready for review!

# A Guide to Adding Fields to Existing Nodes
The process for this is mostly the same as above, except for simplifying some steps.

## Step 1: Add field to the node
As with adding a node, but in this case add only the field and add that to the `@AllFieldsConstructor`

## Steps 4-6: Run core generators
In this case, the pretty printer will already have support for the existing node. The new field may require some changes, but that is handled in step 12. For now, running the core generators once should be sufficient.

## Step 8: ConcreteSyntaxModel placeholder
No placeholder should be necessary since the node exists already. Proper support for the new field can be added later in step 13

## Steps 9-15: The rest
All of these should be the same as for adding new nodes, except with less work involved.
