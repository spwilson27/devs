# Task: TUI E2E Snapshot Testing Integration (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-042]

## Dependencies
- depends_on: [01_e2e_infrastructure.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a TUI E2E test in `crates/devs-tui/tests/e2e/dashboard_snapshot.rs` that renders the dashboard and asserts its contents using `insta::assert_snapshot!`.
- [ ] The test should fail because no snapshots have been created yet, and it should produce a `.txt.new` file in `crates/devs-tui/tests/snapshots/`.

## 2. Task Implementation
- [ ] Add `insta` as a dev-dependency to `devs-tui`.
- [ ] Implement `TuiClient` snapshot support:
    - Capture the contents of `ratatui::backend::TestBackend` as a string after it stabilizes (e.g., after the dashboard loads).
    - Ensure snapshots are stored in the correct directory: `crates/devs-tui/tests/snapshots/`.
- [ ] Implement a helper to "scrub" dynamic content like UUIDs or timestamps from the snapshot before assertion, to ensure deterministic results.
- [ ] Ensure that failures automatically output a `.txt.new` file alongside the existing `.txt` snapshot file for the development agent to read and compare.

## 3. Code Review
- [ ] Confirm that snapshot files are human-readable text files representing the TUI state.
- [ ] Verify that the snapshot path follows the requirement: `crates/devs-tui/tests/snapshots/<test_name>.txt`.
- [ ] Ensure the agent is explicitly instructed to NOT approve snapshot updates without verification.

## 4. Run Automated Tests to Verify
- [ ] Run the TUI snapshot test: `cargo test -p devs-tui --test dashboard_snapshot --features e2e`.
- [ ] Verify that `crates/devs-tui/tests/snapshots/dashboard_snapshot.txt.new` is created on failure.

## 5. Update Documentation
- [ ] Add a section to the "Agent Guide" or `GEMINI.md` explaining how to handle TUI snapshot failures:
    - Read the `.txt` (current) and `.txt.new` (proposed) snapshots.
    - Compare them using the filesystem tool.
    - Approve ONLY if the change is intentional.

## 6. Automated Verification
- [ ] Run `./do test -p devs-tui` and check for the presence of the snapshot directory.
- [ ] Verify that `insta` settings are configured to produce the required file extension and location.
