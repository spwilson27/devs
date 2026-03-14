# Task: Owned Deep-Clone Snapshot of WorkflowDefinition at submit_run Time (Sub-Epic: 54_Risk 024 Verification)

## Covered Requirements
- [RISK-025], [RISK-025-BR-001]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint, devs-core, devs-scheduler]

## 1. Initial Test Written

- [ ] In `crates/devs-checkpoint/tests/snapshot_immutability.rs`, write a unit test `test_definition_snapshot_is_deep_clone_not_arc` that:
  1. Creates a `WorkflowDefinition` value with a known `name` field (e.g., `"my-workflow"`).
  2. Calls `submit_run` (or the equivalent internal function that constructs a `WorkflowRun`) with the definition, capturing the resulting `WorkflowRun`.
  3. Mutates the original `WorkflowDefinition` (e.g., changes `name` to `"mutated"`).
  4. Asserts that `run.definition_snapshot.name` is still `"my-workflow"` — proving no shared pointer exists.
  5. Annotate with `// REQ: RISK-025, RISK-025-BR-001`.

- [ ] Write a second unit test `test_definition_snapshot_no_arc_ptr` that uses `std::sync::Arc` detection via type system: confirm that `WorkflowRun::definition_snapshot` is declared as `WorkflowDefinition` (an owned value), NOT as `Arc<WorkflowDefinition>` or any wrapper. This can be a compile-time test — write a `const fn` or static assertion that the field type does not implement `Deref<Target = WorkflowDefinition>` via `Arc`. Alternatively, assert that `std::mem::size_of::<WorkflowRun>()` is consistent with an owned struct (not a pointer-width Arc), checking against a known reference size.

- [ ] Write an integration test `test_submit_run_snapshot_captured_under_mutex` in `crates/devs-scheduler/tests/submit_run_concurrency.rs` that:
  1. Constructs a `ProjectState` with a single workflow definition.
  2. Spawns a `tokio` task that calls `submit_run` for the workflow.
  3. Concurrently (in the same `tokio::join!`) mutates the workflow definition via `write_workflow_definition`.
  4. After both futures complete, reads `workflow_snapshot.json` for the submitted run from the checkpoint store.
  5. Asserts that the snapshot's `definition` field equals the **original** definition (before mutation), not the mutated one.
  6. Annotate with `// REQ: RISK-025, RISK-025-BR-001`.

## 2. Task Implementation

- [ ] Open `crates/devs-core/src/domain.rs` (or wherever `WorkflowRun` is defined). Locate the `definition_snapshot` field.
  - Change the field type from `Arc<WorkflowDefinition>` (if present) to `WorkflowDefinition` (owned value).
  - If it is already `WorkflowDefinition`, verify there is no implicit `Arc` wrapping elsewhere.

- [ ] Open the `submit_run` function in `crates/devs-scheduler/src/scheduler.rs` (or equivalent). Within the body of the per-project mutex lock guard scope:
  1. Clone the `WorkflowDefinition` with `.clone()` (deriving `Clone` on `WorkflowDefinition` if not already present) **before** any `.await` point.
  2. Assign this clone to `definition_snapshot` in the new `WorkflowRun`.
  3. Ensure the assignment happens **before** the mutex guard is dropped.

- [ ] Add `#[derive(Clone)]` to `WorkflowDefinition` in `crates/devs-core/src/types.rs` (or wherever it is defined) if not already present, propagating `Clone` to all nested types (`StageDefinition`, `BranchConfig`, etc.).

- [ ] Add a comment above the snapshot clone line:
  ```rust
  // [RISK-025-BR-001] Owned deep-clone; Arc into the live workflow map is prohibited here.
  ```

- [ ] Compile with `cargo build -p devs-scheduler` and resolve any type errors introduced by switching from `Arc<WorkflowDefinition>` to `WorkflowDefinition`.

## 3. Code Review

- [ ] Confirm `WorkflowRun::definition_snapshot` field is `WorkflowDefinition`, not `Arc<WorkflowDefinition>` or any smart pointer.
- [ ] Confirm the `.clone()` call is inside the mutex lock scope (before `drop(guard)` or before the guard goes out of scope through a closing brace).
- [ ] Confirm there are no other sites in the codebase where `WorkflowRun` is constructed that set `definition_snapshot` to an `Arc`-backed value — run `grep -rn "definition_snapshot" crates/` and inspect each site.
- [ ] Confirm `WorkflowDefinition` derives `Clone` and `serde::Serialize`/`serde::Deserialize` (required for checkpoint persistence).
- [ ] Confirm the traceability annotations `// REQ: RISK-025` and `// REQ: RISK-025-BR-001` appear in both the production code comment and in each test.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-checkpoint snapshot_immutability
  cargo test -p devs-scheduler submit_run_concurrency
  ```
  All tests must pass.

- [ ] Run the full test suite:
  ```bash
  ./do test
  ```
  No regressions.

## 5. Update Documentation

- [ ] Add a doc comment to `WorkflowRun::definition_snapshot`:
  ```rust
  /// Immutable deep-clone of the [`WorkflowDefinition`] captured under the per-project
  /// mutex at [`submit_run`] time. This field is owned (not an `Arc`) to guarantee
  /// isolation from subsequent [`write_workflow_definition`] calls.
  ///
  /// **Requirement:** [RISK-025-BR-001]
  pub definition_snapshot: WorkflowDefinition,
  ```
- [ ] Add a doc comment to the `submit_run` function documenting that the snapshot is captured under the mutex before any `.await`.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `RISK-025` and `RISK-025-BR-001` both appear with `status: covered`.
- [ ] Run `./do coverage` and confirm `crates/devs-checkpoint` and `crates/devs-scheduler` meet the ≥90% unit coverage gate.
- [ ] Inspect `target/traceability.json` and confirm both requirement IDs have non-empty `test_refs`.
