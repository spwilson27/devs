# Task: Simultaneous SubmitRun Duplicate Name Handling (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-423]

## Dependencies
- depends_on: ["01_discovery_based_cli_connection.md"]
- shared_components: [devs-scheduler, devs-grpc, devs-server, Shared State & Concurrency Patterns]

## 1. Initial Test Written
- [ ] Create an E2E test (e.g., `concurrent_submit_duplicate.rs`) that:
  1. Starts a `devs` server with a registered project and a valid workflow definition.
  2. Spawns two concurrent tasks (e.g., `tokio::spawn` or two CLI subprocesses) that each call `SubmitRun` gRPC with the same `run_name` and same project.
  3. Collects both responses.
  4. Asserts exactly one response is success (returns a `RunId`).
  5. Asserts exactly one response is an `ALREADY_EXISTS` gRPC status error.
  6. Calls `ListRuns` and asserts the result contains exactly one run with that name (no duplicates).
- [ ] Add `// Covers: 2_TAS-REQ-423` annotation to the test function.

## 2. Task Implementation
- [ ] In the scheduler's `submit_run` method, acquire a write lock on the run state map before checking for name uniqueness.
- [ ] Check if a run with the given `(project, run_name)` pair already exists. If so, return an `ALREADY_EXISTS` error.
- [ ] If not, insert the new run into the map while still holding the write lock, ensuring atomicity.
- [ ] In the gRPC `SubmitRun` handler, map the `ALREADY_EXISTS` domain error to `tonic::Status::already_exists(...)`.
- [ ] Ensure the slug/UUID generation happens after the uniqueness check to avoid wasted work.

## 3. Code Review
- [ ] Verify the uniqueness check and insertion are atomic (both under the same write lock acquisition).
- [ ] Verify no TOCTOU race: the lock must not be released between the check and the insert.
- [ ] Verify the gRPC error code is `ALREADY_EXISTS` (not `INVALID_ARGUMENT` or `INTERNAL`).
- [ ] Verify `ListRuns` returns consistent results (no phantom duplicates).

## 4. Run Automated Tests to Verify
- [ ] Run the concurrent submit test and confirm it passes reliably (run 5+ times to check for flakiness).
- [ ] Run `./do test` and confirm no regressions.

## 5. Update Documentation
- [ ] Add doc comment to `submit_run` explaining the atomicity guarantee and the `ALREADY_EXISTS` behavior.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm exit 0.
- [ ] Verify `// Covers: 2_TAS-REQ-423` appears via `grep -r "Covers: 2_TAS-REQ-423" tests/`.
