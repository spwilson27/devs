# Task: Enforce No Secrets Manager SDK Dependencies (Sub-Epic: 043_Detailed Domain Specifications (Part 8))

## Covered Requirements
- [1_PRD-REQ-072]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/phase_0/test_no_secrets_manager_deps.rs` (or a script at `.tools/tests/test_forbidden_deps.py`) that:
  1. Parses every `Cargo.toml` in the workspace (root and all member crates).
  2. Scans `[dependencies]`, `[dev-dependencies]`, and `[build-dependencies]` sections.
  3. Asserts that none of the following crate names (or prefixes) appear: `aws-sdk-secretsmanager`, `aws-sdk-ssm`, `vaultrs`, `hashicorp-vault`, `google-cloud-secretmanager`, `azure_security_keyvault`, `azure_mgmt_keyvault`, `yandex-cloud`.
  4. Fails with a clear message naming the offending crate and the `Cargo.toml` path if any match is found.
- [ ] Add a negative test: temporarily inject a forbidden dependency name into a test fixture TOML string and assert the check catches it.
- [ ] Annotate the test with `// Covers: 1_PRD-REQ-072`.

## 2. Task Implementation
- [ ] Implement the forbidden-dependency scanner as a lint step callable from `./do lint`.
- [ ] Define the forbidden crate list as a constant array for easy future extension.
- [ ] The scanner must check both literal crate names and `package` renames (e.g., `vault = { package = "vaultrs", ... }`).
- [ ] On failure, print each violation on its own line: `FORBIDDEN DEPENDENCY: <crate> found in <path/to/Cargo.toml>`.
- [ ] Exit with non-zero status on any violation.

## 3. Code Review
- [ ] Verify the forbidden list covers AWS, GCP, Azure, HashiCorp Vault, and Yandex Cloud secret manager SDKs.
- [ ] Verify the scanner handles `package` field renames and git/path dependencies.
- [ ] Confirm error messages are actionable and name the exact file and dependency.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm the forbidden-dependency check passes on the current workspace.
- [ ] Run the negative test to confirm it correctly detects injected violations.

## 5. Update Documentation
- [ ] Add a doc comment or inline comment in the scanner explaining that secrets manager SDKs are prohibited per [1_PRD-REQ-072] and will be reconsidered post-MVP.

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0.
- [ ] Verify `// Covers: 1_PRD-REQ-072` annotation exists in test code via grep.
