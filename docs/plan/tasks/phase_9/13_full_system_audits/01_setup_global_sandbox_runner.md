# Task: Setup Global Sandbox Runner (Sub-Epic: 13_Full System Audits)

## Covered Requirements
- [9_ROADMAP-REQ-040]

## 1. Initial Test Written
- [ ] Create `tests/sandbox/GlobalSandboxRunner.test.ts`.
- [ ] Write a unit test to assert that `GlobalSandboxRunner.runSuite()` initializes a clean, non-persistent environment.
- [ ] Write an integration test using a dummy project that includes unit, integration, and E2E tests, verifying that the runner captures the combined exit code and output accurately.
- [ ] Write a test asserting that the sandbox environment is entirely torn down even if the test suite panics or times out.

## 2. Task Implementation
- [ ] Implement `GlobalSandboxRunner` in `src/sandbox/GlobalSandboxRunner.ts`.
- [ ] Inject the `SandboxProvider` dependency to launch an isolated ephemeral container.
- [ ] Implement the `runSuite(projectPath: string, testCommand: string): Promise<AuditResult>` method to copy the specified project, execute the command, and parse the 100% pass requirement.
- [ ] Ensure the cleanup sequence forcefully terminates the container.

## 3. Code Review
- [ ] Verify that the abstraction does not leak host state (e.g., environment variables) into the sandbox.
- [ ] Check that `AuditResult` type is strongly typed and includes stdout, stderr, and the boolean pass status.
- [ ] Ensure proper error handling (e.g., catching Docker daemon unavailability).

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run tests/sandbox/GlobalSandboxRunner.test.ts` to ensure all new tests pass.
- [ ] Run `npx eslint src/sandbox/GlobalSandboxRunner.ts` to verify code style.

## 5. Update Documentation
- [ ] Add the `GlobalSandboxRunner` to the Agent-Oriented Documentation at `.agent.md`.
- [ ] Document the `AuditResult` schema and lifecycle methods in `docs/architecture/sandbox.md`.

## 6. Automated Verification
- [ ] Verify test execution using `npm run test:coverage` and ensure `GlobalSandboxRunner` meets the required test coverage threshold.
