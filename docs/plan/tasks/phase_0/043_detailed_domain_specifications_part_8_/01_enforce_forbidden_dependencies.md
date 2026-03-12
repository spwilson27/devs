# Task: Forbidden Dependency Check for Secrets Managers (Sub-Epic: 043_Detailed Domain Specifications (Part 8))

## Covered Requirements
- [1_PRD-REQ-072]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a new Python test script in `.tools/tests/test_forbidden_dependencies.py` that parses all `Cargo.toml` files in the workspace and asserts that no forbidden Secrets Manager SDKs (e.g., `aws-sdk-secretsmanager`, `vaultrs`, `google-cloud-secretmanager`, `azure_mgmt_keyvault`, `yandex-cloud`) are present in any dependency section (`dependencies`, `dev-dependencies`, `build-dependencies`).
- [ ] Add a dummy entry to a test-specific `Cargo.toml` to verify the test script correctly identifies and fails when a forbidden dependency is present.

## 2. Task Implementation
- [ ] Implement the logic in `.tools/verify_requirements.py` or a standalone script that can be integrated into `./do lint`.
- [ ] Ensure the script lists all forbidden patterns and checks both literal crate names and potential git/path dependencies that might mask them.
- [ ] Integrate this check into the CI pipeline (via `.tools/ci.py`) so it runs as part of the `presubmit` gate.

## 3. Code Review
- [ ] Verify that the list of forbidden SDKs is comprehensive for AWS, GCP, Azure, HashiCorp Vault, and Yandex Cloud.
- [ ] Ensure the script provides a clear error message indicating which crate is forbidden and which `Cargo.toml` contains it.

## 4. Run Automated Tests to Verify
- [ ] Run the Python test script directly: `pytest .tools/tests/test_forbidden_dependencies.py`.
- [ ] Run `./do lint` to ensure the check is correctly integrated and passing on the current codebase.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or a relevant architecture doc to note that Secrets Manager SDKs are strictly prohibited in MVP to maintain simplicity.

## 6. Automated Verification
- [ ] Execute `.tools/verify_requirements.py` and ensure [1_PRD-REQ-072] is marked as verified.
