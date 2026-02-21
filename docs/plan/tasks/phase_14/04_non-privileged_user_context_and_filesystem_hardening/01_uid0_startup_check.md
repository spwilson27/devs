# Task: Implement UID 0 Startup Check to Block Root Execution (Sub-Epic: 04_Non-Privileged User Context and Filesystem Hardening)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-010], [5_SECURITY_DESIGN-REQ-SEC-STR-001]

## 1. Initial Test Written
- [ ] Create `src/security/__tests__/privilegeCheck.test.ts`.
- [ ] Write a unit test that mocks `process.getuid` to return `0` and asserts that `assertNonPrivilegedUser()` throws an error with the message `"Fatal: devs must not be run as root (UID 0). Aborting."`.
- [ ] Write a unit test that mocks `process.getuid` to return `1000` (a non-root UID) and asserts that `assertNonPrivilegedUser()` returns without throwing.
- [ ] Write a unit test for Windows where `process.getuid` is `undefined` and assert that `assertNonPrivilegedUser()` returns without throwing (Windows does not have UID semantics).
- [ ] Write an integration test in `src/security/__tests__/privilegeCheck.integration.test.ts` that spawns the `devs` CLI as a child process with a mocked UID 0 environment and confirms the process exits with a non-zero exit code and prints the fatal error to `stderr`.

## 2. Task Implementation
- [ ] Create `src/security/privilegeCheck.ts`.
- [ ] Export a function `assertNonPrivilegedUser(): void`.
- [ ] Inside the function, check `typeof process.getuid === 'function'`. If so, call `process.getuid()`.
- [ ] If the returned UID is `0`, call `process.stderr.write()` with the fatal message and then call `process.exit(1)`.
- [ ] If `process.getuid` is undefined (Windows), skip the check silently.
- [ ] Add JSDoc comment: `// [5_SECURITY_DESIGN-REQ-SEC-SD-010]: Non-privileged user context enforcement`.
- [ ] Call `assertNonPrivilegedUser()` as the very first statement inside the main orchestrator entry point (`src/index.ts` or `src/cli/index.ts`), before any other initialization logic runs.
- [ ] Ensure the function is also exported from the main security barrel file `src/security/index.ts`.

## 3. Code Review
- [ ] Verify `assertNonPrivilegedUser()` is called before any async operations, file I/O, or agent initialization in the entry point.
- [ ] Verify the function is pure and has no side effects beyond writing to stderr and calling `process.exit`.
- [ ] Confirm the requirement ID comment `// [5_SECURITY_DESIGN-REQ-SEC-SD-010]` is present on the function.
- [ ] Confirm the function is synchronous and does not use `async/await`.
- [ ] Review that the Windows code path (`process.getuid === undefined`) is handled gracefully and does not throw.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/privilegeCheck"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/privilegeCheck.integration"` and confirm the integration test passes.
- [ ] Confirm test coverage for `src/security/privilegeCheck.ts` is 100%.

## 5. Update Documentation
- [ ] Update `docs/security.md` (create if absent) with a section titled "Non-Privileged Execution" describing the UID 0 check, why it exists, and what error users will see if they run `devs` as root.
- [ ] Update `CONTRIBUTING.md` to note that the orchestrator must never be tested or run with `sudo`.
- [ ] Add an entry to `docs/architecture/adr/` as `ADR-SEC-001-non-privileged-user.md` recording the decision to enforce UID 0 check at startup.

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm the security test suite exits with code 0.
- [ ] Run `node -e "process.getuid = () => 0; require('./dist/index.js')"` against the compiled output and assert the process exits with code 1 and the error message appears on stderr (can be captured via shell: `2>&1 | grep "Fatal: devs must not be run as root"`).
