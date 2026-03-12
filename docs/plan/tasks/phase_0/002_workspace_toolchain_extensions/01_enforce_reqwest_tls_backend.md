# Task: Enforce rustls-tls for reqwest and Ban native-tls (Sub-Epic: 002_Workspace Toolchain Extensions)

## Covered Requirements
- [2_TAS-REQ-006]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a temporary `verify_tls_backend.sh` script (to be integrated into `./do lint` eventually) that uses `cargo tree` to search for `native-tls` or `openssl` dependencies in the workspace.
- [ ] The script should exit with code 1 if `native-tls` is found as a feature of `reqwest` or if `openssl` is found as a direct or transitive dependency of `reqwest`.
- [ ] The script should exit with code 0 if `reqwest` is present and using `rustls-tls` exclusively.

## 2. Task Implementation
- [ ] Update the root `Cargo.toml`'s `[workspace.dependencies]` to include `reqwest` with `default-features = false` and `features = ["json", "rustls-tls"]`.
- [ ] Ensure that no other workspace member enables `native-tls` or `native-tls-alpn` for `reqwest` in their individual `Cargo.toml` files.
- [ ] Update any existing crate that uses `reqwest` (if any, like `devs-webhook`) to consume it from the workspace dependency without adding conflicting features.
- [ ] Integrate the `verify_tls_backend` check into the `./do lint` command to ensure this constraint is permanently enforced.

## 3. Code Review
- [ ] Verify that `cargo tree -p reqwest` shows `rustls-tls` enabled and `native-tls` disabled.
- [ ] Verify that no `openssl` dependency is pulled in on Linux (which would indicate `native-tls` or another crate is using it).
- [ ] Check for `default-features = true` in any `Cargo.toml` that includes `reqwest`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes, including the new TLS backend check.
- [ ] Run a manual `cargo tree -i native-tls` to confirm zero matches across the workspace.

## 5. Update Documentation
- [ ] Update `GEMINI.md` (if applicable) or the developer guide to explicitly state that `rustls-tls` is the only permitted TLS backend for outbound HTTP.

## 6. Automated Verification
- [ ] Execute `./do lint` and verify the output contains no TLS-related warnings and that the exit code is 0.
