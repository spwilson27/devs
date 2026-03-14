# Task: Enforce Workspace-Wide Unsafe Code Prohibition (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-452]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a test that runs `grep -rn 'unsafe' --include='*.rs'` across all workspace crate `src/` directories and asserts zero matches. The grep pattern must match the keyword `unsafe` as a whole word (`\bunsafe\b`) to avoid false positives from comments like "thread-unsafe" in documentation.
- [ ] Create a second test that verifies the workspace-level `Cargo.toml` or each crate's `lib.rs`/`main.rs` contains `#![deny(unsafe_code)]` as a top-level lint attribute, ensuring the compiler itself rejects unsafe code.
- [ ] Both tests must produce clear failure messages identifying the exact file and line number of any violation.

## 2. Task Implementation
- [ ] Add `#![deny(unsafe_code)]` to the root of every crate's `lib.rs` or `main.rs` if not already present. Alternatively, configure this as a workspace-level lint in the root `Cargo.toml` under `[workspace.lints.rust]`: `unsafe_code = "deny"`.
- [ ] Add a grep-based check to `./do lint` that scans all `.rs` files in the workspace for the `unsafe` keyword (whole word). If found, exit non-zero: `"ERROR [2_TAS-REQ-452]: unsafe code found at <file>:<line>. All workspace code must be safe Rust."`.
- [ ] Ensure `cargo clippy` is already configured with `unsafe_code = "deny"` so compilation also enforces this.

## 3. Code Review
- [ ] Verify the grep pattern uses word boundaries to avoid matching `unsafe` inside strings, comments about "thread-unsafe", or the deny attribute itself (`deny(unsafe_code)` contains the word but is the enforcement mechanism, not a violation — the pattern must exclude `deny(unsafe_code)` and `forbid(unsafe_code)` lines).
- [ ] Confirm both the static grep check and the compiler-level deny are in place (belt and suspenders).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm exit 0.
- [ ] Run `cargo clippy --workspace` and confirm no `unsafe_code` warnings.
- [ ] Temporarily add `unsafe {}` to a test file, run `./do lint`, confirm non-zero exit. Run `cargo clippy`, confirm compilation error. Revert.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-452` annotation to the lint check and/or the deny attribute.

## 6. Automated Verification
- [ ] Run `./do lint && cargo clippy --workspace` in CI and confirm both exit 0.
