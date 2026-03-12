# Task: Implement E2E Infrastructure Feature Gating (Sub-Epic: 26_Risk 008 Verification)

## Covered Requirements
- [MIT-008], [RISK-008-BR-003]

## Dependencies
- depends_on: [02_ssh_test_key_provisioning.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create a new E2E test file `tests/e2e/executor_infra_skip_test.rs` that:
    - Defines a Docker E2E test and an SSH E2E test.
    - Tags them with `#[cfg_attr(not(feature = "e2e_docker"), ignore)]` and `#[cfg_attr(not(feature = "e2e_ssh"), ignore)]` respectively.
    - Adds a runtime check (e.g., checking `DOCKER_HOST` is reachable or if `localhost:22` can be connected to).
    - Verifies that if the infrastructure is missing, the test is *skipped* (e.g., using `return` early or `pytest.skip` equivalent in Rust tests like `#[ignore]` with dynamic checks).

## 2. Task Implementation
- [ ] Add `e2e_docker` and `e2e_ssh` features to `Cargo.toml` of `devs-executor` (or a global `Cargo.toml`).
- [ ] In the E2E tests:
    - Use `bollard::Docker::connect_with_defaults()` to check Docker availability.
    - Use `std::net::TcpStream::connect("localhost:22")` to check SSH availability.
    - If unreachable, use `println!("cargo:warning=Skipping Docker/SSH E2E test; infrastructure unavailable")` and `return;` to avoid failure.
- [ ] Configure `GitLab CI` (`.gitlab-ci.yml`) to set `CARGO_FEATURES=e2e_docker,e2e_ssh` in the `presubmit-linux` job to ensure they are always run in the authoritative environment.
- [ ] Ensure all tests are annotated with `// Covers: RISK-008-BR-003, MIT-008`.

## 3. Code Review
- [ ] Verify that E2E tests for Docker/SSH do NOT cause CI failures on platforms like Windows or macOS when the respective infrastructure is missing (they should be ignored or skipped).
- [ ] Confirm that `MIT-008` (Mitigation of RISK-008) is fully addressed by these gating mechanisms.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --features e2e_docker,e2e_ssh` in an environment WITH the infrastructure and verify they pass.
- [ ] Run `cargo test` in an environment WITHOUT the infrastructure and verify they are either skipped or ignored.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record that RISK-008 is now mitigated.

## 6. Automated Verification
- [ ] Run `./do test` and check the test summary for skipped/ignored E2E tests where appropriate.
