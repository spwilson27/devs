# Task: Workspace Lint, Formatting, and Doc-Comment Enforcement (Sub-Epic: 005_Verification Infrastructure)

## Covered Requirements
- [1_PRD-REQ-048], [1_PRD-BR-006], [1_PRD-BR-007]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer — `./do lint` must be implemented before this task can validate)]

## 1. Initial Test Written
- [ ] Create `tests/lint/verify_lint_enforcement.sh` (POSIX sh) with three negative-test scenarios. Each scenario creates a temporary crate in the workspace, runs `./do lint`, asserts failure, then cleans up:
    1. **Missing doc comment** ([1_PRD-BR-006]): Create a crate with a public function `pub fn undocumented() {}` that lacks a `///` doc comment. Run `./do lint` → must exit non-zero. Verify stderr/stdout contains `missing_docs` or the function name in the error.
    2. **Formatting violation** ([1_PRD-BR-007]): Create a crate with badly formatted code (e.g., `fn  bad_format(  ) {  }`). Run `./do lint` → must exit non-zero. Verify output references `rustfmt` or "Diff in" indicating a formatting issue.
    3. **Clippy violation** ([1_PRD-REQ-048]): Create a crate with a clippy-detectable issue (e.g., `let mut x = 5; let _ = x;` triggering `unused_mut` or similar). Run `./do lint` → must exit non-zero. Verify output references `clippy`.
- [ ] Create `tests/lint/verify_lint_pass.sh` that runs `./do lint` on the actual workspace (with all code compliant) and asserts exit code 0.

## 2. Task Implementation
- [ ] Ensure the root `Cargo.toml` workspace lint table includes ([2_TAS-REQ-004A]):
    ```toml
    [workspace.lints.rust]
    missing_docs = "warn"  # promoted to deny by clippy -D warnings
    unsafe_code = "deny"

    [workspace.lints.clippy]
    all = { level = "deny", priority = -1 }
    ```
- [ ] Ensure every workspace crate's `Cargo.toml` contains `[lints] workspace = true` to inherit these lints.
- [ ] Verify `./do lint` executes the following in order ([2_TAS-REQ-012B]):
    1. `cargo fmt --check --all` — formatting check ([1_PRD-BR-007]).
    2. `cargo clippy --workspace --all-targets --all-features -- -D warnings` — lint check ([1_PRD-REQ-048], [1_PRD-BR-007]).
    3. `cargo doc --no-deps --workspace` — doc-comment completeness check ([1_PRD-BR-006]). Must fail on missing docs warnings when `missing_docs` lint is active.
    4. Additional lint steps (dependency audit, BOOTSTRAP-STUB checks, cargo tree) as defined by [2_TAS-REQ-012].
- [ ] Fix all existing lint, formatting, and doc-comment violations in the current workspace so `./do lint` passes cleanly.
- [ ] Ensure `./do lint` stops on first category failure and reports which step failed ([2_TAS-REQ-012C]).

## 3. Code Review
- [ ] Verify that `missing_docs` lint is active for all workspace crates — every `pub` item must have a doc comment.
- [ ] Verify that `unsafe_code = "deny"` is set workspace-wide ([2_TAS-REQ-004B]).
- [ ] Verify the `./do lint` step order matches [2_TAS-REQ-012B]: fmt → clippy → doc → audit → BOOTSTRAP-STUB → cargo tree.
- [ ] Confirm no crate overrides the workspace lints to weaken enforcement (e.g., no `missing_docs = "allow"` in individual crate manifests).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the full workspace and confirm exit code 0.
- [ ] Run `bash tests/lint/verify_lint_enforcement.sh` and confirm all three negative scenarios correctly detect violations (exit code 0 from the test script).
- [ ] Run `bash tests/lint/verify_lint_pass.sh` and confirm exit code 0.

## 5. Update Documentation
- [ ] Ensure CLAUDE.md or equivalent documents the lint policy: all public items need doc comments, all code must be formatted, clippy must pass with `-D warnings`.

## 6. Automated Verification
- [ ] Run `./do lint && echo "PASS" || echo "FAIL"` — must print "PASS".
- [ ] Run `bash tests/lint/verify_lint_enforcement.sh && echo "PASS" || echo "FAIL"` — must print "PASS".
- [ ] Run `grep -r 'workspace = true' crates/*/Cargo.toml | wc -l` — count must equal the number of workspace crates (all inherit lints).
