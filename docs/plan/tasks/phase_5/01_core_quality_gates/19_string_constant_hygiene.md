# Task: String Constant Hygiene & Compile-Time Enforcement (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [AC-STR-001], [AC-STR-002], [AC-STR-003], [AC-STR-004], [AC-STR-005], [AC-STR-006], [AC-STR-007], [AC-STR-008], [AC-STR-009], [AC-STR-010], [AC-STR-011], [AC-STR-012], [AC-STR-013], [AC-STR-014], [AC-STR-015]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui, devs-cli, devs-mcp]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/string_constants.rs` with tests that:
  1. Assert `STATUS_*` constants are exactly 4 bytes via `const` assertion ([AC-STR-001]).
  2. Assert `DAG_*` constants are exactly 1 byte via `const` assertion ([AC-STR-002]).
  3. Assert `STATUS_*` 4-byte constraint at test time ([AC-STR-003]).
  4. Assert `DAG_*` 1-byte constraint at test time ([AC-STR-004]).
  5. Assert `ERR_*` constants begin with machine-stable prefixes ([AC-STR-006]).
  6. Assert all twelve mandatory constants in `devs-tui/src/strings.rs` are present with correct values ([AC-STR-010]).
  7. Assert `STATUS_RUN_` has value `"RUN "` (with trailing space) for 4-char fixed width ([AC-STR-012]).
  8. Annotate all with `// Covers:`.
- [ ] Create `crates/devs-cli/tests/string_constants.rs`:
  1. Assert all mandatory `CMD_*` constants match Clap command tree ([AC-STR-011]).
  2. Annotate with `// Covers: [AC-STR-011]`.
- [ ] Create `tests/test_string_lint.py`:
  1. Assert `./do lint` exits non-zero when a `.rs` file outside `strings.rs` contains user-visible string literals ([AC-STR-005]).
  2. Assert `./do lint` exits non-zero if `strings.rs` has unrecognized constant names ([AC-STR-007], [AC-STR-008]).
  3. Assert `cargo doc` produces zero warnings for `strings.rs` constants ([AC-STR-009]).
  4. Assert no non-ASCII bytes in any `strings.rs` constant ([AC-STR-013]).
  5. Assert cross-crate string constant consistency ([AC-STR-014], [AC-STR-015]).
  6. Annotate with `# Covers:`.
- [ ] Run tests to confirm red:
  ```
  cargo test -p devs-tui --test string_constants -- --nocapture 2>&1 | tee /tmp/strings_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Create `crates/devs-tui/src/strings.rs`** with all mandatory constants ([AC-STR-010]):
  - `STATUS_*` constants: exactly 4 bytes each, enforced by `const` assertions ([AC-STR-001]).
  - `DAG_*` constants: exactly 1 byte each, enforced by `const` assertions ([AC-STR-002]).
  - `ERR_*` constants: machine-stable prefixes ([AC-STR-006]).
  - `STATUS_RUN_` = `"RUN "` with trailing space ([AC-STR-012]).
  - All constants have `///` doc comments ([AC-STR-009]).
  - No non-ASCII bytes (U+0080–U+FFFF) in any constant ([AC-STR-013]).
- [ ] **Create `crates/devs-cli/src/strings.rs`** with `CMD_*` constants matching Clap command tree ([AC-STR-011]).
- [ ] **Create `crates/devs-mcp/src/strings.rs`** (if needed for bridge constants) ([AC-STR-008]).
- [ ] **Update `./do lint`** to enforce string hygiene ([AC-STR-005]):
  - Scan `.rs` files outside `strings.rs` for user-visible string literals.
  - Scan `strings.rs` files for unrecognized constant name prefixes ([AC-STR-007], [AC-STR-008]).
  - Scan for non-ASCII bytes in `strings.rs` ([AC-STR-013]).
- [ ] **Implement compile-time `const` assertions** ([AC-STR-001], [AC-STR-002]):
  ```rust
  const _: () = assert!(STATUS_RUNNING.len() == 4);
  const _: () = assert!(DAG_ARROW.len() == 1);
  ```

## 3. Code Review
- [ ] Verify all `STATUS_*` are exactly 4 bytes.
- [ ] Verify all `DAG_*` are exactly 1 byte.
- [ ] Verify no non-ASCII bytes in any constant.
- [ ] Verify `// Covers:` annotations present for all 15 requirement IDs.
- [ ] Confirm all `pub const` have `///` doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run string constant tests:
  ```
  cargo test -p devs-tui --test string_constants -- --nocapture
  cargo test -p devs-cli --test string_constants -- --nocapture
  ```
- [ ] Run string lint tests:
  ```
  pytest tests/test_string_lint.py -v
  ```

## 5. Update Documentation
- [ ] Document string constant conventions in `docs/architecture/tui.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_strings.txt
  ```
- [ ] Verify no non-ASCII in strings.rs:
  ```
  grep -P '[\x80-\xff]' crates/devs-tui/src/strings.rs crates/devs-cli/src/strings.rs crates/devs-mcp/src/strings.rs && echo "FAIL: non-ASCII found" || echo "OK: ASCII only"
  ```
