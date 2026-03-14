# Task: Setup Docker & SSH E2E Infrastructure in CI (Sub-Epic: 04_MVP Roadmap)

## Covered Requirements
- [ROAD-P5-DEP-002], [ROAD-P5-DEP-003]

## Dependencies
- depends_on: ["01_verify_bootstrap_milestone.md"]
- shared_components: [./do Entrypoint Script, devs-executor]

## 1. Initial Test Written
- [ ] Create a shell-based verification script `.tools/verify_e2e_infra.sh` that:
    - Checks for the existence of `~/.ssh/devs_test_key`.
    - Attempts to `ssh -i ~/.ssh/devs_test_key localhost echo "success"` (assuming local SSH access is enabled or a test container is used).
    - Checks if the Docker daemon is accessible via `docker info`.
    - Verifies that a minimal Rust test using `bollard` can successfully list Docker images.

## 2. Task Implementation
- [ ] Update `./do setup` to provision SSH testing credentials:
    - Generate a password-less SSH key at `~/.ssh/devs_test_key`.
    - Add the public key to `~/.ssh/authorized_keys` (with proper file permissions) to allow local SSH execution for E2E tests.
- [ ] Ensure Docker-in-Docker (DinD) is functional for E2E tests:
    - Update the CI environment configuration (likely in the project's GitLab CI file) to use a Docker-enabled runner.
    - Ensure the `bollard` crate's environment variables (`DOCKER_HOST`) are correctly initialized for the test suite.
- [ ] Add a "connectivity" stage to the bootstrap workflow that explicitly tests the `docker` and `remote` execution environments.

## 3. Code Review
- [ ] Verify that SSH keys are generated securely and only used for testing purposes.
- [ ] Ensure `devs-executor`'s Docker and SSH targets are properly configured to use these provisioned credentials.

## 4. Run Automated Tests to Verify
- [ ] Run `.tools/verify_e2e_infra.sh` and ensure it passes on the `presubmit-linux` environment.

## 5. Update Documentation
- [ ] Document the requirement for Docker and SSH access in the "Development Setup" section of the README.

## 6. Automated Verification
- [ ] Run `./do setup && .tools/verify_e2e_infra.sh` and verify the output shows both Docker and SSH as "Operational".
