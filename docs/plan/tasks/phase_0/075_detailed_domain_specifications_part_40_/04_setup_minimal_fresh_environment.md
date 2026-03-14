# Task: Verify ./do setup on Minimal Fresh Environment (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-453]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a CI job definition (in `.gitlab-ci.yml` or equivalent) that uses a minimal Docker image with only `git` pre-installed (e.g., `alpine:latest` with `apk add git curl bash`).
- [ ] The CI job runs `./do setup` and asserts exit code 0.
- [ ] After `./do setup`, the job runs verification commands to confirm the following tools are available on `$PATH` and functional: `rustc --version`, `cargo --version`, `cargo-llvm-cov --version` (or `cargo llvm-cov --version`), and `protoc --version`. Each must exit 0.
- [ ] Write a standalone test script `tests/ci/test_setup_fresh.sh` that encapsulates these assertions so it can also be run locally in a container.

## 2. Task Implementation
- [ ] Ensure `./do setup` installs `rustup` (and the pinned toolchain) if `rustc` is not found.
- [ ] Ensure `./do setup` installs `cargo-llvm-cov` if not already present (via `cargo install cargo-llvm-cov` or a binary download).
- [ ] Ensure `./do setup` installs `protoc` (protobuf compiler) if not already present — either via the system package manager or by downloading a prebuilt binary to a known location and adding it to `$PATH`.
- [ ] All install steps must be gated on the tool not already being present (checked via `command -v` or equivalent) to support idempotence (see task 05).
- [ ] `./do setup` must exit 0 on success and non-zero if any install step fails, with a clear error message.

## 3. Code Review
- [ ] Verify `./do setup` is POSIX sh-compatible (no bash-isms) per project standards.
- [ ] Confirm all tool version checks use `command -v` (POSIX) rather than `which` (not universally available).
- [ ] Verify the CI job image is truly minimal — no Rust toolchain or protoc pre-installed.

## 4. Run Automated Tests to Verify
- [ ] Run the CI job (or `docker run` locally with the minimal image) and confirm `./do setup` exits 0 and all four tools are on PATH.
- [ ] Run `tests/ci/test_setup_fresh.sh` inside a fresh container and confirm exit 0.

## 5. Update Documentation
- [ ] Add `# Covers: 2_TAS-REQ-453` annotation to the CI job definition and test script.

## 6. Automated Verification
- [ ] The CI pipeline must include this minimal-environment job. Confirm the job passes in the pipeline dashboard.
