---
title: Contracts
type: docs
weight: 20
---

A JML contract groups clauses under a *behavioral keyword* and describes the
allowed states and effects of a callable, loop, block, or lambda.

**JML Reference:** §8 *JML Method specifications*, printed p. 107 —
[PDF p. 118](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=118).
Behaviors and nesting: §8.1.1–8.1.2, printed p. 109–110 —
[PDF p. 120](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=120).
Clauses: §8.5–8.6, printed p. 115–128 —
[PDF p. 126](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=126).
Loop contracts: §11.10, printed p. 152 —
[PDF p. 163](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=163).
Block contracts: §11.11, printed p. 155 —
[PDF p. 166](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=166).
Lambda contracts: §14, printed p. 203 —
[PDF p. 214](https://www.openjml.org/documentation/JML_Reference_Manual.pdf#page=214).

## General structure

```text
contract      ::= [ visibility ] [ behavior ] [ name ":" ] clause+
                  ( "also" contract )*
                  [ "{|" contract+ "|}" ]

behavior      ::= behavior | normal_behavior | exceptional_behavior
                | abrupt_behavior | break_behavior | continue_behavior
                | return_behavior | feasible_behavior | model_behavior

visibility    ::= public | private | package | protected
```

- **Behavior** selects the normal/exceptional/abrupt/return/model case. A
  contract without a behavioral keyword is a plain `behavior`.
- **Name** gives the behavior a name (`normal_behavior positive: ...`). The name
  is stored on `JmlContract#getName()`.
- **`also`** joins several behavior cases into one specification.
- **Nested contracts** use `{| ... |}` and are stored in
  `JmlContract#getSubContracts()`.

## Where contracts can appear

`NodeWithContracts` is implemented by the nodes that can carry a JML contract:

| Node | Kind of contract |
| ---- | ---------------- |
| `MethodDeclaration`, `ConstructorDeclaration`, `CompactConstructorDeclaration` | method/constructor contract |
| `WhileStmt`, `DoStmt`, `ForStmt`, `ForEachStmt` | loop contract (`loop_invariant`, `maintaining`, `decreases`, …) |
| `BlockStmt` | block contract (`requires`/`ensures`/`returns`/`signals`/…) |
| `LambdaExpr` | lambda contract |
| `JmlModelProgram` | model-program contract |

Refining contracts are parsed by the `JmlRefiningContract` grammar production;
they are not a separate node implementing `NodeWithContracts`.

The parser attaches a contract to the next node that implements
`NodeWithContracts`. `JmlContract` carries a `ContractType` (`METHOD`, `LOOP`,
`LOOP_INV`, `BLOCK`, `STATEMENT`, `LAMBDA`); the generic grammar production
creates contracts with the default `METHOD` type, and validators/consumers can
classify them by attachment.

## Clauses

The clause kind is an enum, `JmlClauseKind`. The main families are:

| Family | Clauses |
| ------ | ------- |
| Pre/post | `requires`, `requires_free`, `requires_redundantly`, `ensures`, `ensures_free`, `ensures_redundantly`, `pre`, `pre_redundantly`, `post`, `post_redundantly`, `old`, `forall` |
| Frame | `assignable`, `assignable_redundantly`, `modifiable`, `modifiable_redundantly`, `modifies`, `modifies_redundantly`, `accessible`, `captures`, `captures_redundantly`, `working_space`, `working_space_redundantly`, `duration`, `duration_redundantly` |
| Exceptional | `signals`, `signals_redundantly`, `signals_only` |
| Concurrency / calls | `when`, `callable`, `callable_redundantly`, `diverges`, `diverges_redundantly` |
| Loop / block | `loop_invariant`, `loop_invariant_free`, `loop_invariant_redundantly`, `maintaining`, `maintaining_redundantly`, `decreases`, `decreases_redundantly`, `decreasing`, `measured_by`, `returns`, `returns_redundantly`, `breaks`, `breaks_redundantly`, `continues`, `continues_redundantly` |
| Termination / determinism | `determines`, `loop_determines`, `separates`, `loop_separates` |

`_free` clauses must hold independently of the rest of the contract;
`_redundantly` clauses may restate consequences of other clauses. `invariant`,
`constraint`, `initially`, and `axiom` are **body declarations**, not contract
clauses — see [Body declarations](../body-declarations/).

## Heap specifiers

Frame clauses and `accessible` may restrict a clause to one or more heaps.
A specifier is a simple name in angle brackets, written directly after the
clause keyword; several specifiers may follow each other:

```jml
/*@ normal_behavior
  @ assignable<heap><savedHeap> bArray[bOffset..bOffset+length-1];
  @ accessible<heap> \nothing;
  @*/
void arrayFillNonAtomic(byte[] bArray, int bOffset, int length) { ... }
```

`<heap>` and `<savedHeap>` are the heap names used by KeY's JavaCard
specifications; any simple name is accepted.
All specifiers are kept in the AST, not just the last one:

| Node | Accessor |
| ---- | -------- |
| `JmlMultiExprClause` (`assignable`, `modifiable`, `modifies`, `accessible`) | `getHeaps()` |
| `JmlSimpleExprClause` (`requires`, `ensures`, `loop_invariant`, …) | `getHeaps()` |
| `JmlClassAccessibleDeclaration` (class-level `accessible x : locs;`) | `getHeaps()` |

For `assignable<heap><savedHeap> bArray[...]` the heap list is
`["heap", "savedHeap"]`.
KeY uses the list to build the method frame for both heaps.
Previously the parser kept only the last specifier (`savedHeap` above), so KeY
found no frame entry for the base heap and widened the frame to `\everything`.
See PR #102 and `MultiHeapClauseTest` in `jmlparser-jml-tests`.

## Method and constructor contracts

```jml
/*@ normal_behavior
  @ requires A != null;
  @ ensures !\result ==> (\forall int i; 0 <= i < A.length; A[i] == \old(A[i]));
  @ assignable A[*];
  @*/
public static boolean next(int[] A) { ... }
```

From `jmlparser-jml-tests/src/test/resources/fullexamples/tested/Permut.java`.

## Loop contracts

A loop contract is either the classic `loop_invariant`/`decreases` form or a
`loop_contract` with a full behavior section:

```jml
/*@ loop_contract normal_behavior
  @ requires arr != null && 0 <= i && i <= arr.length;
  @ ensures  (\forall int j; \before(i) <= j && j < arr.length;
  @            arr[j] == \before(arr[j]) + 1);
  @ assignable arr[i .. arr.length];
  @ decreases arr.length - i;
  @*/
while (i < arr.length) { ... }
```

From
`jmlparser-jml-tests/src/test/resources/fullexamples/key/heap/block_loop_contracts/Simple/src/LoopContractExamples.java`.
The classic form (`loop_invariant ...; decreases ...;`) is also accepted.

## Block contracts

A block contract is written directly before a `{ ... }` block:

```jml
/*@ requires numbers != null;
  @ ensures 0 <= from && from < numbers.length;
  @ returns \result == 0;
  @ signals_only \nothing;
  @ assignable \nothing;
  @*/
{
    if (from < 0) { from = 0; }
}
```

From
`jmlparser-jml-tests/src/test/resources/fullexamples/key/heap/block_loop_contracts/Simple/src/BlockContractExamples.java`.

## Lambda contracts

A contract may precede a lambda expression:

```jml
Calculator c = /*@ ensures \result >= 0; @*/ (int x) -> x * 2;
```

From `jmlparser-jml-tests/src/test/java/com/github/jml/parser/JmlLambdaExprTests.kt`.
The contract is stored on `LambdaExpr#getContracts()`.

## Named contracts, `also`, and nesting

```jml
/*@ normal_behavior positive:
  @   requires x > 0;
  @   ensures \result == x;
  @ also
  @ normal_behavior zero:
  @   requires x == 0;
  @   ensures \result == 0;
  @ {| normal_behavior nested:
  @      requires x < 0;
  @      ensures \result == -x;
  @ |}
  @*/
```

## AST classes

| Class | Package | Notes |
| ----- | ------- | ----- |
| `JmlContract` | `...ast.jml.clauses` | `type`, `behavior`, `name`, `modifiers`, `clauses`, `subContracts`, `jmlTags` |
| `ContractType` | `...ast.jml.clauses` | `METHOD`, `LOOP`, `LOOP_INV`, `BLOCK`, `STATEMENT`, `LAMBDA` |
| `JmlClauseKind` | `...ast.jml.clauses` | clause keyword and validity per contract type |
| `JmlClause` | `...ast.jml.clauses` | abstract clause base |
| `JmlConditionalClause` | `...ast.jml.clauses` | predicate clauses (`requires`, `ensures`, `invariant`, …) |
| `JmlSimpleExprClause` / `JmlMultiExprClause` | `...ast.jml.clauses` | single/multiple expression clauses (`assignable`, …) |
| `JmlSignalsClause` / `JmlSignalsOnlyClause` | `...ast.jml.clauses` | `signals` / `signals_only` |
| `JmlCallableClause` | `...ast.jml.clauses` | `callable` |
| `JmlForallClause` | `...ast.jml.clauses` | contract-level `forall` |
| `JmlOldClause` | `...ast.jml.clauses` | `old` clause |
| `JmlLabeledClause` | `...ast.jml.clauses` | `breaks (Label)` / `continues (Label)` |
| `JmlInfFlowClause` | `...ast.jml.clauses` | information-flow clause |
| `JmlMethodSignature` | `...ast.jml.clauses` | method signature used by callable-like clauses |
| `LoopContractable` | `...ast.jml.clauses` | marker for loop-bearing statements |
| `NodeWithContracts` | `...ast.jml` | `getContracts()` / `addContract(...)` |

## See also

- [Body declarations](../body-declarations/)
- [Modifiers](../modifiers/)
- [Statements](../statements/)
- [Proof scripts](../proof-scripts/)
