# Task: Coverage Crash Handling (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-002]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a simulation in the `./do` script test suite (or a standalone test script) where the `cargo test` command (unit tests) crashes (e.g., returns a specific non-zero exit code or SIGSEGV) during `./do coverage`.
- [ ] Verify that the script FIRST checks if the test suite completed successfully before evaluating coverage gates.
- [ ] The test should assert that `./do coverage` exits with a non-zero status and prints "instrumentation failure: unit test suite crashed before completion" (or similar) to stderr.
- [ ] The test should verify that no `0.0%` coverage is reported in this case, but rather it is marked as "unmeasured".

## 2. Task Implementation
- [ ] Modify the `./do` script's `coverage` subcommand.
- [ ] Implement logic to capture the exit status of the unit test suite run.
- [ ] If the exit status indicates a crash or unrecoverable error (other than just test failures), set a flag for "instrumentation failure".
- [ ] Ensure that if the flag is set, the script skips gate evaluation and reports the failure as unmeasured.
- [ ] Ensure the script exits non-zero.

## 3. Code Review
- [ ] Verify that the implementation distinguishes between "test failures" (which should still allow coverage measurement) and "test crashes/instrumentation failures".
- [ ] Ensure the error message matches the requirement [1_PRD-KPI-BR-002].

## 4. Run Automated Tests to Verify
- [ ] Run the simulation test created in step 1 and ensure it passes.
- [ ] Run a normal `./do coverage` and ensure it still works for passing/failing tests without crashes.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the implementation of coverage crash handling in the toolchain.

## 6. Automated Verification
- [ ] Run `./do coverage` with a deliberate crash (e.g., via a mock `cargo` that returns 139 for SIGSEGV) and verify the output contains the instrumentation failure message.
