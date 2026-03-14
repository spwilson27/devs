# Task: Implement ./do lint Command with Documentation Enforcement (Sub-Epic: 006_Quality Gate Enforcement)

## Covered Requirements
- [2_TAS-REQ-012], [2_TAS-REQ-013]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer — the `./do` script skeleton must exist; this task implements the `lint` subcommand)]

## 1. Initial Test Written
- [ ] Create `tests/test_lint_gate.sh` (POSIX sh) with the following test cases:
  - **Test 1 — fmt failure detection**: Create a temp Rust file with intentionally bad formatting, run `./do lint`, assert exit code is non-zero and stderr/stdout mentions `fmt`
  - **Test 2 — clippy failure detection**: Create a temp Rust file with a clippy warning (e.g., `let x = vec![1,2,3]; if x.len() == 0 {}`), run `./do lint`, assert exit code is non-zero
  - **Test 3 — missing_docs failure detection**: Create a public function without a doc comment in a crate with `missing_docs = "deny"`, run `cargo doc --no-deps --workspace` and confirm the grep pattern catches the warning
  - **Test 4 — lint order**: Verify that `./do lint` runs `cargo fmt --check --all` before `cargo clippy` before `cargo doc` (instrument by injecting failures at each step and confirming which step fails first)
  - **Test 5 — clean pass**: On the current clean workspace, `./do lint` exits 0
- [ ] Add `# Covers: 2_TAS-REQ-012, 2_TAS-REQ-013` comment at the top of the test file

## 2. Task Implementation
- [ ] Implement the `lint` subcommand in the `./do` script with the exact three-step sequence from [2_TAS-REQ-012]:
  1. `cargo fmt --check --all` — exit immediately on failure
  2. `cargo clippy --workspace --all-targets --all-features -- -D warnings` — exit immediately on failure
  3. `cargo doc --no-deps --workspace 2>&1 | grep -E "^warning|^error" && exit 1 || exit 0` — catches `missing_docs` violations and broken intra-doc links
- [ ] Create `rustfmt.toml` at repository root with the authoritative content:
  ```toml
  edition          = "2021"
  max_width        = 100
  ```
- [ ] Ensure `[workspace.lints.rust]` in root `Cargo.toml` includes `missing_docs = "deny"` to enforce [2_TAS-REQ-013]
- [ ] Ensure each existing crate's `Cargo.toml` has `[lints] workspace = true` to inherit the workspace lint table
- [ ] Each lint step prints the step name to stderr before execution (e.g., `echo "LINT: cargo fmt --check" >&2`) for traceability

## 3. Code Review
- [ ] Verify the `./do lint` implementation exits on first failure (no `set +e` or `|| true` patterns)
- [ ] Verify `missing_docs = "deny"` is at the workspace level, not per-crate
- [ ] Verify that the `cargo doc` grep pattern matches both `warning:` and `error:` prefixes from rustdoc output
- [ ] Confirm `rustfmt.toml` matches the authoritative spec exactly (no extra keys)

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/test_lint_gate.sh` and confirm all test cases pass
- [ ] Run `./do lint` on the current workspace and confirm exit code 0

## 5. Update Documentation
- [ ] Add doc comments to any new public items introduced (enforcing the very requirement being implemented)

## 6. Automated Verification
- [ ] Run `./do lint` and capture exit code — must be 0
- [ ] Temporarily remove a doc comment from a public item, run `./do lint`, confirm it fails, then restore the doc comment
