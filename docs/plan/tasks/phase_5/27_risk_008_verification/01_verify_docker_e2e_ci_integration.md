# Task: Verify Docker E2E Integration in CI (Sub-Epic: 27_Risk 008 Verification)

## Covered Requirements
- [AC-RISK-008-02]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new CI-specific test script `.tools/tests/test_ci_docker_config.py` that:
    - Parses the `.gitlab-ci.yml` or the Python CI orchestrator (`.tools/ci.py`).
    - Verifies that the `presubmit-linux` job exists.
    - Verifies that `presubmit-linux` includes the `DOCKER_HOST=tcp://docker:2375` environment variable.
    - Verifies that `presubmit-linux` executes the E2E tests with the `e2e_docker` feature enabled.

## 2. Task Implementation
- [ ] Modify `.gitlab-ci.yml` (if using GitLab) or `.tools/ci.py` to:
    - Ensure the `presubmit-linux` stage is configured to run on a runner with Docker-in-Docker (dind) support.
    - Set `DOCKER_HOST: tcp://docker:2375` in the job environment.
    - Ensure the job executes `./do test` with the `e2e_docker` feature (e.g., via `CARGO_FEATURES` environment variable or direct flag).
- [ ] Ensure the Docker E2E test itself (likely in `tests/e2e/docker_test.rs`) is annotated with `// Covers: AC-RISK-008-02`.
- [ ] Add a health check in the CI job to verify `docker info` before running tests, ensuring the environment is truly ready as required by `AC-RISK-008-02`.

## 3. Code Review
- [ ] Verify that the `DOCKER_HOST` matches the exact string specified in `AC-RISK-008-02`.
- [ ] Ensure that the CI job does NOT fail if Docker is unavailable *unless* it is the `presubmit-linux` job which MUST pass with Docker.

## 4. Run Automated Tests to Verify
- [ ] Run the CI configuration validator: `python3 .tools/tests/test_ci_docker_config.py`.
- [ ] Trigger a CI run (or simulate it locally using `gitlab-runner exec` or similar) and verify the `presubmit-linux` job passes.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record that `AC-RISK-008-02` is verified in CI.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and ensure `AC-RISK-008-02` is marked as verified by the new test script and CI config.
