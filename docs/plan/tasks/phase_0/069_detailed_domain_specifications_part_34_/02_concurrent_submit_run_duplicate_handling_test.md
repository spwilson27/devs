# Task: Implement E2E test for Simultaneous SubmitRun Duplicate Handling (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-423]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Create a new E2E test file `tests/e2e/test_concurrency.rs`.
- [ ] Write a test `test_simultaneous_submit_run_duplicates` that:
  - Starts the `devs-server` subprocess.
  - Registers a project with the server.
  - Prepares two simultaneous `SubmitRun` gRPC calls with the same `run_name` for that project.
  - Executes them in parallel using `tokio::spawn`.
  - Asserts that exactly one call returns success (OK status).
  - Asserts that the other call returns `ALREADY_EXISTS` status.
  - Performs a `ListRuns` call and asserts that only one run exists in the list for that name.

## 2. Task Implementation
- [ ] Ensure the server's `SubmitRun` handler uses atomic state mutation with `ALREADY_EXISTS` check (Step 3 of [2_TAS-REQ-027]).
- [ ] Implement the `DuplicateRunName` error handling in `devs-core`.
- [ ] Verify that the gRPC status mapping for `ALREADY_EXISTS` is correctly implemented ([2_TAS-REQ-002R]).

## 3. Code Review
- [ ] Verify that the state mutation is correctly protected by locks ([2_TAS-REQ-002M], [2_TAS-REQ-002P]).
- [ ] Ensure that no race conditions exist between name validation and state insertion.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test --test e2e::test_concurrency`.
- [ ] Ensure the test passes consistently under high load (multiple iterations).

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that simultaneous `SubmitRun` duplicate handling has been verified with E2E tests.

## 6. Automated Verification
- [ ] Verify traceability by running `./do test` and checking `target/traceability.json` for coverage of [2_TAS-REQ-423].
