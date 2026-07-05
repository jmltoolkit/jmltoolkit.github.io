## Structural Changes
## Syntax Changes for the KeY Changes

* Allow no-body on constructors
  ```java
  class String { public String(); }
  ```
  For method this is already covered by the grammar.

* New Statements
    * [`KeyMetaConstruct`](javaparser-core/src/main/java/com/github/javaparser/ast/key/sv/KeyMetaConstruct.java)
    * [`KeyMethodCallStatement`](javaparser-core/src/main/java/com/github/javaparser/ast/key/KeyMethodCallStatement.java)
    * [`KeyMethodBodyStatement`]()
    * [`KeyTransactionStatement`]()
    * [`KeyMergePointStatement`]()
    * [`KeyLoopScopeBlock`]()
    * [`KeyCatchAllStatement`]()
    * [`KeyExecStatement`]()
    * [`KeyMethodCallStatement`]()
* Primitive types
    * `\bigint`
    * `\real`
    * `\\locset`
    * `\seq`
    * `\free`
    * `\map`
* Types
    * Schema type
    * Meta-type
* Modifiers
    * ghost
    * model
    * no_state
    * two_state
* A lot of new tokens
