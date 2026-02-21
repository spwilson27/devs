# Task: Build Clean Sandbox Audit Runner (Sub-Epic: 12_Global Validation Infrastructure)

## Covered Requirements
- [8_RISKS-REQ-107], [TAS-053]

## 1. Initial Test Written
- [ ] Create `tests/core/sandbox/GlobalAuditRunner.test.ts`.
- [ ] Write an integration test that provisions a mock `SandboxProvider`, injects a simple failing test suite, and expects `GlobalAuditRunner` to report a failure.
- [ ] Write an integration test with a mock `SandboxProvider` that injects a passing test suite and expects a success payload.
- [ ] Verify tests assert that the sandbox was provisioned explicitly with the `ephemeral: true` or equivalent strict isolation flag.

## 2. Task Implementation
- [ ] Create `src/core/sandbox/GlobalAuditRunner.ts` implementing a `ZeroDefectAuditor` interface.
- [ ] Implement logic to automatically provision a pristine, non-persistent Docker (or WebContainer) sandbox via the `SandboxProvider`.
- [ ] Ensure the runner syncs the entire project workspace *excluding* `.devs/`, `.git`, and `node_modules` (or other local caches).
- [ ] Execute the project's native build and test commands (e.g., `npm run build`, `npm run test:all`).
- [ ] Parse the exit codes and emit a structured `AuditResult` object.

## 3. Code Review
- [ ] Verify that the `GlobalAuditRunner` does not rely on any lingering host state.
- [ ] Confirm strict timeout limits (e.g., 5-10 minutes) are applied to the full audit run to prevent infinite loops.
- [ ] Ensure proper cleanup and teardown of the ephemeral sandbox occurs in a `finally` block to prevent resource leaks.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/core/sandbox/GlobalAuditRunner.test.ts`.
- [ ] Confirm both passing and failing sandbox mock scenarios behave deterministically.

## 5. Update Documentation
- [ ] Add an entry in `.agent/core/sandbox.agent.md` detailing the execution sequence of `GlobalAuditRunner`.
- [ ] Document the requirements for what folders are explicitly ignored during the clean sandbox sync.

## 6. Automated Verification
- [ ] Execute an automated bash script that triggers a simulated `GlobalAuditRunner` via the CLI headless mode and grep for the `AuditResult` output structure.
- [ ] Ensure `npm run lint` reports zero issues on the new files.