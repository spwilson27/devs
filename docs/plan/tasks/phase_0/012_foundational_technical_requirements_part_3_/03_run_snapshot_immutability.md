# Task: WorkflowRun Definition Snapshot Immutability Enforcement (Sub-Epic: 012_Foundational Technical Requirements (Part 3))

## Covered Requirements
- [2_TAS-BR-013]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (owner — WorkflowRun state machine and snapshot immutability)]

## 1. Initial Test Written
- [ ] In `devs-core/src/run.rs` (or the module containing `WorkflowRun`), write a unit test that creates a `WorkflowRun` in `Pending` state with a `definition_snapshot` field set to a test `WorkflowDefinition` value. Transition the run to `Running`. Then attempt to call a method like `set_definition_snapshot(new_snapshot)` — expect it to return an error (e.g., `Err(ImmutableAfterStart)` or similar). Annotate: `// Covers: 2_TAS-BR-013`.
- [ ] Write a test that creates a `WorkflowRun` in `Pending` state and successfully updates the `definition_snapshot` before transitioning to `Running` — expect `Ok(())`. This confirms the snapshot is mutable while still `Pending`. Annotate: `// Covers: 2_TAS-BR-013`.
- [ ] Write a test that transitions a `WorkflowRun` through `Pending → Running → Completed` and verifies that the `definition_snapshot()` accessor returns the exact same `WorkflowDefinition` that was set during `Pending`, unchanged. Annotate: `// Covers: 2_TAS-BR-013`.
- [ ] Write a test that a `WorkflowRun` in `Failed` state also rejects snapshot mutation (immutability applies to all post-Pending states). Annotate: `// Covers: 2_TAS-BR-013`.
- [ ] Write a test that the `Pending → Running` transition itself freezes the snapshot — create a run, set snapshot A, transition to Running, verify `definition_snapshot()` returns A, and confirm no API exists to replace it. Annotate: `// Covers: 2_TAS-BR-013`.

## 2. Task Implementation
- [ ] Add a `definition_snapshot: WorkflowDefinition` field to the `WorkflowRun` struct in `devs-core`. The field must be set at run creation time (constructor requires it).
- [ ] Implement `WorkflowRun::definition_snapshot(&self) -> &WorkflowDefinition` as an immutable accessor.
- [ ] Implement `WorkflowRun::set_definition_snapshot(&mut self, snapshot: WorkflowDefinition) -> Result<(), RunError>` that checks `self.status`. If status is `Pending`, update the field and return `Ok(())`. If any other status, return `Err(RunError::ImmutableAfterStart)`.
- [ ] In the `Pending → Running` state machine transition method, ensure the snapshot is finalized. After this transition, `set_definition_snapshot` must always fail.
- [ ] Define `RunError::ImmutableAfterStart` variant (or equivalent) with a descriptive error message: `"definition_snapshot cannot be modified after run has started"`.
- [ ] Ensure the `WorkflowDefinition` type implements `Clone` and `PartialEq` so tests can assert equality.
- [ ] If `WorkflowDefinition` does not yet exist as a full struct, create a minimal placeholder in `devs-core` with enough fields to be meaningful (e.g., `name: String`, `stages: Vec<StageDef>`) — it will be extended by `devs-config` in Phase 1.

## 3. Code Review
- [ ] Verify that the immutability check is in `set_definition_snapshot` itself, not only in callers — the type must enforce its own invariant.
- [ ] Verify no `unsafe` code is used to bypass the immutability.
- [ ] Verify no forbidden dependencies added to `devs-core`.
- [ ] Verify all public types and methods have doc comments.
- [ ] Verify the state machine transition method does not clone the snapshot unnecessarily (it should already be in place from creation/set).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- run` (or relevant module filter) and confirm all new tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `set_definition_snapshot` explaining the immutability contract and when it is enforced.
- [ ] Ensure `cargo doc -p devs-core --no-deps` produces zero warnings.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes an entry for `2_TAS-BR-013`.
- [ ] Run `./do lint` and confirm exit code 0.
