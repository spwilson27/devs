# Task: Implement UI String Truncation with Tilde (Sub-Epic: 090_Acceptance Criteria & Roadmap (Part 1))

## Covered Requirements
- [AC-ASCII-010]

## Dependencies
- depends_on: ["01_implement_ansi_string_utils.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Add unit tests to `crates/devs-core/src/utils/strings.rs` (or its test module):
- [ ] **[AC-ASCII-010] `test_truncate_exact_match`**: `truncate_with_tilde("exactly-20-chars-str", 20)` returns `"exactly-20-chars-str"` (no tilde). The input is exactly 20 characters — verify with `assert_eq!("exactly-20-chars-str".chars().count(), 20)` as a precondition in the test. Add `// Covers: AC-ASCII-010`.
- [ ] `test_truncate_shorter_than_limit`: `truncate_with_tilde("short", 20)` returns `"short"`.
- [ ] `test_truncate_longer_than_limit`: `truncate_with_tilde("this string is definitely longer than twenty characters", 20)` returns a 20-char string ending with `~`. Assert `result.chars().count() == 20` and `result.ends_with('~')`.
- [ ] `test_truncate_limit_one`: `truncate_with_tilde("ab", 1)` returns `"~"`.
- [ ] `test_truncate_limit_zero`: `truncate_with_tilde("ab", 0)` returns `""`.
- [ ] `test_truncate_empty_string`: `truncate_with_tilde("", 5)` returns `""`.
- [ ] `test_truncate_unicode`: `truncate_with_tilde("Hello\u{1F980}World", 7)` — verify char-count-based truncation, not byte-count. The result should be 7 chars ending with `~`.

## 2. Task Implementation
- [ ] Implement `pub fn truncate_with_tilde(input: &str, limit: usize) -> String` in `crates/devs-core/src/utils/strings.rs`.
- [ ] Logic:
  - If `limit == 0`, return `String::new()`.
  - Let `char_count = input.chars().count()`.
  - If `char_count <= limit`, return `input.to_string()` (covers the exact-match case per AC-ASCII-010).
  - Otherwise, return `input.chars().take(limit - 1).collect::<String>() + "~"`.
- [ ] Export the function via `pub use` in `crates/devs-core/src/utils/mod.rs` if not already accessible.

## 3. Code Review
- [ ] Verify truncation uses `chars().count()` (Unicode scalar count), NOT `len()` (byte count).
- [ ] Verify exact-match case returns original string without tilde — this is the core of AC-ASCII-010.
- [ ] Verify edge cases: limit=0 returns empty, limit=1 with non-empty input returns `"~"`.
- [ ] No `unsafe` code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- utils::strings` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `truncate_with_tilde` explaining: truncates to `limit` characters, appending `~` as the last character when truncation occurs. If input length equals limit exactly, returns input unchanged.

## 6. Automated Verification
- [ ] Run `grep -rn "Covers: AC-ASCII-010" crates/devs-core/` — must return at least one match.
- [ ] Run `cargo test -p devs-core -- utils::strings --no-fail-fast 2>&1 | tail -5` and confirm `test result: ok`.
