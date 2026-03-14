# Task: Verify `strip_ansi` Acceptance Criteria (Sub-Epic: 099_Acceptance Criteria & Roadmap (Part 10))

## Covered Requirements
- [AC-TYP-010], [AC-TYP-011], [AC-TYP-012]

## Dependencies
- depends_on: ["phase_0/090_acceptance_criteria_roadmap_part_1_/01_implement_ansi_string_utils.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Add the following unit tests to `crates/devs-core/src/utils/strings.rs`:
  - `test_strip_ansi_red_color`: [AC-TYP-010] Verify that `strip_ansi("\x1b[31mred\x1b[0m")` returns `"red"`.
  - `test_strip_ansi_empty_string`: [AC-TYP-011] Verify that `strip_ansi("")` returns `""` without panicking.
  - `test_strip_ansi_plain_text`: [AC-TYP-012] Verify that `strip_ansi("no-escapes")` returns `"no-escapes"` unchanged.
- [ ] Ensure tests are annotated with `// Covers: AC-TYP-010`, `// Covers: AC-TYP-011`, and `// Covers: AC-TYP-012`.

## 2. Task Implementation
- [ ] Ensure the existing implementation of `strip_ansi` in `crates/devs-core/src/utils/strings.rs` correctly handles these cases.
- [ ] The implementation should use an efficient method (e.g., regex or a manual state-machine parser) to remove ANSI escape sequences.
  - Example logic:
  ```rust
  use regex::Regex;
  use once_cell::sync::Lazy;

  static ANSI_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"\x1B\[[0-9;]*[mK]").unwrap());

  pub fn strip_ansi(s: &str) -> String {
      ANSI_REGEX.replace_all(s, "").to_string()
  }
  ```

## 3. Code Review
- [ ] Confirm that `AC-TYP-010` is met: color escape codes are removed.
- [ ] Confirm that `AC-TYP-011` is met: an empty string input does not cause a panic.
- [ ] Confirm that `AC-TYP-012` is met: a string without escapes is left unchanged.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib utils::strings::tests` and ensure all tests pass.

## 5. Update Documentation
- [ ] Ensure doc comments for `strip_ansi` explicitly state these specific behaviors.

## 6. Automated Verification
- [ ] Run `./do lint` and verify code quality.
- [ ] Verify requirement-to-test traceability using `.tools/verify_requirements.py`.
