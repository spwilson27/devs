# Task: Atomic Project Registry Updates (Sub-Epic: 062_Detailed Domain Specifications (Part 27))

## Covered Requirements
- [2_TAS-REQ-275]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Write a unit test for `ProjectRegistry` in `devs-config` that validates the `status = "removing"` state when a project is removed while it has active runs.
- [ ] Write a test that mocks file writing failures and ensures that the registry file is not corrupted during updates.
- [ ] Write an integration test for the `devs project add` and `devs project remove` CLI commands.
- [ ] Assert that `devs project remove` on a project with active runs does not immediately delete the record but sets its status to `removing`.
- [ ] Assert that the registry file is updated atomically (using write temp + rename).

## 2. Task Implementation
- [ ] Implement atomic file writing for the project registry in `devs-config` (e.g., using `tempfile` and `std::fs::rename`).
- [ ] Update `devs project add` logic to append a new entry to the registry and persist it atomically.
- [ ] Update `devs project remove` logic to:
    - Check if the project has active runs.
    - If active runs exist, set the project's status to `removing`.
    - If no active runs exist, delete the project record.
- [ ] Implement a post-run cleanup hook that checks if a project is in the `removing` state and deletes it if it was the last active run.
- [ ] Ensure that `status = "removing"` is persisted in the registry file.

## 3. Code Review
- [ ] Verify that the `status = "removing"` state is handled correctly by other parts of the system (e.g., preventing new runs for that project).
- [ ] Ensure the file rename operation is atomic across all supported platforms (Linux, macOS, Windows).
- [ ] Check for proper error handling if the atomic rename fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` to verify the project registry logic.
- [ ] Run the CLI integration tests for `project add` and `project remove`.

## 5. Update Documentation
- [ ] Document the `removing` status lifecycle in the project management documentation or doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Verify that `2_TAS-REQ-275` is correctly mapped in the test results.
