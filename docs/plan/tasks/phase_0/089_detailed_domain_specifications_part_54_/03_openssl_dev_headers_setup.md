# Task: OpenSSL Development Headers in Setup Command (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-604]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a test script or shell-based test named `test_do_setup_installs_openssl_headers` that:
  1. Runs `./do setup` in a controlled environment (or inspects the `./do` script source).
  2. On Linux: asserts the script invokes the platform package manager to install `libssl-dev` (Debian/Ubuntu) or `openssl-devel` (RHEL/Fedora), or equivalent.
  3. On macOS: asserts the script checks for or installs OpenSSL headers (e.g., via `brew install openssl`).
  4. If the script is POSIX sh, the test can be a grep-based assertion on the script content confirming the install commands are present for each platform.
- [ ] Create a CI-level test that runs `./do setup` on a fresh runner and then runs `pkg-config --exists openssl` (or equivalent), asserting exit code 0.

## 2. Task Implementation
- [ ] In the `./do` script's `setup` subcommand, add platform detection (`uname -s`) and conditional installation of OpenSSL development headers:
  - Linux (Debian/Ubuntu): `sudo apt-get install -y libssl-dev pkg-config`
  - Linux (RHEL/Fedora): `sudo dnf install -y openssl-devel pkg-config`
  - macOS: `brew install openssl pkg-config` (with idempotent check)
- [ ] Ensure the setup command is idempotent — re-running it when headers are already installed must not fail.
- [ ] Add a comment in the script: `# 2_TAS-REQ-604: OpenSSL dev headers required for native TLS`

## 3. Code Review
- [ ] Verify the script handles the case where `sudo` is not available (CI containers running as root).
- [ ] Verify the script does not fail on Windows (where OpenSSL headers are handled differently by the Rust TLS backend or vendored).
- [ ] Verify idempotency — running `./do setup` twice in a row must succeed.

## 4. Run Automated Tests to Verify
- [ ] Run `./do setup` on the current platform and confirm exit code 0.
- [ ] Run `pkg-config --exists openssl` (Linux/macOS) and confirm exit code 0.

## 5. Update Documentation
- [ ] Add `# Covers: 2_TAS-REQ-604` comment in the `./do` script near the OpenSSL install logic.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm the setup phase completes without OpenSSL-related build failures.
- [ ] Run `grep -n "2_TAS-REQ-604" ./do` and confirm at least one annotation exists.
