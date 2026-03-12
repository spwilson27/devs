# Task: Security Baseline, Dependency Auditing, and Code Review (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-003], [9_PROJECT_ROADMAP-REQ-015], [9_PROJECT_ROADMAP-REQ-152], [9_PROJECT_ROADMAP-REQ-158], [9_PROJECT_ROADMAP-REQ-170], [9_PROJECT_ROADMAP-REQ-286], [9_PROJECT_ROADMAP-REQ-314], [9_PROJECT_ROADMAP-REQ-318], [9_PROJECT_ROADMAP-REQ-325]
- [8_RISKS-REQ-251] through [8_RISKS-REQ-300]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `pytest .tools/tests/test_security_audit.py` that verifies a mock `audit.toml` and `cargo audit` output.
- [ ] Test cases must verify that any `unvetted_security_crate` (a crate with known CVEs or not in `config/security/allowlist.toml`) is flagged by `./do audit`.
- [ ] Test cases must verify that the `forbidden_crate_rejection` (e.g., `web-sys` or `tokio-tungstenite`) correctly triggers a failure in the workspace.
- [ ] Test cases must verify that `cargo-deny` is integrated for license and vulnerability checks.

## 2. Task Implementation
- [ ] Add the `audit` subcommand to `./do` that runs `cargo audit`, `cargo deny check`, and `cargo clippy -- -D warnings`.
- [ ] Create the directory `config/security/`.
- [ ] Define the `allowlist.toml` for vetted security-critical dependencies (e.g., `ring`, `native-tls`, `ed25519-dalek`).
- [ ] Implement the `clippy_lint_hardening`: add `#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic)]` to all library crates.
- [ ] Integrate a security-focused clippy profile that runs during `./do lint`.
- [ ] Add a `check-secrets-rejection` script that scans for accidentally committed keys/secrets (using `ggshield` or similar logic) during presubmit.

## 3. Code Review
- [ ] Verify that the dependency allowlist is strict and justified.
- [ ] Ensure that clippy lints are blocking and consistently applied across the workspace.
- [ ] Check that the security audit is integrated into the CI pipeline with a zero-tolerance policy for high/critical vulnerabilities.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_security_audit.py`.
- [ ] Run `./do audit` and ensure it passes (after fixing any existing warnings/vulnerabilities).

## 5. Update Documentation
- [ ] Update `docs/plan/specs/9_project_roadmap.md` with the list of approved security crates and the forbidden crate policy.
- [ ] Ensure `MEMORY.md` reflects the new security auditing and clippy hardening.

## 6. Automated Verification
- [ ] Add a temporary, unvetted or forbidden crate to `Cargo.toml` and verify that `./do audit` fails.
- [ ] Verify that `./do lint` fails if `clippy::unwrap_used` is triggered in a library crate.
