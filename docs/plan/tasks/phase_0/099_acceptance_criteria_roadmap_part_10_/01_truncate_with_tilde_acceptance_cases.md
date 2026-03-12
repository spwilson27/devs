# Task: Verify `truncate_with_tilde` Acceptance Criteria (Sub-Epic: 099_Acceptance Criteria & Roadmap (Part 10))

## Covered Requirements
- [AC-TYP-008], [AC-TYP-009]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/098_acceptance_criteria_roadmap_part_9_/02_implement_truncate_with_tilde_base.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Add the following unit tests to `crates/devs-tui/src/render_utils.rs`:
  - `test_truncate_with_tilde_exact_length`: [AC-TYP-008] Verify that `truncate_with_tilde("exactly-twenty-chars", 20)` returns `"exactly-twenty-chars"`.
  - `test_truncate_with_tilde_exceeds_length`: [AC-TYP-009] Verify that `truncate_with_tilde("this-is-a-very-long-stage-name", 20)` returns `"this-is-a-very-long~"` (exactly 20 characters, ending with `~`).
- [ ] Ensure tests are annotated with `// Covers: AC-TYP-008` and `// Covers: AC-TYP-009` respectively.

## 2. Task Implementation
- [ ] Ensure the existing implementation of `truncate_with_tilde` in `crates/devs-tui/src/render_utils.rs` correctly handles these cases.
- [ ] If necessary, refine the logic:
  ```rust
  pub fn truncate_with_tilde(s: &str, max_len: usize) -> String {
      let char_count = s.chars().count();
      if char_count <= max_len {
          // AC-TYP-008: return unchanged if exactly max_len, or right-pad if less (from AC-TYP-007)
          let mut result = s.to_string();
          while result.chars().count() < max_len {
              result.push(' ');
          }
          result
      } else {
          // AC-TYP-009: truncate to max_len - 1 and append ~
          let mut result: String = s.chars().take(max_len - 1).collect();
          result.push('~');
          result
      }
  }
  ```

## 3. Code Review
- [ ] Verify that `truncate_with_tilde` produces exactly `max_len` characters in all cases.
- [ ] Confirm that `AC-TYP-008` is met: if the string is already exactly `max_len`, no truncation or padding occurs (or padding 0 spaces).
- [ ] Confirm that `AC-TYP-009` is met: if the string exceeds `max_len`, it is truncated and marked with a tilde.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib render_utils::tests` and ensure all tests pass.

## 5. Update Documentation
- [ ] Ensure doc comments for `truncate_with_tilde` reflect these specific acceptance criteria.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure code quality.
- [ ] Verify requirement-to-test traceability using `.tools/verify_requirements.py`.
