# Task: Enforce rustls-tls for reqwest and Ban native-tls (Sub-Epic: 002_Workspace Toolchain Extensions)

## Covered Requirements
- [2_TAS-REQ-006]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline (consumer — integrate lint check)"]

## 1. Initial Test Written
- [ ] Create `tests/toolchain/tls_backend_test.sh` (or equivalent inline in `./do lint`). The test runs `cargo tree -p reqwest -f '{f}' --prefix none` and asserts:
  1. The string `rustls-tls` appears in the feature list for `reqwest`.
  2. The strings `native-tls`, `native-tls-alpn`, and `native-tls-vendored` do NOT appear anywhere in `cargo tree -p reqwest --no-default-features -e features`.
  3. `cargo tree -i openssl-sys` returns no results (exit code 1 from `cargo tree` when no match found), confirming OpenSSL is not a transitive dependency.
- [ ] The test must exit non-zero if any of the three assertions fail, printing the offending output line.
- [ ] Write a Rust integration test in `tests/verify_no_native_tls.rs` (workspace root or a dedicated test crate) that shells out to `cargo tree -i native-tls 2>&1` and asserts the output is empty / exit code indicates no matches. Annotate with `// Covers: 2_TAS-REQ-006`.

## 2. Task Implementation
- [ ] In the root `Cargo.toml` under `[workspace.dependencies]`, declare: `reqwest = { version = "0.12", default-features = false, features = ["json", "rustls-tls"] }`. The exact version must match the authoritative table in `docs/plan/requirements/2_tas.md` section §2.2.
- [ ] Audit every workspace member's `Cargo.toml` — if any member re-declares `reqwest` with extra features, ensure `native-tls` and `native-tls-alpn` are absent. Members should use `reqwest.workspace = true` without adding conflicting features.
- [ ] Add the TLS backend verification step to `./do lint` so it runs as part of the standard lint pipeline. The step should run `cargo tree -i native-tls` and `cargo tree -i openssl-sys` and fail the lint if either returns matches.

## 3. Code Review
- [ ] Confirm `cargo tree -p reqwest` output shows `rustls` and `ring` (or `aws-lc-rs`) in the dependency tree, NOT `openssl-sys` or `native-tls`.
- [ ] Confirm no `Cargo.toml` in the workspace contains `default-features = true` for `reqwest`.
- [ ] Verify the lint step is idempotent and runs in under 5 seconds on a warm build.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` end-to-end and confirm it exits 0, with the TLS backend check visibly logged as passing.
- [ ] Run `cargo tree -i native-tls` manually and confirm zero output lines.
- [ ] Run the Rust integration test: `cargo test --test verify_no_native_tls` (or equivalent) and confirm it passes.

## 5. Update Documentation
- [ ] No external documentation updates required. The lint enforcement is self-documenting. If a `CONTRIBUTING.md` or developer guide exists, add a one-line note: "reqwest must use rustls-tls exclusively; native-tls is banned (2_TAS-REQ-006)."

## 6. Automated Verification
- [ ] `./do lint` exits 0 (includes TLS backend check).
- [ ] `cargo tree -i native-tls 2>&1 | wc -l` outputs `0`.
- [ ] `cargo tree -i openssl-sys 2>&1 | wc -l` outputs `0`.
