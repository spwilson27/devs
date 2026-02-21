# Task: Integrate OOS Guard Middleware into the Orchestrator Request Pipeline (Sub-Epic: 03_Out-of-Scope Manifest - Content & Asset Generation)

## Covered Requirements
- [1_PRD-REQ-OOS-003], [1_PRD-REQ-OOS-005], [1_PRD-REQ-OOS-006], [1_PRD-REQ-OOS-007], [1_PRD-REQ-OOS-017]

## 1. Initial Test Written

- [ ] In `src/oos/__tests__/oosGuardMiddleware.test.ts`, write a test suite `OOSGuardMiddleware` that:
  - Imports `oosGuardMiddleware` from `src/oos/oosGuardMiddleware.ts`.
  - Imports `OOSRejectionResponse` and `OOSGuardContext` from `src/oos/types.ts`.
  - Mocks `classifyContentAssetRequest` and `classifyHardwareAppStoreLegalRequest` from `src/oos/classifiers/index.ts` using `jest.mock`.
  - **Rejection path tests:**
    - When `classifyContentAssetRequest` returns a non-null `OOSClassificationResult` for `"Generate a logo"`, asserts that `oosGuardMiddleware` returns an `OOSRejectionResponse` with:
      - `rejected: true`
      - `requirementId: "1_PRD-REQ-OOS-003"`
      - `message` (string, non-empty)
      - `suggestedAction` (string, non-empty)
    - When `classifyHardwareAppStoreLegalRequest` returns a non-null result for `"Write firmware"`, asserts the same response shape with `rejected: true`.
  - **Pass-through path test:**
    - When both classifiers return `null`, asserts that `oosGuardMiddleware` returns `{ rejected: false }` and calls the provided `next` callback exactly once with the original request context.
  - **Priority order test:**
    - When both classifiers return non-null results simultaneously (mocked), asserts that the content/asset classifier (OOS-003/OOS-017) takes priority and the rejection cites the content/asset entry ID (classifier order must be deterministic).
  - **Integration test** (no mocks): Asserts that a real request string `"Generate a mascot for my brand"` triggers an `OOSRejectionResponse` with `rejected: true` and `requirementId: "1_PRD-REQ-OOS-003"` using the real classifier implementations.

## 2. Task Implementation

- [ ] Add the following interfaces to `src/oos/types.ts`:
  ```typescript
  export interface OOSGuardContext {
    userIntent: string;       // Raw user input or extracted intent string
    sessionId?: string;       // Optional for logging/tracing
  }

  export interface OOSRejectionResponse {
    rejected: true;
    requirementId: string;
    entryName: string;
    matchedKeyword: string;
    message: string;          // Human-readable explanation
    suggestedAction: string;  // What the user should do instead
  }

  export interface OOSPassResponse {
    rejected: false;
  }

  export type OOSGuardResponse = OOSRejectionResponse | OOSPassResponse;
  ```
- [ ] Create `src/oos/oosGuardMiddleware.ts`:
  - Import `classifyContentAssetRequest` and `classifyHardwareAppStoreLegalRequest` from `./classifiers/index`.
  - Implement `oosGuardMiddleware(context: OOSGuardContext, next: (ctx: OOSGuardContext) => void): OOSGuardResponse`:
    1. Run `classifyContentAssetRequest(context.userIntent)` first.
    2. If non-null, immediately return an `OOSRejectionResponse` without calling `next`.
    3. Run `classifyHardwareAppStoreLegalRequest(context.userIntent)`.
    4. If non-null, immediately return an `OOSRejectionResponse` without calling `next`.
    5. If both return `null`, call `next(context)` and return `{ rejected: false }`.
  - The `message` field in the rejection must be a complete sentence explaining the OOS restriction, referencing the `entryName`.
  - The `suggestedAction` field should guide the user toward valid devs use cases (e.g., `"devs can scaffold the codebase and integration points for your application. Please consult a specialist for [entryName]."`).
- [ ] Wire the middleware into the orchestrator's intake layer:
  - In `src/orchestrator/requestHandler.ts` (or the equivalent LangGraph.js entry node), import `oosGuardMiddleware` and call it before dispatching any agent task.
  - If `oosGuardMiddleware` returns `{ rejected: true }`, the request handler must return the rejection response to the caller without creating a new task in the SQLite state database.

## 3. Code Review

- [ ] Verify that `oosGuardMiddleware` is **synchronous** (no async) — classifiers are pure functions and must not require async execution.
- [ ] Confirm that the middleware never calls `next` when a rejection occurs — there must be no partial state created in the system for OOS requests.
- [ ] Confirm that the classifier invocation order (content/asset first, then hardware/app store/legal) is documented via a comment in the middleware to make the priority explicit.
- [ ] Verify that the `requestHandler.ts` integration returns the `OOSRejectionResponse` verbatim to the caller without logging sensitive user intent data beyond a redacted version.
- [ ] Ensure the `message` and `suggestedAction` strings are sourced from a dedicated message builder (not hardcoded inline) to support future localization.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/oos/__tests__/oosGuardMiddleware.test.ts --coverage`.
- [ ] Confirm all unit tests (mocked) and the integration test (real classifiers) pass with 0 failures.
- [ ] Run the full OOS test suite: `npx jest src/oos/ --coverage` and confirm 0 failures.
- [ ] Run any existing orchestrator integration tests: `npx jest src/orchestrator/ --coverage` and confirm no regressions.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add a `## Guard Middleware` section to `src/oos/README.agent.md` documenting:
  - The `oosGuardMiddleware` function signature.
  - The deterministic classifier invocation order.
  - The `OOSRejectionResponse` and `OOSPassResponse` shapes.
  - The integration point in `src/orchestrator/requestHandler.ts`.
- [ ] Update `docs/architecture/out-of-scope-manifest.md` with a section on the guard middleware and how it prevents OOS tasks from entering the task DAG.

## 6. Automated Verification

- [ ] Run the following and confirm exit code `0`:
  ```bash
  npx jest src/oos/__tests__/oosGuardMiddleware.test.ts --ci --passWithNoTests=false
  ```
- [ ] Run this end-to-end smoke test simulating an OOS request at the orchestrator boundary:
  ```bash
  node -e "
  const { oosGuardMiddleware } = require('./dist/oos/oosGuardMiddleware');
  const next = () => { console.error('FAIL: next() should not be called for OOS request'); process.exit(1); };
  const resp = oosGuardMiddleware({ userIntent: 'generate a logo for my startup' }, next);
  if (!resp.rejected || resp.requirementId !== '1_PRD-REQ-OOS-003') { console.error('FAIL', resp); process.exit(1); }
  const resp2 = oosGuardMiddleware({ userIntent: 'create a REST API in Express' }, () => {});
  if (resp2.rejected) { console.error('FAIL: valid request incorrectly rejected'); process.exit(1); }
  console.log('PASS');
  "
  ```
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
