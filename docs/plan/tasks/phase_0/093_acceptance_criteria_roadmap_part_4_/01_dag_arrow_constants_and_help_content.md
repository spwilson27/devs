# Task: DAG Arrow Constants and Help Content (Sub-Epic: 093_Acceptance Criteria & Roadmap (Part 4))

## Covered Requirements
- [AC-ASCII-028]
- [AC-HELP-007]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-tui/src/strings.rs` (or a dedicated test file) that iterates over the following constants: `DAG_H`, `DAG_ARROW`, `DAG_V`, `DAG_JUNCTION`, `DAG_EMPTY`.
- [ ] For each constant, assert that it is exactly 1 byte long.
- [ ] Create a unit test for `HELP_OVERLAY_CONTENT` that scans every byte of the string.
- [ ] Assert that every byte is in the range `0x20` to `0x7E` (inclusive) or is a newline `\n` (`0x0A`).

## 2. Task Implementation
- [ ] In `crates/devs-tui/src/strings.rs`, define the following constants:
  - `pub const DAG_H: &str = "-";`
  - `pub const DAG_ARROW: &str = ">";`
  - `pub const DAG_V: &str = "|";`
  - `pub const DAG_JUNCTION: &str = "+";`
  - `pub const DAG_EMPTY: &str = " ";`
- [ ] Add compile-time assertions for the length of these constants:
  ```rust
  const _: () = assert!(DAG_H.len() == 1, "DAG_H must be exactly 1 byte");
  const _: () = assert!(DAG_ARROW.len() == 1, "DAG_ARROW must be exactly 1 byte");
  const _: () = assert!(DAG_V.len() == 1, "DAG_V must be exactly 1 byte");
  const _: () = assert!(DAG_JUNCTION.len() == 1, "DAG_JUNCTION must be exactly 1 byte");
  const _: () = assert!(DAG_EMPTY.len() == 1, "DAG_EMPTY must be exactly 1 byte");
  ```
- [ ] Define `pub const HELP_OVERLAY_CONTENT: &str` with the full ASCII keybinding table as specified in the UI/UX design. Use `+`, `-`, and `|` for the border.
- [ ] Ensure `HELP_OVERLAY_CONTENT` contains ONLY ASCII 0x20-0x7E and `\n`.

## 3. Code Review
- [ ] Verify that all constants are public and follow the naming conventions.
- [ ] Ensure the doc comments for these constants reference the requirement IDs.
- [ ] Confirm that `strings.rs` remains a flat module with no complex logic or imports.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to verify the byte-scan and length tests pass.

## 5. Update Documentation
- [ ] Document the addition of these constants in the crate's `README.md` if applicable.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure that no wide characters or disallowed ANSI sequences were introduced.
