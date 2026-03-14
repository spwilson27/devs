# Task: Implement Robust Project Loading with Graceful Degradation (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-427]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-config", "devs-core", "devs-scheduler"]

## 1. Initial Test Written
- [ ] Write an E2E test that: (1) creates a server config with two registered projects — one with a valid `repo_path` and one with a non-existent `repo_path` (e.g., `/tmp/does_not_exist_XXXX`), (2) starts the server, (3) asserts the server starts successfully (process is running, gRPC port is listening), (4) captures server stderr/logs and asserts an `ERROR`-level log line is emitted mentioning the non-existent project path, (5) runs `devs list` (or gRPC `ListRuns`) for the valid project and asserts it succeeds.
- [ ] Write a unit test for the project-loading function that passes a `ProjectEntry` with a non-existent `repo_path` and asserts the function returns an error (or marks the project as degraded) rather than panicking.
- [ ] Write a unit test confirming that when one project fails to load, the remaining projects are still loaded and accessible.

## 2. Task Implementation
- [ ] In the server startup sequence (project registry loading), wrap each project's initialization in error handling that: logs an `ERROR` with the project name and the invalid path, marks the project as `degraded` or `unavailable` in the registry, and continues loading remaining projects.
- [ ] Ensure the server does NOT abort startup when a single project fails to load. The startup sequence must be resilient: iterate all projects, collect errors, log them, and proceed.
- [ ] When a degraded project is queried via `devs list` or gRPC, return an appropriate status (e.g., empty run list with a status indicating the project is unavailable) rather than an internal error.
- [ ] Ensure `devs list` with no project filter still works, simply excluding or marking degraded projects.

## 3. Code Review
- [ ] Verify the error handling uses `tracing::error!` (not `panic!` or `unwrap()`) for project load failures.
- [ ] Verify the server startup path has no early-return or `?` propagation that would abort on a single project failure.
- [ ] Confirm the degraded project state is properly represented in the project registry data structure.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E test and confirm it passes.
- [ ] Run the unit tests and confirm they pass.
- [ ] Run `./do test` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a doc comment on the project-loading function explaining the graceful degradation behavior.

## 6. Automated Verification
- [ ] Run `./do test` and confirm exit code 0.
- [ ] Run the specific E2E test in isolation and verify the server log output contains an ERROR-level message about the missing path.
