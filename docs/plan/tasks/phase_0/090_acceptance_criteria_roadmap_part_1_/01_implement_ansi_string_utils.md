# Task: Implement ANSI String Stripping Utilities (Sub-Epic: 090_Acceptance Criteria & Roadmap (Part 1))

## Covered Requirements
- [AC-ASCII-006], [AC-ASCII-007]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/008_proto_core_foundation/03_setup_devs_core_foundation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/utils/strings.rs`:
  - `test_strip_ansi_basic`: Simple color codes like `\x1b[31mRed\x1b[0m` should become `Red`.
  - `test_strip_ansi_efficient`: [AC-ASCII-006] Test with a very long string containing many complex ANSI sequences (CSI, SGR, etc.) to ensure it doesn't hang or exceed performance budget.
  - `test_strip_ansi_idempotency`: [AC-ASCII-007] `strip_ansi(strip_ansi(input))` must be equal to `strip_ansi(input)`.
  - `test_strip_ansi_no_code`: String without ANSI codes remains unchanged.
  - `test_strip_ansi_partial_code`: Ensure it correctly handles (or safely ignores) partial/malformed codes if they look like sequences.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/utils/mod.rs` and `crates/devs-core/src/utils/strings.rs`.
- [ ] Implement `strip_ansi(input: &str) -> String` using a robust and efficient approach (e.g., `vte` parser or a well-tuned regex).
  - Use `regex` if performant enough, or a manual byte-by-byte scan for higher performance if required by AC-ASCII-006.
  - Ensure it covers standard SGR (Select Graphic Rendition) and other common CSI (Control Sequence Introducer) sequences.
- [ ] Add `pub mod utils;` to `crates/devs-core/src/lib.rs`.
- [ ] Ensure that `devs-core`'s `Cargo.toml` includes `regex` or other necessary crates for this implementation.

## 3. Code Review
- [ ] Verify that the regex or parser is compiled/initialized only once (e.g., using `once_cell` or `lazy_static`).
- [ ] Ensure the implementation is safe (no `unsafe` code as per Phase 0 guidelines).
- [ ] Check for any memory allocations that could be avoided (e.g., if the string has no ANSI codes, avoid allocating a new String).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib utils::strings` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `strip_ansi` explaining its performance characteristics and idempotency as per [AC-ASCII-006] and [AC-ASCII-007].

## 6. Automated Verification
- [ ] Run `grep -r "AC-ASCII-006" crates/devs-core/` and `grep -r "AC-ASCII-007" crates/devs-core/` to verify traceability.
