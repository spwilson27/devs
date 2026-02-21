# Task: Implement User-Configurable Limits for Manual Intervention Thresholds (Sub-Epic: 33_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-065]

## 1. Initial Test Written
- [ ] Write unit tests in `src/tests/config/thresholds.test.ts` (or equivalent) to verify that the configuration loader properly parses `maxTurns` and `maxCost` limits.
- [ ] Write tests in `src/tests/engine/intervention.test.ts` to assert that when a task's turn count exceeds `maxTurns` or cost exceeds `maxCost`, an `InterventionPause` state is triggered.

## 2. Task Implementation
- [ ] Update the project's configuration schema (e.g., in `src/config/schema.ts`) to include `maxTurns` (integer) and `maxCost` (float) parameters.
- [ ] Implement tracking mechanisms in the `DeveloperAgent` turn logic (e.g., in `src/engine/agent_runner.ts`) to increment the turn count and accumulate token costs after each LLM call.
- [ ] Add a check at the beginning of each turn: if the threshold is exceeded, transition the agent state to `PAUSED_FOR_INTERVENTION`.

## 3. Code Review
- [ ] Ensure that cost calculation uses the standard pricing models configured in the project.
- [ ] Verify that the pause state cleanly halts the execution loop without losing the current agent context or task state.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite (e.g., `npm run test -- src/tests/config/thresholds.test.ts src/tests/engine/intervention.test.ts`) to ensure all tests pass.

## 5. Update Documentation
- [ ] Update `docs/configuration.md` to document the new `maxTurns` and `maxCost` settings.
- [ ] Log this architectural change in the agent memory (e.g., updating the TAS if necessary).

## 6. Automated Verification
- [ ] Run a verification script that initializes a task with `maxTurns=1`, simulates 2 turns, and asserts the agent enters a paused state programmatically.
