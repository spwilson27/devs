# Task: Implement TUI Status String Constants and Labels (Sub-Epic: 090_Acceptance Criteria & Roadmap (Part 1))

## Covered Requirements
- [AC-ASCII-016], [AC-ASCII-017]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/001_workspace_toolchain_setup/02_scaffold_workspace_crates.md]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-tui/src/strings.rs`:
  - `test_status_constant_lengths`: [AC-ASCII-016] Verify that all `STATUS_*` constants are exactly 4 bytes (UTF-8).
  - `test_stage_status_label_exhaustive`: [AC-ASCII-017] For every variant of `StageStatus`, the `stage_status_label` function returns exactly 4 bytes.
  - Test specific mappings: `PEND` -> "PEND", `WAIT` -> "WAIT", `RUN` -> "RUN ", etc.
  - Test for unknown status: `stage_status_label` returns "????" for unknown or unrecognized variants.

## 2. Task Implementation
- [ ] Ensure `crates/devs-tui/src/lib.rs` includes `pub mod strings;`.
- [ ] Create `crates/devs-tui/src/strings.rs`.
- [ ] Define the following `pub const` &str values [AC-ASCII-016]:
  - `STATUS_PENDING = "PEND"`
  - `STATUS_WAITING = "WAIT"`
  - `STATUS_ELIGIBLE = "ELIG"`
  - `STATUS_RUNNING = "RUN "`
  - `STATUS_PAUSED = "PAUS"`
  - `STATUS_COMPLETED = "DONE"`
  - `STATUS_FAILED = "FAIL"`
  - `STATUS_TIMEOUT = "TIME"`
  - `STATUS_CANCELLED = "CANC"`
- [ ] Define (or import from `devs-core` if available) the `StageStatus` enum. If not available, create a minimal version in `crates/devs-core/src/types/status.rs` and export it.
- [ ] Implement `pub fn stage_status_label(status: &StageStatus) -> &str` mapping each variant to the corresponding constant [AC-ASCII-017].
- [ ] Use `strum` (if allowed in `devs-core`) for exhaustive matching, or a manual `match` with a `#[deny(non_exhaustive_omitted_patterns)]` or similar guard if possible.

## 3. Code Review
- [ ] Verify that all status labels are exactly 4 bytes long (padded with spaces where necessary, e.g., "RUN "). [AC-ASCII-016]
- [ ] Ensure the mapping is correct and exhaustive. [AC-ASCII-017]
- [ ] Check for idiomatic Rust patterns (e.g., using `&'static str`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib strings` and verify all tests pass.

## 5. Update Documentation
- [ ] Document the status label mapping in the code or README.md.

## 6. Automated Verification
- [ ] Run `grep -r "AC-ASCII-016" crates/devs-tui/` and `grep -r "AC-ASCII-017" crates/devs-tui/` to verify traceability.
