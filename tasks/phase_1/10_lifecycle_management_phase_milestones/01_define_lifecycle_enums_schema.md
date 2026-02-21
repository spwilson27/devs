# Task: Define Project Lifecycle Types and State Machine Schema (Sub-Epic: 10_Lifecycle Management & Phase Milestones)

## Covered Requirements
- [4_USER_FEATURES-REQ-001]

## 1. Initial Test Written
- [ ] Create unit tests in `@devs/core/tests/lifecycle/ProjectState.test.ts` to verify that project status and phase transitions follow a valid state machine.
- [ ] Write a test to ensure that the `projects` table in SQLite can store and retrieve `ProjectStatus` and `ProjectPhase` enums correctly.

## 2. Task Implementation
- [ ] Define `ProjectStatus` enum in `@devs/core/src/types/lifecycle.ts`:
  - `INITIALIZING`: System setup in progress.
  - `ACTIVE`: Orchestrator loop is running.
  - `PAUSED`: User or system-initiated pause.
  - `ERROR`: Fatal error state requiring intervention.
  - `COMPLETED`: Project delivered.
- [ ] Define `ProjectPhase` enum:
  - `FOUNDATION` (Phases 1-2)
  - `INTELLIGENCE` (Phases 3-5)
  - `AUTONOMY` (Phases 6-8)
  - `MULTI_MODAL` (Phase 7)
  - `VALIDATION` (Phase 8)
- [ ] Update the `projects` table schema in `@devs/core/persistence` to include:
  - `status`: TEXT (using the enum values)
  - `current_phase`: TEXT (using the enum values)
  - `last_milestone`: TEXT (nullable)
- [ ] Implement a `validateTransition(current, next)` helper to prevent invalid state changes (e.g., COMPLETED -> INITIALIZING).

## 3. Code Review
- [ ] Ensure TypeScript enums are strictly typed and used throughout the codebase for these values.
- [ ] Verify that the database schema updates are backward compatible or handled via a migration strategy (even if P1).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/core/tests/lifecycle/ProjectState.test.ts` and ensure all transitions and persistence tests pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/state_machine.md` to document the lifecycle states and phase transitions for future agent reference.

## 6. Automated Verification
- [ ] Run a script `scripts/verify_schema.ts` that inspects the `state.sqlite` file and confirms the `projects` table has the new columns with correct types.
