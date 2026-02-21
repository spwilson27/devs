# Task: Sandbox Escape Monitoring (Sub-Epic: 11_Escalation & Checkpoints)

## Covered Requirements
- [1_PRD-REQ-UI-015]

## 1. Initial Test Written
- [ ] Write unit tests for `SandboxMonitor` class in `tests/sandbox/monitor.test.ts`.
- [ ] Add tests to verify that `SandboxMonitor.checkNetworkEgress()` detects unapproved domains/IPs and emits a `SECURITY_PAUSE` event.
- [ ] Add tests to verify that `SandboxMonitor.checkFilesystemAccess()` detects attempts to access or modify paths outside the allowed `/workspace` scope and emits a `SECURITY_PAUSE` event.
- [ ] Ensure tests mock the underlying system calls, filesystem modules, or Docker API events to reliably test the monitoring constraints.

## 2. Task Implementation
- [ ] Implement the `SandboxMonitor` logic in `src/sandbox/monitor.ts`.
- [ ] Add a `checkNetworkEgress` method to intercept or analyze network traffic (e.g., using network namespace stats, eBPF, or Docker network logs) to detect unapproved egress attempts.
- [ ] Add a `checkFilesystemAccess` method to intercept or analyze filesystem access, ensuring any activity beyond the designated `/workspace` (like accessing `/etc` or `.git`) triggers a violation.
- [ ] Integrate the `SandboxMonitor` with the primary `SandboxProvider` so that it continuously runs as a background watcher during any tool or command execution.
- [ ] Ensure the monitor triggers a hard interrupt and emits a `SECURITY_PAUSE` on the system event bus when unauthorized access is detected, halting the agent.

## 3. Code Review
- [ ] Ensure that the monitoring logic is highly performant and does not introduce significant overhead (e.g., < 5% CPU/memory utilization).
- [ ] Verify that paths and network addresses are accurately resolved and normalized to prevent bypass techniques (e.g., directory traversal `../` or IP masking).

## 4. Run Automated Tests to Verify
- [ ] Run the test suite using `npm run test -- tests/sandbox/monitor.test.ts` to ensure 100% of the newly added monitoring tests pass.

## 5. Update Documentation
- [ ] Update `docs/sandbox_security.md` to detail the newly implemented sandbox escape monitoring mechanisms.
- [ ] Add explicit notes to the Agent-Oriented Documentation (`.agent.md`) specifying the hard filesystem/network restrictions and what triggers a `SECURITY_PAUSE`.

## 6. Automated Verification
- [ ] Create and run an automated script (`scripts/verify_sandbox_monitor.sh`) that attempts unauthorized network egress and out-of-bounds filesystem access from within a sandbox instance, automatically validating that a `SECURITY_PAUSE` is correctly and reliably triggered.
