# Task: TUI E2E Snapshot Testing Integration (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-042]

## Dependencies
- depends_on: ["01_e2e_infrastructure.md"]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a TUI E2E test in `crates/devs-tui/tests/e2e/dashboard_snapshot.rs` that:
  1. Starts a real `devs-server` subprocess using `ServerManager` from the E2E helpers.
  2. Creates a `TuiWrapper` with `ratatui::backend::TestBackend`.
  3. Renders the dashboard view after connecting to the server.
  4. Captures the terminal buffer as a string after it stabilizes (e.g., after 3 consecutive identical frames).
  5. Calls `insta::assert_snapshot!(rendered_output)` to assert against a committed snapshot.
  6. Annotates with `// Covers: [3_MCP_DESIGN-REQ-042]`.
- [ ] Create an initial baseline snapshot file at `crates/devs-tui/tests/snapshots/dashboard_snapshot.txt` with intentionally **different** content to ensure the first test run produces a `.txt.new` file.
- [ ] Run the test to confirm it fails and produces the `.txt.new` artifact:
  ```
  cargo test -p devs-tui --test dashboard_snapshot -- --nocapture 2>&1 | tee /tmp/tui_snapshot_baseline.txt
  ls -la crates/devs-tui/tests/snapshots/*.txt.new
  ```
  The `.txt.new` file must exist after the test exits non-zero.

## 2. Task Implementation
- [ ] **Add `insta` as a dev-dependency** to `crates/devs-tui/Cargo.toml`:
  ```toml
  [dev-dependencies]
  insta = { version = "1.40", features = ["yaml"] }
  ```
  - Ensure `insta` is NOT configured with `force-update-snapshots = true` or `INSTA_UPDATE=always` in any config file.

- [ ] **Implement TUI snapshot harness** in `crates/devs-tui/tests/e2e_helpers.rs` or similar:
  - `TuiWrapper::render_to_string(&self) -> String`:
    - Captures the contents of `ratatui::backend::TestBackend` by iterating over all cells and formatting as plain text.
    - Includes terminal layout (borders, spacing) exactly as rendered.
  - `TuiWrapper::wait_for_stable(&mut self, max_frames: usize = 10) -> String`:
    - Renders frames until the output stabilizes (N consecutive identical frames) or `max_frames` is reached.
    - Returns the stable rendered string.
  - Annotate with `// Covers: [3_MCP_DESIGN-REQ-042]`.

- [ ] **Implement snapshot scrubbing helper**:
  - `scrub_dynamic_content(input: &str) -> String`:
    - Replaces UUIDs with `<UUID>` placeholder (regex: `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`).
    - Replaces timestamps with `<TIMESTAMP>` placeholder (regex: ISO 8601 format).
    - Replaces run IDs, stage IDs with `<ID>` placeholder.
    - Ensures deterministic snapshots for E2E tests.
  - Annotate with `// Covers: [3_MCP_DESIGN-REQ-042]`.

- [ ] **Ensure `.txt.new` file output on failure**:
  - Verify `insta` is configured to write snapshots to `crates/devs-tui/tests/snapshots/` directory.
  - By default, `insta 1.40` writes `<test_name>.txt.new` adjacent to the existing snapshot file on mismatch.
  - Confirm `INSTA_UPDATE` env var is NOT set to `"always"` in `./do test` or CI config.
  - The `.txt.new` file must be readable immediately after `./do test` exits non-zero.

- [ ] **Update `./do` script** to ensure snapshot tests run correctly:
  - Ensure `./do test` does NOT set `INSTA_UPDATE=always` or `INSTA_FORCE_UPDATE_SNAPSHOTS=1`.
  - Annotate with `# [3_MCP_DESIGN-REQ-042]`.

## 3. Code Review
- [ ] Confirm that snapshot files are human-readable text files representing the TUI state (plain text, not binary).
- [ ] Verify that the snapshot path follows the requirement: `crates/devs-tui/tests/snapshots/<test_name>.txt`.
- [ ] Ensure the agent is explicitly instructed to NOT approve snapshot updates without verification:
  - Add a comment in the test file: `// Per [3_MCP_DESIGN-REQ-042]: Do NOT accept snapshot updates without verifying the TUI change is intentional.`
- [ ] Verify that `insta` settings do not auto-accept snapshots (no `INSTA_UPDATE=always`).
- [ ] Confirm all public symbols have doc comments per project standards.
- [ ] Verify `// Covers: [3_MCP_DESIGN-REQ-042]` annotations are present in all TUI snapshot test files and helpers.

## 4. Run Automated Tests to Verify
- [ ] Run the TUI snapshot test:
  ```
  cargo test -p devs-tui --test dashboard_snapshot -- --nocapture
  ```
  The test should pass if the snapshot matches, or fail and produce a `.txt.new` file if it diverges.
- [ ] **Verify `.txt.new` file is created on failure**:
  1. Modify the baseline snapshot file to have different content.
  2. Run the test again and confirm it exits non-zero.
  3. Check that `crates/devs-tui/tests/snapshots/dashboard_snapshot.txt.new` exists:
     ```
     ls -la crates/devs-tui/tests/snapshots/*.txt.new
     ```
- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-042
  ```
  Must exit 0 and report `3_MCP_DESIGN-REQ-042` as "covered".

## 5. Update Documentation
- [ ] Add a section to `GEMINI.md` titled "Handling TUI Snapshot Failures" explaining:
  - When a TUI E2E snapshot test fails, `insta` produces a `.txt.new` file at `crates/devs-tui/tests/snapshots/<test_name>.txt.new`.
  - The agent MUST read both the `.txt` (current baseline) and `.txt.new` (proposed) files using the filesystem MCP.
  - The agent MUST compare them to understand the UI regression or change.
  - The agent MUST NOT approve a snapshot update (by replacing `.txt` with `.txt.new` content) without first verifying that the TUI text output change is intentional.
  - If the change is a regression, fix the TUI rendering code and delete the `.txt.new` file.
  - If the change is intentional, accept the new snapshot by renaming `.txt.new` to `.txt`.
- [ ] Update `docs/architecture/testing.md` to document the TUI snapshot testing pattern.
- [ ] In `docs/plan/phases/phase_5.md`, update the entry for `[3_MCP_DESIGN-REQ-042]`:
  ```
  - [3_MCP_DESIGN-REQ-042]: Covered by `crates/devs-tui/tests/e2e/dashboard_snapshot.rs` and TUI snapshot harness
  ```

## 6. Automated Verification
- [ ] Confirm the requirement is covered in the traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_tui.txt
  grep "3_MCP_DESIGN-REQ-042" /tmp/presubmit_tui.txt
  ```
  The ID must appear as `COVERED`.
- [ ] Verify `INSTA_UPDATE` is NOT set to `always` in any test or CI script:
  ```bash
  grep -rn "INSTA_UPDATE=always\|INSTA_UPDATE = always" . --include="*.sh" --include="*.yml" --include="*.yaml" --include="./do"
  ```
  Must return no results.
- [ ] Verify `.txt.new` file is produced and readable when snapshot diverges:
  ```
  cargo test -p devs-tui --test dashboard_snapshot 2>&1 | grep -E "test .* (FAILED|ok)"
  ls -la crates/devs-tui/tests/snapshots/*.txt.new 2>/dev/null || echo "OK: No .new file (snapshot matches)"
  ```
- [ ] Verify the snapshot directory exists and is tracked:
  ```
  ls -la crates/devs-tui/tests/snapshots/
  ```
