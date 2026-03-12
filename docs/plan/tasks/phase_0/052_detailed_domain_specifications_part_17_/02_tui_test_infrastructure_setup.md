# Task: TUI Test Infrastructure and Snapshot Setup (Sub-Epic: 052_Detailed Domain Specifications (Part 17))

## Covered Requirements
- [2_TAS-REQ-135]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a foundational test in `devs-tui/tests/tui_infra_tests.rs` that renders a simple "Hello TUI" widget to a `ratatui::backend::TestBackend` (size 200x50) and uses `insta::assert_snapshot!` to verify the output.
- [ ] Verify that the snapshot file is created in `crates/devs-tui/tests/snapshots/` with the `.txt` extension and contains the expected text.

## 2. Task Implementation
- [ ] Configure `devs-tui`'s `[dev-dependencies]` in `Cargo.toml` to include `insta = { version = "1.40", features = ["redactions"] }` and `ratatui = { version = "0.28", features = ["crossterm"] }`.
- [ ] Implement a test helper or trait in `devs-tui/src/test_utils.rs` (if useful) that:
    - Sets up a `TestBackend` with size 200x50.
    - Provides a standard way to "render and snapshot" a frame.
    - Trims trailing spaces from the rendered terminal buffer as per [2_TAS-REQ-135].
- [ ] Configure `insta` to use the `.txt` extension and store snapshots in the specified directory.
- [ ] Set up a dummy TUI state to verify that state assertions (e.g., "selected run ID matches") can be performed alongside visual snapshots.

## 3. Code Review
- [ ] Ensure that no pixel-level or screenshot-based comparison is used, strictly adhering to the text-snapshot mandate.
- [ ] Verify that the `TestBackend` size is strictly 200x50.
- [ ] Check that `missing_docs = "deny"` is respected even in test utility modules.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to ensure the snapshot infrastructure is functional.
- [ ] Verify that running with `INSTA_UPDATE=unseen` works as expected.

## 5. Update Documentation
- [ ] Document the TUI snapshot testing process in `devs-tui/README.md`.
- [ ] Note the requirement for `INSTA_UPDATE=always` for explicit snapshot changes.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no formatting or clippy errors.
- [ ] Run `./do test` and check `target/traceability.json` to ensure [2_TAS-REQ-135] is covered.
