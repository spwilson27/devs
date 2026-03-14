# Task: Enforce No Autonomous Workflow Triggers (Sub-Epic: 043_Detailed Domain Specifications (Part 8))

## Covered Requirements
- [1_PRD-REQ-073]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler (consumer)]

## 1. Initial Test Written
- [ ] Create a test `test_no_autonomous_trigger_apis` that:
  1. Inspects the public API surface of the scheduler module (or `devs-scheduler` crate once it exists).
  2. Asserts there is no `schedule_cron`, `watch_files`, `start_timer`, or equivalent method that could initiate runs without an explicit user-driven submission.
  3. Annotate with `// Covers: 1_PRD-REQ-073`.
- [ ] Create a grep-based lint test (in `./do lint` or `.tools/`) that scans the entire `src/` tree for patterns indicating autonomous trigger implementation:
  - `tokio::time::interval` used in conjunction with run submission logic.
  - `cron`, `schedule`, `inotify`, `kqueue`, `notify::Watcher` imports outside of test code.
  - Any `#[tokio::main]` or `tokio::spawn` that calls a `submit_run`-like function without being in a request handler path.
- [ ] The lint check must pass on the current codebase (no false positives for legitimate background tasks like health checks).

## 2. Task Implementation
- [ ] Add the grep-based lint check as a step in `./do lint`.
- [ ] Define the forbidden patterns as a list of regex patterns with explanatory comments.
- [ ] If a match is found, print the file, line number, and matched pattern, then fail.
- [ ] Add an architectural doc comment in the scheduler module (or a `NON_GOALS.md` section): `// MVP: All workflow runs MUST originate from explicit CLI submit or MCP tool call. No cron, file-watch, or timer triggers. See [1_PRD-REQ-073].`

## 3. Code Review
- [ ] Verify the forbidden-pattern list does not produce false positives on legitimate uses (e.g., `tokio::time::sleep` for backoff, `tokio::spawn` for stage execution).
- [ ] Verify the architectural comment is placed in a visible location that future developers will encounter.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm the autonomous-trigger check passes.
- [ ] Run `cargo test` for any API-surface assertion tests.

## 5. Update Documentation
- [ ] Add the architectural constraint comment in the scheduler module as described above.

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0.
- [ ] Verify `// Covers: 1_PRD-REQ-073` annotation exists in test code via grep.
