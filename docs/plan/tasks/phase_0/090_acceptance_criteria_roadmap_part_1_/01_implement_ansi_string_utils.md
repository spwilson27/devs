# Task: Implement ANSI String Stripping Utilities (Sub-Epic: 090_Acceptance Criteria & Roadmap (Part 1))

## Covered Requirements
- [AC-ASCII-006], [AC-ASCII-007]

## Dependencies
- depends_on: []
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create test file `crates/devs-core/src/utils/strings_tests.rs` (or inline `#[cfg(test)] mod tests` in `crates/devs-core/src/utils/strings.rs`).
- [ ] **[AC-ASCII-006] `test_strip_ansi_pathological_performance`**: Construct the exact input `format!("\x1b[{}m", "1;".repeat(10_000))`. Assert `strip_ansi(&input) == ""`. Wrap the call in `std::time::Instant::now()` and assert elapsed < `Duration::from_millis(10)`. Add `// Covers: AC-ASCII-006` annotation.
- [ ] **[AC-ASCII-006] `test_strip_ansi_basic_sgr`**: Input `"\x1b[31mRed\x1b[0m"` -> `"Red"`. Add `// Covers: AC-ASCII-006`.
- [ ] **[AC-ASCII-006] `test_strip_ansi_empty_input`**: Input `""` -> `""`.
- [ ] **[AC-ASCII-006] `test_strip_ansi_no_codes`**: Input `"plain text"` -> `"plain text"`.
- [ ] **[AC-ASCII-006] `test_strip_ansi_only_codes`**: Input `"\x1b[1m\x1b[0m"` -> `""`.
- [ ] **[AC-ASCII-007] `test_strip_ansi_idempotent_parameterized`**: Build a `Vec<&str>` of at least 100 varied inputs spanning: (a) 30+ strings with no ANSI codes, (b) 30+ strings that are ANSI-only (no visible text), (c) 40+ strings mixing ANSI codes with visible text, including nested/overlapping sequences, partial sequences, and multi-byte UTF-8 characters interleaved with ANSI. For each input `s`, assert `strip_ansi(&strip_ansi(s)) == strip_ansi(s)`. Add `// Covers: AC-ASCII-007` annotation.
- [ ] **[AC-ASCII-007] `test_strip_ansi_idempotent_edge_cases`**: Include inputs with malformed escape sequences (e.g., `"\x1b["`, `"\x1b[999"`, lone `\x1b`), OSC sequences (`"\x1b]0;title\x07"`), and hyperlink sequences. Assert idempotency for each. Add `// Covers: AC-ASCII-007`.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/utils/mod.rs` with `pub mod strings;`.
- [ ] Create `crates/devs-core/src/utils/strings.rs`.
- [ ] Add `pub mod utils;` to `crates/devs-core/src/lib.rs`.
- [ ] Add `strip-ansi-escapes` crate (or `regex`) as a dependency in `crates/devs-core/Cargo.toml`. Prefer the `strip-ansi-escapes` crate for correctness; if it doesn't meet the 10ms performance budget for the pathological input, use a compiled `Regex` with `once_cell::sync::Lazy` (pattern: `\x1b\[[0-9;]*[a-zA-Z]|\x1b\][^\x07]*\x07|\x1b[^[\]].?`).
- [ ] Implement `pub fn strip_ansi(input: &str) -> String`:
  - If `input` contains no `\x1b` byte, return `input.to_string()` immediately (fast path, avoids allocation overhead for clean strings).
  - Otherwise, apply the ANSI stripping logic.
  - Must handle CSI sequences (`\x1b[...letter`), OSC sequences (`\x1b]...BEL`), and lone escape bytes gracefully.
  - Must complete within 10ms for the pathological input (`"\x1b[" + "1;" * 10_000 + "m"`) per AC-ASCII-006.

## 3. Code Review
- [ ] Verify regex (if used) is compiled exactly once via `Lazy<Regex>` — no per-call compilation.
- [ ] Verify no `unsafe` code.
- [ ] Verify fast-path: if input has no `\x1b`, no regex/parser is invoked and no new allocation occurs beyond the `to_string()`.
- [ ] Verify the 100-input idempotency test genuinely has 100+ distinct inputs (count them).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- utils::strings` and verify all tests pass.
- [ ] Specifically confirm the performance test completes in under 10ms (check test output or add `eprintln!` for elapsed time).

## 5. Update Documentation
- [ ] Add doc comment on `strip_ansi` explaining: (1) strips all ANSI escape sequences, (2) completes in O(n) time, (3) idempotent — `strip_ansi(strip_ansi(s)) == strip_ansi(s)` for all inputs.

## 6. Automated Verification
- [ ] Run `grep -rn "Covers: AC-ASCII-006" crates/devs-core/` — must return at least one match.
- [ ] Run `grep -rn "Covers: AC-ASCII-007" crates/devs-core/` — must return at least one match.
- [ ] Run `cargo test -p devs-core -- utils::strings --no-fail-fast 2>&1 | tail -5` and confirm `test result: ok`.
