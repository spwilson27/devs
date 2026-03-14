# Task: CI Pipeline Rejects PRs Introducing Non-Goal Code (Sub-Epic: 044_Detailed Domain Specifications (Part 9))

## Covered Requirements
- [1_PRD-REQ-078]

## Dependencies
- depends_on: [03_enforce_no_http_listener_no_filewatch.md]
- shared_components: [./do Entrypoint Script & CI Pipeline (Consumer), Traceability & Coverage Infrastructure (Consumer)]

## 1. Initial Test Written
- [ ] Create a test (shell script or Rust integration test) named `test_ci_rejects_non_goal_code` that:
  1. Creates a temporary workspace copy (or uses a fixture directory).
  2. Adds a forbidden dependency (`notify = "6"`) to a `Cargo.toml` in the fixture.
  3. Runs `./do lint` against the fixture workspace.
  4. Asserts the exit code is non-zero.
  5. Asserts stderr/stdout contains a message referencing the violated requirement ID.
- [ ] Write a second test `test_ci_passes_clean_workspace` that runs `./do lint` against the real workspace and asserts exit 0.
- [ ] Annotate both tests with `// Covers: 1_PRD-REQ-078`.

## 2. Task Implementation
- [ ] Ensure `./do lint` calls the forbidden-dependency checker from task 03 as one of its lint steps.
- [ ] In `.gitlab-ci.yml` (or equivalent CI config), verify the lint job runs `./do lint` and that its failure blocks merge.
- [ ] Add a CI job comment: `# Enforces [1_PRD-REQ-078]: rejects PRs introducing non-goal code`.
- [ ] Ensure the lint step runs on all three platforms (Linux, macOS, Windows) as required by the CI pipeline spec.

## 3. Code Review
- [ ] Verify that `./do lint` fails the entire pipeline (not just warns) when a non-goal violation is detected.
- [ ] Verify the CI configuration does not allow the lint job to be skipped or marked as `allow_failure`.
- [ ] Verify the forbidden-dependency checker output is surfaced in CI logs for developer actionability.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` locally — must exit 0 on clean workspace.
- [ ] Run `./do presubmit` — must exit 0.

## 5. Update Documentation
- [ ] Add a note in the CI pipeline configuration comments explaining that non-goal enforcement is automated per [1_PRD-REQ-078].

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` — both must exit 0.
- [ ] Verify `// Covers: 1_PRD-REQ-078` annotation exists via `grep -r "Covers: 1_PRD-REQ-078"`.
