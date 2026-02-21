# Task: Track Intervention Frequency and Manual Rewinds per Epic (Sub-Epic: 36_1_PRD)

## Covered Requirements
- [1_PRD-REQ-MET-011]

## 1. Initial Test Written
- [ ] Create `tests/core/metrics/InterventionTracker.test.ts`.
- [ ] Write a test `should count manual rewinds per Epic` that fires mock `DEV_REWIND` and `HUMAN_OVERRIDE` events and asserts that the intervention counter increments correctly for the active Epic.
- [ ] Write a test `should flag Epic if interventions exceed 2` to verify that an alert or warning state is correctly derived when the threshold is crossed.

## 2. Task Implementation
- [ ] Create `src/core/metrics/InterventionTracker.ts`.
- [ ] Hook into the event bus for explicit human interaction events: `REWIND_EXECUTED`, `STRATEGY_OVERRIDE`, and `MANUAL_FILE_EDIT`.
- [ ] Implement logic to increment an `intervention_count` column in the `epics` table in `.devs/state.sqlite` whenever an intervention occurs within the context of that Epic.
- [ ] Implement a getter `getInterventionFrequency(epicId: string)` that returns the current count and evaluates it against the `<2` target threshold.

## 3. Code Review
- [ ] Review the event listeners to ensure duplicate events (e.g., UI retries) don't cause double-counting of a single intervention.
- [ ] Validate that updates to the `epics` table use ACID-compliant atomic increment operations.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/core/metrics/InterventionTracker.test.ts` to confirm correct counting logic.

## 5. Update Documentation
- [ ] Add "Intervention Frequency" definitions to `docs/architecture/metrics.md`.
- [ ] Update `docs/database/schema.md` to reflect the `intervention_count` column on the `epics` table.

## 6. Automated Verification
- [ ] Run `npm run verify-metrics -- --type interventions` which seeds the database with mock interventions and asserts the `getInterventionFrequency` output matches the expected count.
