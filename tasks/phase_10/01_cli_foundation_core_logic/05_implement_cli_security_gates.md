# Task: Implement Host-Level Execution Prevention & Security Enforcement (Sub-Epic: 01_CLI Foundation & Core Logic)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-006]

## 1. Initial Test Written
- [ ] Write a test in `packages/cli/tests/security.test.ts` that simulates running the CLI as a root user (UID 0) and verifies the process exits with an error.
- [ ] Write a test that verifies `ignore-scripts` is passed as a default flag to any package manager command initiated by the CLI/Orchestrator.

## 2. Task Implementation
- [ ] Implement a startup check in `packages/cli/src/index.ts` to detect if the process is running with `root` or `sudo` privileges (using `process.getuid()` on Unix).
- [ ] If running as root, print a security warning and exit with code 1.
- [ ] Add a utility in `packages/cli/src/utils/security.ts` that enforces `--ignore-scripts` for all `npm`/`pypi` operations.
- [ ] Configure the `CLIController` to inject sandbox security defaults (like `no-exec /tmp` configuration) into the orchestrator's sandbox provider settings.

## 3. Code Review
- [ ] Verify that the root check is only active on supported platforms (macOS/Linux).
- [ ] Ensure that security flags like `--ignore-scripts` cannot be easily overridden by user arguments without explicit authorization.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/cli/tests/security.test.ts` and verify the security gates prevent unsafe execution.

## 5. Update Documentation
- [ ] Update `Security Design` documentation to reflect the CLI's role in enforcing host-level protection.

## 6. Automated Verification
- [ ] Attempt to run `sudo devs status` and verify the process aborts with the message: "Security Error: devs must not be run with root privileges."
