# Task: Implement UI String Truncation Logic (Sub-Epic: 090_Acceptance Criteria & Roadmap (Part 1))

## Covered Requirements
- [AC-ASCII-010]

## Dependencies
- depends_on: [01_implement_ansi_string_utils.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/utils/strings.rs`:
  - `test_truncate_short`: "Hello", limit 10 -> "Hello".
  - `test_truncate_exact`: [AC-ASCII-010] "1234567890", limit 10 -> "1234567890". (No tilde if exactly matching limit).
  - `test_truncate_over`: "12345678901", limit 10 -> "123456789~". (Should it be "123456789~" or "1234567890~"? AC-ASCII-010 says "return string if equal", implying a tilde is added *only* when it's longer).
  - `test_truncate_unicode`: "Emoji 🦀", limit 7 -> "Emoji ~" (Check byte count vs char count). Use character count for UI truncation.

## 2. Task Implementation
- [ ] Implement `truncate_with_tilde(input: &str, limit: usize) -> String` in `crates/devs-core/src/utils/strings.rs`.
  - Check `input.chars().count()` against `limit`.
  - If it exceeds `limit`, return a string of first `limit - 1` characters plus a `~`.
  - If it is equal to `limit`, return the original string [AC-ASCII-010].
  - If it is shorter, return the original string.

## 3. Code Review
- [ ] Ensure the function uses `char` count, not byte count, for correctly truncating Unicode strings.
- [ ] Confirm no tilde is added if the string matches the limit exactly [AC-ASCII-010].
- [ ] Check for edge cases like a limit of 0 or 1.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib utils::strings` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments explaining the exact match behavior as per [AC-ASCII-010].

## 6. Automated Verification
- [ ] Run `grep -r "AC-ASCII-010" crates/devs-core/` to verify traceability.
