# Task: Failure Counter and Entropy Pause Threshold (Sub-Epic: 14_Entropy Detection and Pivot)

## Covered Requirements
- [4_USER_FEATURES-REQ-080]

## 1. Initial Test Written
- [ ] Create `src/reliability/entropy/__tests__/EntropyPauseController.test.ts`.
- [ ] Write a unit test that instantiates `EntropyPauseController` with `maxFailures: 5` and verifies `shouldPause()` returns `false` when `failureCount` is 0.
- [ ] Write a unit test that calls `recordFailure()` four times and asserts `shouldPause()` returns `false`.
- [ ] Write a unit test that calls `recordFailure()` five times and asserts `shouldPause()` returns `true`.
- [ ] Write a unit test that calls `recordFailure()` six times and asserts `shouldPause()` still returns `true` (idempotent after threshold).
- [ ] Write a unit test verifying `reset()` sets the counter back to 0 so `shouldPause()` returns `false` again.
- [ ] Write a unit test verifying `getFailureCount()` returns the exact number of times `recordFailure()` has been called since last `reset()`.
- [ ] Write a parametrized test for `maxFailures` values of 1, 3, and 5 to confirm the threshold is configurable.

## 2. Task Implementation
- [ ] Create `src/reliability/entropy/EntropyPauseController.ts`.
- [ ] Define the `EntropyPauseControllerOptions` interface: `{ maxFailures?: number }` (default `5`).
- [ ] Implement `EntropyPauseController` class:
  - `private failureCount: number` initialized to `0`.
  - `private readonly maxFailures: number` set from options (default `5`).
  - `recordFailure(): void` — increments `failureCount`.
  - `shouldPause(): boolean` — returns `this.failureCount >= this.maxFailures`.
  - `getFailureCount(): number` — returns `this.failureCount`.
  - `reset(): void` — sets `failureCount` to `0`.
- [ ] Export `EntropyPauseController` and `EntropyPauseControllerOptions` from `src/reliability/entropy/index.ts`.

## 3. Code Review
- [ ] Confirm `maxFailures` defaults to exactly `5` as specified in `4_USER_FEATURES-REQ-080`.
- [ ] Confirm `shouldPause()` uses `>=` not `>` (so at exactly 5 failures, pause triggers).
- [ ] Confirm `reset()` is the only mutation path for resetting the counter (no implicit resets elsewhere).
- [ ] Confirm the class is fully synchronous — no async, no I/O, no side effects.
- [ ] Confirm `EntropyPauseControllerOptions` uses an optional field so callers can omit it and get the default.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="EntropyPauseController"` and confirm all tests pass.
- [ ] Run `npm run lint src/reliability/entropy/EntropyPauseController.ts` with zero errors.

## 5. Update Documentation
- [ ] Append to `src/reliability/entropy/entropy.agent.md` a section on `EntropyPauseController`: purpose, `maxFailures` default, failure counting semantics, and the `reset()` lifecycle hook.
- [ ] Note in the agent.md that the `maxFailures` threshold is configurable to allow project-level tuning.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="EntropyPauseController"` and confirm 100% statement and branch coverage.
- [ ] Run `grep "maxFailures.*5\|5.*maxFailures" src/reliability/entropy/EntropyPauseController.ts` to verify the default of 5 is present in source.
