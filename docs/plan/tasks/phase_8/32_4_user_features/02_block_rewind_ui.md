# Task: Block Rewind UX/CLI and Explicit Override (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-041]

## 1. Initial Test Written
- [ ] Write integration tests exercising the user-facing behavior when a rewind is attempted on a dirty workspace:
  - CLI test: simulate `devs rewind` when repo is dirty; assert exit code indicates blocked and human-readable message is printed.
  - Web UI test (if project has a web UI): render the rewind flow and assert a modal with the exact copy appears and that the "Force Rewind" control is disabled behind an explicit confirmation flow.
- [ ] Add automated tests to validate that the explicit override requires both a `--force` flag and an interactive confirmation (or a second explicit flag `--confirm-force`) to proceed.

## 2. Task Implementation
- [ ] Implement a CLI-level guard in the rewind command handler to call detect_dirty_workspace() and, on dirty, return a non-zero exit with a structured error payload containing details and remediation steps.
- [ ] Implement a web modal component (e.g., web/src/components/DirtyRewindModal.*) that shows the set of dirty files, explains consequences, and exposes a two-step confirmation for forcing a rewind.
- [ ] Add telemetry/logging hooks to record blocked attempts (event: rewind_blocked, metadata: user_id, task_id, dirty_files_count) while not leaking file contents in logs.

## 3. Code Review
- [ ] Confirm CLI handlers sanitize input and propagate structured errors.
- [ ] Confirm UI is accessible (aria attributes), localized keys are used, and text is concise.
- [ ] Ensure override requires explicit opt-in semantics (no silent flag that bypasses confirmation).

## 4. Run Automated Tests to Verify
- [ ] Run CLI unit/integration tests that exercise blocked and forced flows.
- [ ] If UI exists, run headless browser tests that assert modal presence and confirm flow behavior.

## 5. Update Documentation
- [ ] Update docs/tasks/dirty-workspace.md with CLI examples:
  - `devs rewind` -> blocked
  - `devs rewind --force --confirm-force` -> proceed (describe risk)
- [ ] Provide example screenshots or CLI outputs for maintainers.

## 6. Automated Verification
- [ ] Provide a CI matrix job that runs the CLI integration tests and (if applicable) the UI headless tests to verify regressions are prevented.
