# Task: Enforce Bollard for Docker E2E Tests (Sub-Epic: 25_Risk 007 Verification)

## Covered Requirements
- [RISK-008], [RISK-008-BR-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test `tests/docker_e2e_isolation.rs` that starts a Docker container using the `bollard` crate and performs a trivial operation (e.g., `ls /`).
- [ ] Add a lint check or test-case assertion that fails if `Command::new("docker")` is used within the `tests/` directory (except where permitted, if any).
- [ ] Confirm that `bollard` is listed as a `dev-dependency` in `devs-executor/Cargo.toml`.

## 2. Task Implementation
- [ ] Update the `devs-executor` implementation of `DockerExecutor` (if it exists) to use `bollard` for all container lifecycle management (create, start, exec, stop, remove).
- [ ] Prohibit shell-out to `docker` CLI by removing any `Command::new("docker")` calls in the production code and test code related to Docker E2E.
- [ ] Implement a base E2E helper for Docker that wraps `bollard` calls and provides standardized error handling as per [RISK-008].

## 3. Code Review
- [ ] Verify that no `PATH`-dependent behavior is introduced by avoiding shell-out to `docker` CLI binary.
- [ ] Confirm that the `bollard` usage follows the async pattern (using `tokio`).
- [ ] Check that `devs-executor` does not leak Docker resources on failure by ensuring all container creation is followed by a robust cleanup strategy (Wait, `RISK-008-BR-004` covers cleanup, which is in sub-epic 26).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace --test docker_e2e_isolation` to verify the `bollard` integration.
- [ ] Run `./do lint` and verify it detects/prevents `docker` CLI shell-out if a custom lint check was added.

## 5. Update Documentation
- [ ] Document the mandatory use of `bollard` for all Docker-related testing in `docs/plan/specs/8_risks_mitigation.md` (confirm it is already there) and in `devs-executor` README.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [RISK-008-BR-001] as covered.
