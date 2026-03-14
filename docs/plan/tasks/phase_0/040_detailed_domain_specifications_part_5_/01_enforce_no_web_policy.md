# Task: Enforce Forbidden Web Framework Dependencies and Web Assets (Sub-Epic: 040_Detailed Domain Specifications (Part 5))

## Covered Requirements
- [1_PRD-REQ-054], [1_PRD-REQ-056], [1_PRD-REQ-057]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/lint/test_no_web_deps.rs` (or a shell-based test script `.tools/verify_no_web.sh`) that:
  1. Runs `cargo tree --workspace --target all --edges normal` and captures stdout.
  2. Asserts that none of the following crate names appear anywhere in the dependency tree for non-dev, non-test build targets: `axum`, `actix-web`, `actix-rt`, `rocket`, `warp`, `poem`, `salvo`, `tide`, `hyper` (when used as a direct dependency — `tonic` transitively pulling `hyper` is acceptable since it's gRPC transport, not an HTTP framework).
  3. Walks the workspace source directories (`crates/*/src/`, `src/`) and asserts zero files with extensions `.html`, `.css`, `.js`, `.jsx`, `.ts`, `.tsx`, `.wasm` exist.
  4. The test must initially fail when a canary forbidden dependency or asset is present — validate this by temporarily adding `axum = "*"` to a test crate's `Cargo.toml` or placing a dummy `.html` file in `crates/devs-core/src/`.
- [ ] Add `// Covers: 1_PRD-REQ-056` annotation to the dependency check test.
- [ ] Add `// Covers: 1_PRD-REQ-057` annotation to the asset check test.
- [ ] Add `// Covers: 1_PRD-REQ-054` annotation to a top-level test that calls both checks.

## 2. Task Implementation
- [ ] Implement the forbidden-dependency checker: parse `cargo tree` output line-by-line, match against a `FORBIDDEN_WEB_CRATES` list, and exit non-zero with a clear message naming the violating crate and the requirement ID it violates.
- [ ] Implement the web-asset checker: use `find` (or equivalent) to scan `crates/*/src/` and the root `src/` for forbidden file extensions, excluding `target/`, `.git/`, `docs/`, `tests/`, and `examples/` directories. Exit non-zero listing each violating file path.
- [ ] Integrate both checks into `./do lint` so they run as part of the standard lint pipeline.
- [ ] Ensure the `hyper` exception is correctly scoped: `hyper` is allowed only as a transitive dependency of `tonic`/`tonic-build`, not as a direct `[dependencies]` entry in any workspace crate.

## 3. Code Review
- [ ] Verify the forbidden crate list is comprehensive against known Rust web frameworks.
- [ ] Verify the asset extension list covers all web asset types from [1_PRD-REQ-057] (HTML, CSS, JavaScript, WebAssembly).
- [ ] Confirm that dev-dependencies and test-only dependencies are excluded from the forbidden check (e.g., `reqwest` for integration tests is acceptable).
- [ ] Verify the `hyper` exception logic is correct and documented with a comment explaining why.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the clean workspace and confirm exit code 0.
- [ ] Temporarily add `axum = "0.7"` to a crate's `Cargo.toml`, run `./do lint`, confirm it fails with a clear message referencing [1_PRD-REQ-056].
- [ ] Temporarily place a `test.html` file in `crates/devs-core/src/`, run `./do lint`, confirm it fails referencing [1_PRD-REQ-057].
- [ ] Remove the canary violations and confirm `./do lint` passes again.

## 5. Update Documentation
- [ ] Add a comment block at the top of the verification script explaining the policy and listing the requirement IDs it enforces.

## 6. Automated Verification
- [ ] Run `./do lint` and verify exit code is 0.
- [ ] Run `./do test` and verify the traceability scanner picks up `1_PRD-REQ-054`, `1_PRD-REQ-056`, `1_PRD-REQ-057` from test annotations.
