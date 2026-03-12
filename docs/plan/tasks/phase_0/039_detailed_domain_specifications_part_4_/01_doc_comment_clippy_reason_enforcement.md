# Task: Doc Comment and Clippy Reason Enforcement (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-049]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test script `tests/verify_doc_clippy_rules.sh` that:
    - Creates a temporary Rust file without a doc comment on a public item and ensures `./do lint` fails.
    - Creates a temporary Rust file with `#[allow(clippy::all)]` but NO `// REASON:` comment and ensures `./do lint` fails.
    - Verifies that `cargo doc` is run as part of the linting process to catch broken links or missing docs.

## 2. Task Implementation
- [ ] Update the workspace-level `Cargo.toml` to include `[workspace.lints.rust]` with `missing_docs = "deny"` [1_PRD-REQ-049].
- [ ] Update the workspace-level `Cargo.toml` to include `[workspace.lints.clippy]` with standard lints.
- [ ] Enhance the `./do lint` command to specifically check for `// REASON:` comments following any `#[allow(clippy::...)]` attribute.
- [ ] Ensure `./do lint` runs `cargo doc --workspace --no-deps --all-features` and fails on warnings or errors [1_PRD-REQ-049].
- [ ] Document this requirement in the project's developer guide or `CONTRIBUTING.md` if it exists.

## 3. Code Review
- [ ] Verify that the `missing_docs` lint is applied to all crates in the workspace.
- [ ] Ensure that the `// REASON:` check is robust and doesn't trigger on false positives (e.g., inside strings or comments).
- [ ] Verify that `cargo doc` is running with flags that enforce completeness (e.g., failing on broken intra-doc links).

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_doc_clippy_rules.sh` and ensure all failure cases are detected.
- [ ] Run `./do lint` on the current codebase and fix any existing issues to ensure a clean baseline.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the enforcement of doc comments and clippy reasons.

## 6. Automated Verification
- [ ] Run `./do lint` after intentionally removing a doc comment or clippy reason to verify the gate is working.
