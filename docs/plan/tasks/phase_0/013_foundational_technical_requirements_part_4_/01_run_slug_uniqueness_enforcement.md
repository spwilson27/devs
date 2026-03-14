# Task: Enforce Run Name/Slug Uniqueness Under Per-Project Mutex (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-BR-016], [2_TAS-BR-025]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — uses domain types and error enums)]

## 1. Initial Test Written
- [ ] Create test module `devs-core/src/run_uniqueness_tests.rs` (or `#[cfg(test)] mod tests` in the relevant module).
- [ ] **Test: `slug_uniqueness_rejects_duplicate`** — Create a `ProjectRunRegistry` (or equivalent container) holding one active run with slug `"feature-abc-1234"`. Attempt to register a second run with the same slug. Assert the result is `Err(DuplicateSlug { existing_run_id, slug })`.
- [ ] **Test: `slug_uniqueness_allows_after_cancellation`** — Register a run with slug `"feature-abc-1234"`, then transition it to `Cancelled` state. Attempt to register a new run with the same slug. Assert it succeeds (per [2_TAS-BR-016]: two runs MUST NOT share a slug unless one is `Cancelled`).
- [ ] **Test: `concurrent_submit_same_slug_one_wins`** — Spawn two `std::thread::spawn` tasks that both attempt to register a run with slug `"race-slug"` through the mutex-guarded API. Assert exactly one succeeds and one returns `DuplicateSlug`. Run this test 100 iterations via a loop to stress the mutex (per [2_TAS-BR-025]: uniqueness check under per-project mutex to prevent TOCTOU).
- [ ] **Test: `different_projects_same_slug_allowed`** — Register slug `"shared-name"` in project A. Register the same slug in project B. Assert both succeed (uniqueness is per-project, not global).
- [ ] **Test: `slug_uniqueness_check_is_atomic`** — Verify that the check-and-insert operation is performed while holding the mutex: no intermediate state where the slug is "checked but not yet inserted" is observable to another caller. This is verified by the concurrent test above returning deterministic results.
- [ ] Annotate all tests with `// Covers: 2_TAS-BR-016` and `// Covers: 2_TAS-BR-025`.

## 2. Task Implementation
- [ ] In `devs-core`, define a `ProjectRunRegistry` struct (or add to existing project state types) containing:
  - `runs: HashMap<RunId, WorkflowRunSummary>` — stores slug and status for each run.
  - `mutex: std::sync::Mutex<()>` — guards all check-and-insert operations for this project.
- [ ] Implement `fn register_run(&self, slug: &str, run_id: RunId) -> Result<(), RunRegistryError>`:
  - Acquire the mutex lock.
  - Scan `runs` for any entry with the same slug whose status is NOT `Cancelled`.
  - If found, return `Err(RunRegistryError::DuplicateSlug { existing_run_id, slug })`.
  - If not found, insert the new run and return `Ok(())`.
  - Release the mutex (via drop).
- [ ] Define `RunRegistryError` enum in `devs-core` error types with variant `DuplicateSlug { existing_run_id: RunId, slug: String }`.
- [ ] Ensure `WorkflowRunState` enum (if not already present) includes `Cancelled` variant so the exemption logic can check it.
- [ ] The mutex MUST be `std::sync::Mutex` (not `tokio::sync::Mutex`) since the critical section contains no async operations — just a HashMap lookup and insert.

## 3. Code Review
- [ ] Verify the mutex scope is minimal: only the check-and-insert is guarded, no I/O or long operations.
- [ ] Confirm that `Cancelled` runs are correctly exempted from the uniqueness check (both `Cancelled` and any terminal-then-cancelled transitions).
- [ ] Verify that the `DuplicateSlug` error includes enough context (run ID, slug) for upstream layers to produce meaningful error messages.
- [ ] Check that no `pub` fields on `ProjectRunRegistry` allow bypassing the mutex.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- run_uniqueness` to execute all uniqueness tests.
- [ ] Run `./do test` to verify traceability annotations are picked up.

## 5. Update Documentation
- [ ] Add doc comments on `ProjectRunRegistry::register_run` explaining the uniqueness invariant and the `Cancelled` exemption.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no warnings.
- [ ] Run `cargo test -p devs-core -- concurrent_submit_same_slug_one_wins` and verify it passes 100 iterations without flakiness.
