# Task: Implement Robust Project Loading (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-427]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-config", "devs-server"]

## 1. Initial Test Written
- [ ] Create a mock project registry with two projects: one with a non-existent `repo_path` and one with a valid `repo_path`.
- [ ] Implement a test (unit or integration) that attempts to load the registry.
- [ ] Assert that the loader logs an `ERROR` for the invalid project but completes loading without aborting.
- [ ] Assert that the valid project is available after loading.

## 2. Task Implementation
- [ ] Implement the project registry loader in `devs-config` or `devs-server`.
- [ ] Use `std::path::Path::exists` (or a non-blocking equivalent in `spawn_blocking`) to verify `repo_path` during loading.
- [ ] Wrap the per-project loading logic in a `try` block (or `match`) so that a single project failure does not abort the entire startup sequence.
- [ ] Emit a `tracing::error!` for any project that fails to load due to a missing or invalid path.
- [ ] Ensure that subsequent gRPC calls (like `ListProjects`) correctly handle and report the status of all projects, including those that failed to load.

## 3. Code Review
- [ ] Confirm that project loading is resilient and that errors are localized to the specific project.
- [ ] Verify that the server's state reflects the partial success of project loading.

## 4. Run Automated Tests to Verify
- [ ] Run the project loading tests and confirm that the server recovers gracefully from invalid paths.
- [ ] Verify that `ERROR` logs are produced for missing repository paths.

## 5. Update Documentation
- [ ] Document the robust loading behavior in the project registry's documentation.

## 6. Automated Verification
- [ ] Run the project loading integration test and confirm that it succeeds even when a project is missing its repository.
