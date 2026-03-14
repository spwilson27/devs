# Task: Clippy Suppression Reason Enforcement (Sub-Epic: 073_Detailed Domain Specifications (Part 38))

## Covered Requirements
- [2_TAS-REQ-442], [2_TAS-REQ-444]

## Dependencies
- depends_on: ["01_implement_clippy_and_unsafe_lints.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/lint/test_clippy_suppression_needs_reason.sh` (POSIX sh) that:
    - Creates a temporary crate under `target/test_tmp/suppress_noreason/` with a `lib.rs` containing:
      ```rust
      #[allow(clippy::needless_return)]
      fn foo() -> i32 { return 1; }
      ```
      (No `// REASON:` comment preceding the allow attribute.)
    - Runs `./do lint` and asserts exit code is non-zero.
    - Asserts output mentions missing reason or the suppression check failing.
    - Cleans up.
- [ ] Create `tests/lint/test_clippy_suppression_with_reason_passes.sh` that:
    - Creates a temporary crate with a `lib.rs` containing:
      ```rust
      // REASON: Return is needed for clarity in this context
      #[allow(clippy::needless_return)]
      fn foo() -> i32 { return 1; }
      ```
    - Runs `./do lint` and asserts this specific check passes (exit code 0 assuming no other failures).
    - Cleans up.
- [ ] Create `tests/lint/test_clippy_suppression_module_level.sh` that:
    - Tests the module-level form `#![allow(clippy::...)]` without a `// REASON:` comment.
    - Asserts `./do lint` exits non-zero.
    - Tests with `// REASON:` on the preceding line and asserts it passes.
    - Cleans up.

## 2. Task Implementation
- [ ] Implement a suppression reason checker in `cmd_lint()`. This can be:
    - A `grep`/`awk` pipeline, a small Python function, or a standalone script (e.g., `.tools/check_clippy_reasons.sh`).
- [ ] The checker must scan all `.rs` files in workspace `src/` directories (excluding `target/` and generated code directories like `src/gen/`).
- [ ] For every line matching the regex `#\[allow(clippy::` or `#!\[allow(clippy::`, check that at least one of the preceding non-blank lines (within 3 lines) contains the string `// REASON:` ([2_TAS-REQ-442]).
- [ ] If any `#[allow(clippy::...)]` or `#![allow(clippy::...)]` lacks a nearby `// REASON:` comment, print the file path and line number, and mark the step as failed.
- [ ] Append the suppression check result to the `cmd_lint()` failure aggregator. Do NOT exit early ([2_TAS-REQ-444]).
- [ ] Place this step after clippy and doc lint in the `cmd_lint()` sequence (order within sequence is flexible as long as all steps run).

## 3. Code Review
- [ ] Verify the regex/pattern matches both `#[allow(clippy::...]` and `#![allow(clippy::...]` forms.
- [ ] Confirm `target/` and `src/gen/` directories are excluded from the scan.
- [ ] Verify the "preceding line" check is not overly strict (allows blank lines between the reason comment and the attribute) but is not overly loose (limit to 3 preceding lines).
- [ ] Confirm failure aggregation is consistent with tasks 01 and 02.
- [ ] Verify the check does NOT trigger on `#[deny(clippy::...)]` or `#[warn(clippy::...)]` — only `allow`.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/lint/test_clippy_suppression_needs_reason.sh` and confirm it passes.
- [ ] Run `sh tests/lint/test_clippy_suppression_with_reason_passes.sh` and confirm it passes.
- [ ] Run `sh tests/lint/test_clippy_suppression_module_level.sh` and confirm it passes.
- [ ] Run `./do lint` on the clean codebase and confirm exit 0.

## 5. Update Documentation
- [ ] Add inline comments in `cmd_lint()` or the checker script referencing `[2_TAS-REQ-442]` and `[2_TAS-REQ-444]`.

## 6. Automated Verification
- [ ] Run `./do lint 2>&1 | grep -qi 'reason\|suppression'` to confirm the check is being executed and reporting.
- [ ] Run `grep -rn 'allow(clippy::' --include='*.rs' . | grep -v target/ | grep -v 'src/gen/'` and manually verify each hit has a `// REASON:` comment (or confirm there are zero hits on a clean codebase).
