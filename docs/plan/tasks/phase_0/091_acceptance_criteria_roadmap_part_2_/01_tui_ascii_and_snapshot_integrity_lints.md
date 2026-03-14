# Task: TUI ASCII-Only Strings and Snapshot Integrity CI Lints (Sub-Epic: 091_Acceptance Criteria & Roadmap (Part 2))

## Covered Requirements
- [AC-ASCII-018], [AC-ASCII-019], [AC-ASCII-020]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/lint_ascii_snapshot_integrity.sh` (POSIX sh) that exercises each lint in isolation:
  - **AC-ASCII-018 test**: create a temp directory with `crates/devs-tui/src/strings.rs` containing `pub const LABEL: &str = "©";`. Run the lint check and assert it exits non-zero. Then replace content with `pub const LABEL: &str = "ok";` and assert the lint exits zero.
  - **AC-ASCII-019 test**: create `crates/devs-tui/tests/snapshots/bad.txt` containing a literal ESC byte (`printf '\x1b[31mred\x1b[0m'`). Run the lint check and assert non-zero. Remove the file and assert zero.
  - **AC-ASCII-020 test**: create `crates/devs-tui/tests/snapshots/box.txt` containing `─` (U+2500). Run the lint and assert non-zero. Replace with `-` (ASCII hyphen) and assert zero.
- [ ] Each sub-test must print the requirement ID it verifies (e.g., `echo "# Verifying AC-ASCII-018"`).
- [ ] Add `// Covers: AC-ASCII-018, AC-ASCII-019, AC-ASCII-020` annotation comment at the top of the test script.

## 2. Task Implementation
- [ ] In the `./do` script's `lint` subcommand, add three sequential grep-based checks that run **only if the target path exists** (to avoid failures during early bootstrap before the TUI crate is created):
  1. **[AC-ASCII-018]**: `grep -P '[^\x00-\x7F]' crates/devs-tui/src/strings.rs` — if the file exists and grep finds a match, print `"FAIL [AC-ASCII-018]: Non-ASCII byte found in crates/devs-tui/src/strings.rs"` with the matching line number and content, then set a failure flag.
  2. **[AC-ASCII-019]**: `grep -rP '\x1b' crates/devs-tui/tests/snapshots/` — if the snapshots directory exists and grep finds a match, print `"FAIL [AC-ASCII-019]: ANSI escape sequence found in snapshot file"` with the filename and line, then set a failure flag.
  3. **[AC-ASCII-020]**: `grep -rP '[\x{2500}-\x{257F}]' crates/devs-tui/tests/snapshots/` — if the snapshots directory exists and grep finds a match, print `"FAIL [AC-ASCII-020]: Unicode box-drawing character found in snapshot file"` with details, then set a failure flag.
- [ ] If any failure flag is set, `./do lint` must exit with a non-zero status code.
- [ ] Use `grep -n` to include line numbers in all error output for developer convenience.
- [ ] Ensure these checks run after existing lint steps (cargo fmt, clippy) but before the final exit status aggregation.

## 3. Code Review
- [ ] Verify `grep -P` (PCRE mode) is used, as required by the spec — standard `grep -E` cannot match the required Unicode ranges.
- [ ] Confirm the AC-ASCII-018 regex `[^\x00-\x7F]` correctly rejects all bytes outside 7-bit ASCII (0x00–0x7F inclusive), not just printable ASCII.
- [ ] Confirm the AC-ASCII-020 regex covers the full box-drawing block U+2500 through U+257F (128 characters).
- [ ] Verify that each check is guarded by a file/directory existence test (`[ -f ... ]` / `[ -d ... ]`) so the lint passes cleanly when the TUI crate does not yet exist.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/lint_ascii_snapshot_integrity.sh` and confirm all sub-tests pass.
- [ ] Run `./do lint` on the current workspace (with no TUI crate present) and confirm it passes (checks are skipped gracefully).

## 5. Update Documentation
- [ ] Add inline comments in the `./do` script next to each check referencing the requirement ID (e.g., `# [AC-ASCII-018] Non-ASCII byte lint`).

## 6. Automated Verification
- [ ] Run `bash tests/lint_ascii_snapshot_integrity.sh` as the definitive pass/fail gate.
- [ ] Run `grep -c 'AC-ASCII-018\|AC-ASCII-019\|AC-ASCII-020' ./do` and confirm count >= 3, proving the requirement IDs are annotated in the script.
