# Task: Implement Fatal Error Handling for Adapters (Sub-Epic: 06_Mid-Run Interaction & Signal Handling)

## Covered Requirements
- [2_TAS-REQ-039]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Write a test that attempts to spawn an agent with a non-existent binary path and verifies it returns a fatal error (no retry).
- [ ] Write a test that mocks a PTY allocation failure (e.g., by exhausting file descriptors in a controlled environment or using a mock PTY provider) and verifies it returns a fatal error.
- [ ] Verify that these specific errors cause the `StageRun` to transition directly to `Failed` without triggering any configured retry policy.

## 2. Task Implementation
- [ ] In the `devs-adapters` spawn logic, check for the existence of the binary before attempting to spawn.
- [ ] If the binary is missing, return a specific `AdapterError::BinaryNotFound` variant.
- [ ] Implement PTY allocation using `portable-pty`. Wrap the allocation call to catch OS-level errors.
- [ ] If PTY allocation fails, return `AdapterError::PtyAllocationFailed`.
- [ ] In the scheduler/executor bridge, ensure that `AdapterError::BinaryNotFound` and `AdapterError::PtyAllocationFailed` are marked as non-retryable errors.

## 3. Code Review
- [ ] Ensure that error messages for these fatal failures are descriptive and include the path to the missing binary or the OS error from PTY allocation.
- [ ] Verify that no "fallback" to non-PTY mode happens if PTY is explicitly requested and fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` specifically targeting the error variants.

## 5. Update Documentation
- [ ] Update the `AgentAdapter` trait documentation to explicitly list which errors are considered terminal/fatal.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure compliance with [2_TAS-REQ-039].
