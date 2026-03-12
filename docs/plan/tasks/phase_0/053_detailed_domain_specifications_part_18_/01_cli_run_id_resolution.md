# Task: CLI Run Identifier Resolution Logic (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-136]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/cli_utils.rs` (or a new module) that verifies the run identifier resolution logic.
- [ ] The test should mock a list of runs with known UUIDs and Slugs.
- [ ] Test Cases:
    - Pass a valid UUID4 string: Ensure it finds the run by UUID.
    - Pass a valid Slug string: Ensure it finds the run by Slug.
    - Pass a string that matches both a UUID and a Slug of different runs: Ensure UUID takes precedence.
    - Pass a slug that matches multiple runs: Ensure it returns an `AmbiguousSlug` error.
    - Pass a string that matches nothing: Ensure it returns a `RunNotFound` error.

## 2. Task Implementation
- [ ] Implement a `resolve_run_id` function in `crates/devs-core/src/cli_utils.rs`.
- [ ] The function signature should be something like `fn resolve_run_id(query: &str, runs: &[WorkflowRun]) -> Result<Uuid, ResolveError>`.
- [ ] Logic:
    - Attempt to parse `query` as a `Uuid`. If successful, look for a run with that `run_id`.
    - If not found or not a UUID, filter `runs` by `slug`.
    - If exactly one match, return its `run_id`.
    - If multiple matches, return `ResolveError::AmbiguousSlug`.
    - If zero matches, return `ResolveError::RunNotFound`.
- [ ] Ensure `ResolveError` is a `thiserror` enum with appropriate variants.

## 3. Code Review
- [ ] Verify that the resolution order (UUID then Slug) is strictly followed.
- [ ] Ensure that the error variants match the requirements for JSON output mapping in REQ-063/REQ-136.
- [ ] Verify that the function is well-documented with doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib cli_utils` and ensure all resolution test cases pass.

## 5. Update Documentation
- [ ] Document the `resolve_run_id` utility in the `devs-core` README or module documentation.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure code style and documentation requirements are met.
