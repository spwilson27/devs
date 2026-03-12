# Task: OpenSSL Development Headers Requirement (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-604]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a check in the `./do setup` command or a dedicated validation script that detects whether OpenSSL development headers (e.g., `libssl-dev` or `openssl`) are installed on the system.
- [ ] On a fresh system (or simulated CI environment), verify that `./do setup` fails if headers are missing and then succeeds after they are installed.

## 2. Task Implementation
- [ ] Update the `./do` script's `setup` subcommand logic.
- [ ] For Linux (e.g., Debian/Ubuntu), add a check and installation command for `libssl-dev`.
- [ ] For macOS, add a check and installation command for `openssl` via Homebrew.
- [ ] Ensure the command is idempotent and does not fail if the package is already present.
- [ ] Verify that `git2` and other crates requiring OpenSSL can compile after running `./do setup` on Linux and macOS.

## 3. Code Review
- [ ] Verify that the OS detection logic in `./do` is robust.
- [ ] Confirm that the package names used (`libssl-dev`, `openssl`) are correct for the target platforms.
- [ ] Ensure that on Windows, the requirement for OpenSSL headers is skipped in favor of the system Schannel TLS provider.

## 4. Run Automated Tests to Verify
- [ ] Run `./do setup` on a Linux and/or macOS runner.
- [ ] Verify that `cargo build` succeeds for crates with HTTPS or SSL dependencies (like `reqwest` or `git2` with `https` feature).

## 5. Update Documentation
- [ ] Document the system requirement for OpenSSL development headers in the project's README or `docs/setup.md`.
- [ ] Update the documentation of the `./do setup` command.

## 6. Automated Verification
- [ ] Run a shell command that checks for the presence of `openssl/ssl.h` (Linux/macOS only) and verify it exits with 0.
