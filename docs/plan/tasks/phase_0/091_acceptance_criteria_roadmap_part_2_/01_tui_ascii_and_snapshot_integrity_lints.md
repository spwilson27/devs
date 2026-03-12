# Task: TUI ASCII and Snapshot Integrity Lints (Sub-Epic: 091_Acceptance Criteria & Roadmap (Part 2))

## Covered Requirements
- [AC-ASCII-018], [AC-ASCII-019], [AC-ASCII-020]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a temporary shell script `tests/test_ascii_lints.sh` that:
    - Creates a fake `crates/devs-tui/src/strings.rs` containing a non-ASCII character (e.g., `let s = "©";`).
    - Runs `./do lint` and asserts it fails with an error message pointing to `strings.rs`.
    - Creates a fake snapshot directory `crates/devs-tui/tests/snapshots/` and adds a file containing an ANSI escape sequence (`\x1b`).
    - Runs `./do lint` and asserts it fails.
    - Adds a Unicode box-drawing character (`\x{2500}`) to a snapshot file.
    - Runs `./do lint` and asserts it fails.
- [ ] Ensure this script is executable and can be run during verification.

## 2. Task Implementation
- [ ] Modify the `./do` script (or the underlying Python script if `lint` is delegated) to include the following checks:
    - `grep -P '[^\x00-\x7F]' crates/devs-tui/src/strings.rs` for [AC-ASCII-018].
    - `grep -rP '\x1b' crates/devs-tui/tests/snapshots/` for [AC-ASCII-019].
    - `grep -rP '[\x{2500}-\x{257F}]' crates/devs-tui/tests/snapshots/` for [AC-ASCII-020].
- [ ] The `./do lint` command should return a non-zero exit code if any of these greps find a match.
- [ ] Add meaningful error messages to the output so the user knows which file and which line failed the ASCII/Snapshot integrity check.
- [ ] Ensure these checks are only performed if the relevant directories/files exist (to prevent errors during early bootstrap).

## 3. Code Review
- [ ] Verify that `grep -P` (PCRE) is used consistently as required by the specifications.
- [ ] Ensure the regex for [AC-ASCII-018] correctly identifies any byte outside the 7-bit ASCII range (U+0000–U+007F).
- [ ] Ensure the regex for [AC-ASCII-020] covers the complete Unicode box-drawing block (U+2500–U+257F).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on a clean workspace and ensure it passes (if `strings.rs` and snapshots are clean or missing).
- [ ] Run the `tests/test_ascii_lints.sh` script created in step 1.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the addition of these lints to the TUI development workflow.
- [ ] Add a comment in `crates/devs-tui/src/strings.rs` (once created) referencing [AC-ASCII-018] to warn future developers.

## 6. Automated Verification
- [ ] The `tests/test_ascii_lints.sh` script serves as the primary automated verification.
- [ ] Run `./tools/verify_requirements.py` to ensure the requirement annotations are correctly mapped.
