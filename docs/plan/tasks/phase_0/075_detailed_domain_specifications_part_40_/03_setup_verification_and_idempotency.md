# Task: Setup Verification and Idempotency (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-453], [2_TAS-REQ-454]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_setup.sh` that simulates:
    - Running `./do setup` on a machine that has nothing (mocked by cleaning up relevant paths or using a temporary directory).
    - Running `./do setup` twice in a row.
- [ ] The script should assert:
    - The first run exits 0.
    - All required tools (`rustc`, `cargo`, `cargo-llvm-cov`, `protoc`) are available on `$PATH`.
    - The second run also exits 0 and does not perform redundant work.

## 2. Task Implementation
- [ ] Implement robust idempotency in the `./do setup` script:
    - Check if tools are already installed and on the `$PATH` before trying to install them.
    - If a tool is missing or is the wrong version, perform the installation.
- [ ] Add a verification CI job in `.gitlab-ci.yml` that uses a minimal base image (e.g., `alpine:latest` or `ubuntu:latest` with only `git` and `curl`) to run `./do setup` and then run the project's tests.
- [ ] Ensure the `./do setup` script correctly handles multiple platforms (Linux, macOS, Windows) by using platform-appropriate installation methods or directing the user to them.

## 3. Code Review
- [ ] Verify that the setup script is clean and handles errors gracefully (e.g., download failures, permission issues).
- [ ] Confirm that the idempotency check is accurate and does not skip necessary updates.

## 4. Run Automated Tests to Verify
- [ ] Run `tests/verify_setup.sh` locally and ensure it passes.
- [ ] Trigger the CI pipeline and verify that the "minimal-setup" job succeeds.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or the project README to explicitly state that `./do setup` is the source of truth for the development environment.

## 6. Automated Verification
- [ ] Run `./do setup && ./do setup` and verify both return exit code 0.
- [ ] Verify that `rustc --version`, `cargo --version`, `protoc --version`, and `cargo llvm-cov --version` all execute successfully after `./do setup`.
