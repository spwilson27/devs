# Task: Clippy Suppressed Reason Requirement (Sub-Epic: 073_Detailed Domain Specifications (Part 38))

## Covered Requirements
- [2_TAS-REQ-442], [2_TAS-REQ-444]

## Dependencies
- depends_on: [02_implement_documentation_lint_enforcement.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_clippy_suppression_lint.sh` that:
    - Creates a temporary Rust file with `#[allow(clippy::all)]` and NO `// REASON:` comment.
    - Runs `./do lint` and verifies it exits with a non-zero status.
    - Creates a temporary Rust file with `#[allow(clippy::all)]` and a preceding `// REASON: valid reason here` comment.
    - Runs `./do lint` and verifies it exits with a zero status (or continues past this check).
- [ ] Ensure the script cleans up the temporary files.

## 2. Task Implementation
- [ ] Implement a check for clippy suppression reason in `cmd_lint` (using regex or a simple file scanner).
- [ ] The check must ensure that for every occurrence of `#[allow(clippy::...)]`, the immediately preceding line (ignoring whitespace) contains the string `// REASON:` ([2_TAS-REQ-442]).
- [ ] If any such suppression is found without a reason, treat it as a blocking lint error.
- [ ] Ensure this check runs in sequence as part of the `./do lint` command ([2_TAS-REQ-444]).

## 3. Code Review
- [ ] Verify that the check correctly identifies all forms of clippy suppression (e.g., `#[allow(clippy::...)], #![allow(clippy::...)]`).
- [ ] Confirm that the logic for identifying the preceding line is robust to comments or whitespace between the reason and the allow attribute.
- [ ] Ensure that `cmd_lint` correctly aggregates the failure.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_clippy_suppression_lint.sh` and ensure it passes.
- [ ] Run `./do lint` on the current codebase and ensure it passes.

## 5. Update Documentation
- [ ] Document the requirement for `// REASON:` comments in the development guide, explaining that any clippy suppression must be justified.

## 6. Automated Verification
- [ ] Run `./do lint` and verify the output shows the suppressed reason check being performed.
- [ ] Inspect the `./do` script to confirm the presence of the suppression reason check logic.
