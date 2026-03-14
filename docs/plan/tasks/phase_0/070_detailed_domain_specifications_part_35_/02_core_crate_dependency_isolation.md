# Task: Enforce devs-core Zero-Runtime-Dependency Policy (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-426]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write an integration test (shell script or Rust `#[test]`) that runs `cargo tree -p devs-core --edges normal` and asserts the output does NOT contain any of: `tokio`, `git2`, `reqwest`, `tonic`. Use grep with word-boundary matching to avoid false positives on similarly-named crates.
- [ ] Add this check as a step in `./do lint` so it runs on every presubmit. The lint step should run `cargo tree -p devs-core --edges normal` and fail if any forbidden dependency is found.
- [ ] Write the test to produce a clear error message listing each forbidden dependency found, e.g., "FAIL: devs-core has forbidden dependency 'tokio'".

## 2. Task Implementation
- [ ] Audit `devs-core/Cargo.toml` and remove any direct dependencies on `tokio`, `git2`, `reqwest`, or `tonic`. If any of these are present, refactor the code to remove the usage (move it to the appropriate downstream crate).
- [ ] Audit transitive dependencies: if a dependency of `devs-core` pulls in one of the forbidden crates, either replace that dependency, make it optional, or move the functionality to a downstream crate.
- [ ] Add a comment in `devs-core/Cargo.toml` documenting the policy: `# Policy: devs-core must have zero runtime deps on tokio, git2, reqwest, tonic [2_TAS-REQ-426]`.
- [ ] Integrate the cargo-tree check into `./do lint` if not already present.

## 3. Code Review
- [ ] Verify `devs-core/Cargo.toml` has no direct or feature-gated dependencies on the four forbidden crates.
- [ ] Verify no `use tokio::`, `use git2::`, `use reqwest::`, or `use tonic::` statements exist in `devs-core/src/`.
- [ ] Confirm the lint step is wired into `./do lint` and `./do presubmit`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo tree -p devs-core --edges normal` and visually confirm no forbidden crates appear.
- [ ] Run the integration test and confirm it passes.
- [ ] Run `./do lint` and confirm it passes.

## 5. Update Documentation
- [ ] Document the `devs-core` dependency isolation policy in devs-core's crate-level doc comment (`//!` in `lib.rs`).

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-core --edges normal | grep -E "^.*(tokio|git2|reqwest|tonic)" | wc -l` and assert the output is `0`.
