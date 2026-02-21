# Task: Implement Agent-as-a-Service Boundary Guard (Sub-Epic: 02_Out-of-Scope Manifest - Platform & Runtime Services)

## Covered Requirements
- [1_PRD-REQ-OOS-004]

## 1. Initial Test Written
- [ ] In `src/guards/__tests__/aas-boundary.guard.test.ts`, write unit tests covering:
  - `AasBoundaryGuard.validate(request)` returns a `BoundaryViolation` error (not throws) when the incoming orchestrator request contains any of the following intent signals: `"maintain"`, `"monitor production"`, `"incident response"`, `"on-call"`, `"sre"`, `"keep alive"`, `"agent-as-a-service"`, `"long-term support"`.
  - `AasBoundaryGuard.validate(request)` returns `null` (no violation) for legitimate `devs` request intents such as `"generate project"`, `"run phase"`, `"export project"`.
  - The returned `BoundaryViolation` object contains: `requirementId: "1_PRD-REQ-OOS-004"`, `violationType: "OUT_OF_SCOPE"`, a human-readable `message`, and a `suggestedAction` field pointing users to the project handover (`devs export`) command instead.
  - Test that the guard does NOT mutate the input request object.
  - Integration test: Create a mock `OrchestratorRequest` pipeline and assert that inserting `AasBoundaryGuard` at the validation stage causes a `BOUNDARY_VIOLATION` event to be emitted on the event bus when an AaaS-type request is detected, and the pipeline halts without proceeding to agent execution.

## 2. Task Implementation
- [ ] Create `src/guards/boundary-violation.types.ts`:
  ```typescript
  export enum ViolationType {
    OUT_OF_SCOPE = 'OUT_OF_SCOPE',
  }

  export interface BoundaryViolation {
    requirementId: string;
    violationType: ViolationType;
    message: string;
    suggestedAction: string;
  }
  ```
- [ ] Create `src/guards/aas-boundary.guard.ts`:
  - Define `AAS_INTENT_SIGNALS: string[]` — an array of lowercase keyword/phrase fragments that indicate AaaS intent (see test cases above).
  - Implement `AasBoundaryGuard.validate(request: OrchestratorRequest): BoundaryViolation | null`:
    - Normalize `request.intent` to lowercase.
    - Check if any signal from `AAS_INTENT_SIGNALS` is a substring of the normalized intent.
    - If matched, return a `BoundaryViolation` with `requirementId: "1_PRD-REQ-OOS-004"`, an informative message, and `suggestedAction: "Use 'devs export' to hand over the project to a human maintainer."`.
    - If no match, return `null`.
  - Export the guard as a singleton instance: `export const aasBoundaryGuard = new AasBoundaryGuard()`.
- [ ] Register `AasBoundaryGuard` in the orchestrator's request validation pipeline (in `src/orchestrator/request-validator.ts` or equivalent). It should run before any agent is invoked. On violation, emit a `BOUNDARY_VIOLATION` event on the system event bus and return an error response to the caller without invoking agents.
- [ ] Create `src/guards/index.ts` exporting all guard types and instances.

## 3. Code Review
- [ ] Verify the guard is **stateless**: the `validate` method must not use or mutate any instance state.
- [ ] Verify `AAS_INTENT_SIGNALS` is declared as a `const` array and is not mutated at runtime.
- [ ] Verify that the guard is registered **before** any LLM call is initiated in the pipeline — check the orchestrator's middleware chain order.
- [ ] Verify that the `BoundaryViolation` object matches the shared `boundary-violation.types.ts` interface (no ad-hoc inline objects).
- [ ] Verify no `any` types are used; TypeScript strict mode must pass.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/guards/__tests__/aas-boundary.guard.test.ts --coverage` and confirm all tests pass with 100% branch coverage on the guard's `validate` method.
- [ ] Run `npm test` to confirm no regressions in the broader test suite.

## 5. Update Documentation
- [ ] Add `src/guards/aas-boundary.guard.agent.md` (AOD density file) documenting: the guard's purpose, the list of intent signals it intercepts, the `requirementId` it enforces, and instructions for adding new signals.
- [ ] Update `docs/architecture/boundary-guards.md` (create if absent) with a table row for `AasBoundaryGuard`: columns `Guard`, `RequirementID`, `Category`, `Intercepts`, `Suggested Action`.

## 6. Automated Verification
- [ ] Run the following smoke test script:
  ```bash
  npx ts-node -e "
  import { aasBoundaryGuard } from './src/guards/aas-boundary.guard';
  const violation = aasBoundaryGuard.validate({ intent: 'provide ongoing incident response for production' });
  if (!violation || violation.requirementId !== '1_PRD-REQ-OOS-004') process.exit(1);
  const ok = aasBoundaryGuard.validate({ intent: 'generate a new TypeScript project' });
  if (ok !== null) process.exit(1);
  console.log('AasBoundaryGuard: PASS');
  "
  ```
  Confirm exit code 0 and output `AasBoundaryGuard: PASS`.
