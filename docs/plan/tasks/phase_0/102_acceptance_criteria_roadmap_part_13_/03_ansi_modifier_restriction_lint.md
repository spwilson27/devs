# Task: ANSI Modifier Restriction Lint (Sub-Epic: 102_Acceptance Criteria & Roadmap (Part 13))

## Covered Requirements
- [AC-TYP-027]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/test_ansi_lint.sh` that verifies:
    - `./do lint` fails if any `.rs` file in `devs-tui/src/` contains the literal string `"ITALIC"`, `"UNDERLINED"`, `"BLINK"`, or `"RAPID_BLINK"` (representing forbidden ANSI modifiers in the TUI [AC-TYP-027]).

## 2. Task Implementation
- [ ] Create a Python script `.tools/check_ansi_modifiers.py` that recursively scans the `devs-tui/src/` directory.
- [ ] The script should `grep` for the forbidden modifier tokens and report any violations.
- [ ] Update the `lint` command in the root `./do` script to invoke `.tools/check_ansi_modifiers.py`.
- [ ] Ensure the script exits with non-zero status upon finding a violation.

## 3. Code Review
- [ ] Ensure the scan is limited specifically to `devs-tui` as other crates (like `devs-cli` or `devs-server`) may not have this restriction.
- [ ] Verify that the script ignores comments (if possible) or is robust against false positives.
- [ ] Confirm that the lint check is included in the full `./do presubmit` cycle.

## 4. Run Automated Tests to Verify
- [ ] Execute `sh tests/test_ansi_lint.sh`.
- [ ] Manually add `ITALIC` to a `devs-tui` file and ensure `./do lint` fails.

## 5. Update Documentation
- [ ] Document the restriction on ANSI modifiers in the TUI development guidelines.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure it passes on the current codebase.
