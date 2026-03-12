# Task: Linting and Documentation Quality Gate (Sub-Epic: 006_Quality Gate Enforcement)

## Covered Requirements
- [2_TAS-REQ-012], [2_TAS-REQ-012A], [2_TAS-REQ-012B], [2_TAS-REQ-012C], [2_TAS-REQ-012D], [2_TAS-REQ-013]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script test in `tests/test_lint_behavior.sh` that verifies:
    - `./do lint` fails if `cargo fmt --check` fails.
    - `./do lint` fails if `cargo clippy` has warnings.
    - `./do lint` fails if any public item is missing documentation (using `missing_docs = "deny"`).
    - `./do lint` fails if a clippy suppression is missing a `// REASON:` comment [2_TAS-REQ-012D].

## 2. Task Implementation
- [ ] Implement the `lint` subcommand in the `./do` script [2_TAS-REQ-012].
- [ ] Ensure `lint` runs `cargo fmt --check --all` [2_TAS-REQ-012C].
- [ ] Ensure `lint` runs `cargo clippy --workspace --all-targets --all-features -- -D warnings` [2_TAS-REQ-012C].
- [ ] Ensure `lint` runs `cargo doc --no-deps --workspace 2>&1 | grep -E "^warning|^error" && exit 1 || exit 0` to enforce mandatory docs [2_TAS-REQ-012] [2_TAS-REQ-013].
- [ ] Implement the clippy suppression check by `grep`ing for `#[allow(clippy::` without a trailing `// REASON:` comment [2_TAS-REQ-012D].
- [ ] Configure `rustfmt.toml` at the repository root as per [2_TAS-REQ-012A].
- [ ] Configure `[workspace.lints]` in the root `Cargo.toml` with `missing_docs = "deny"` [2_TAS-REQ-004A] [2_TAS-REQ-013].

## 3. Code Review
- [ ] Verify that `lint` fails fast (exits on the first failure in the sequence).
- [ ] Ensure `missing_docs = "deny"` applies workspace-wide.
- [ ] Verify that the `grep` for clippy suppressions is robust and handles whitespace correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/test_lint_behavior.sh`.
- [ ] Run `./do lint` and ensure it passes on the current clean state.

## 5. Update Documentation
- [ ] Document the linting requirements in the developer's guide/README.

## 6. Automated Verification
- [ ] Run `./do lint` after intentionally breaking a format, clippy, or doc rule to verify detection.
