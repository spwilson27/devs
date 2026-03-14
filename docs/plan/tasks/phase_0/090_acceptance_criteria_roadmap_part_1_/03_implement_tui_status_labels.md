# Task: Implement TUI Status String Constants and Labels (Sub-Epic: 090_Acceptance Criteria & Roadmap (Part 1))

## Covered Requirements
- [AC-ASCII-016], [AC-ASCII-017]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/strings.rs` with a `#[cfg(test)] mod tests` block.
- [ ] **[AC-ASCII-016] `test_status_constants_exactly_4_bytes`**: For each `STATUS_*` constant (`STATUS_PENDING`, `STATUS_WAITING`, `STATUS_ELIGIBLE`, `STATUS_RUNNING`, `STATUS_PAUSED`, `STATUS_COMPLETED`, `STATUS_FAILED`, `STATUS_TIMEOUT`, `STATUS_CANCELLED`), assert `constant.len() == 4`. Add `// Covers: AC-ASCII-016`.
- [ ] **[AC-ASCII-016] Compile-time assertions**: Add `const _: () = assert!(STATUS_PENDING.len() == 4);` (and similarly for all 9 constants) at module level outside `#[cfg(test)]`. These fire at compile time, not just at test time, per the requirement "Compile-time `const` assertion for each constant". Add `// Covers: AC-ASCII-016` comment above the block.
- [ ] **[AC-ASCII-017] `test_stage_status_label_exhaustive`**: For every variant of `StageStatus` (enumerate all variants), call `stage_status_label(variant)` and assert:
  - The return value is exactly 4 bytes (`result.len() == 4`).
  - The return value is one of the set `{"PEND", "WAIT", "ELIG", "RUN ", "PAUS", "DONE", "FAIL", "TIME", "CANC"}`.
  - Add `// Covers: AC-ASCII-017`.
- [ ] **[AC-ASCII-017] `test_stage_status_label_specific_mappings`**: Assert each specific mapping: `Pending -> "PEND"`, `Waiting -> "WAIT"`, `Eligible -> "ELIG"`, `Running -> "RUN "`, `Paused -> "PAUS"`, `Completed -> "DONE"`, `Failed -> "FAIL"`, `TimedOut -> "TIME"`, `Cancelled -> "CANC"`. Add `// Covers: AC-ASCII-017`.
- [ ] **[AC-ASCII-017] `test_stage_status_label_unknown`**: If `StageStatus` is non-exhaustive or has an `Unknown` variant, assert `stage_status_label` returns `"????"` (also 4 bytes). Add `// Covers: AC-ASCII-017`.

## 2. Task Implementation
- [ ] Ensure `StageStatus` enum exists in `crates/devs-core/src/types/` (or create it) with variants: `Pending`, `Waiting`, `Eligible`, `Running`, `Paused`, `Completed`, `Failed`, `TimedOut`, `Cancelled`. If the enum needs an `Unknown` variant for forward-compatibility, add it.
- [ ] Create `crates/devs-tui/src/strings.rs`.
- [ ] Add `pub mod strings;` to `crates/devs-tui/src/lib.rs`.
- [ ] Define 9 `pub const` `&str` values, each exactly 4 bytes:
  - `pub const STATUS_PENDING: &str = "PEND";`
  - `pub const STATUS_WAITING: &str = "WAIT";`
  - `pub const STATUS_ELIGIBLE: &str = "ELIG";`
  - `pub const STATUS_RUNNING: &str = "RUN ";`  (note trailing space)
  - `pub const STATUS_PAUSED: &str = "PAUS";`
  - `pub const STATUS_COMPLETED: &str = "DONE";`
  - `pub const STATUS_FAILED: &str = "FAIL";`
  - `pub const STATUS_TIMEOUT: &str = "TIME";`
  - `pub const STATUS_CANCELLED: &str = "CANC";`
- [ ] Add compile-time const assertions immediately after the constants:
  ```rust
  // Covers: AC-ASCII-016
  const _: () = assert!(STATUS_PENDING.len() == 4);
  const _: () = assert!(STATUS_WAITING.len() == 4);
  const _: () = assert!(STATUS_ELIGIBLE.len() == 4);
  const _: () = assert!(STATUS_RUNNING.len() == 4);
  const _: () = assert!(STATUS_PAUSED.len() == 4);
  const _: () = assert!(STATUS_COMPLETED.len() == 4);
  const _: () = assert!(STATUS_FAILED.len() == 4);
  const _: () = assert!(STATUS_TIMEOUT.len() == 4);
  const _: () = assert!(STATUS_CANCELLED.len() == 4);
  ```
- [ ] Implement `pub fn stage_status_label(status: &StageStatus) -> &'static str` with an exhaustive `match`:
  ```rust
  match status {
      StageStatus::Pending => STATUS_PENDING,
      StageStatus::Waiting => STATUS_WAITING,
      StageStatus::Eligible => STATUS_ELIGIBLE,
      StageStatus::Running => STATUS_RUNNING,
      StageStatus::Paused => STATUS_PAUSED,
      StageStatus::Completed => STATUS_COMPLETED,
      StageStatus::Failed => STATUS_FAILED,
      StageStatus::TimedOut => STATUS_TIMEOUT,
      StageStatus::Cancelled => STATUS_CANCELLED,
      _ => "????",
  }
  ```
- [ ] Add `devs-core` as a dependency of `devs-tui` in `crates/devs-tui/Cargo.toml` if not already present.

## 3. Code Review
- [ ] Verify all 9 constants are exactly 4 ASCII bytes (pad with trailing space where needed, e.g., `"RUN "`).
- [ ] Verify compile-time `const` assertions exist for all 9 constants — these must fail compilation if any constant is not 4 bytes.
- [ ] Verify `stage_status_label` match is exhaustive — adding a new `StageStatus` variant must cause a compile error (or hit the `_ => "????"` fallback).
- [ ] Verify return type is `&'static str`.
- [ ] No `unsafe` code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- strings` and verify all tests pass.
- [ ] Run `cargo build -p devs-tui` to verify compile-time assertions pass.

## 5. Update Documentation
- [ ] Add doc comments on each `STATUS_*` constant and on `stage_status_label` explaining the 4-byte fixed-width contract.

## 6. Automated Verification
- [ ] Run `grep -rn "Covers: AC-ASCII-016" crates/devs-tui/` — must return at least one match.
- [ ] Run `grep -rn "Covers: AC-ASCII-017" crates/devs-tui/` — must return at least one match.
- [ ] Run `cargo test -p devs-tui -- strings --no-fail-fast 2>&1 | tail -5` and confirm `test result: ok`.
