# Task: Implement OOS Rejection Messaging & CLI/UI User Notification System (Sub-Epic: 03_Out-of-Scope Manifest - Content & Asset Generation)

## Covered Requirements
- [1_PRD-REQ-OOS-003], [1_PRD-REQ-OOS-005], [1_PRD-REQ-OOS-006], [1_PRD-REQ-OOS-007], [1_PRD-REQ-OOS-017]

## 1. Initial Test Written

- [ ] In `src/oos/__tests__/oosRejectionMessageBuilder.test.ts`, write a test suite `OOSRejectionMessageBuilder` that:
  - Imports `buildOOSRejectionMessage(result: OOSClassificationResult): OOSRejectionMessagePayload` from `src/oos/oosRejectionMessageBuilder.ts`.
  - Imports `formatOOSRejectionForCLI(payload: OOSRejectionMessagePayload): string` from `src/oos/oosRejectionMessageBuilder.ts`.
  - **Message content tests** (one per requirement ID):
    - For `matchedEntryId: "1_PRD-REQ-OOS-003"`: asserts the returned `message` contains the phrase `"logos, branding, or marketing copy"` and `suggestedAction` contains `"software engineering"`.
    - For `matchedEntryId: "1_PRD-REQ-OOS-005"`: asserts `message` contains `"firmware"` or `"embedded systems"` and `suggestedAction` references consulting a hardware specialist.
    - For `matchedEntryId: "1_PRD-REQ-OOS-006"`: asserts `message` contains `"app store"` and `suggestedAction` references manual app store submission.
    - For `matchedEntryId: "1_PRD-REQ-OOS-007"`: asserts `message` contains `"legal"` or `"compliance"` and `suggestedAction` references qualified legal counsel.
    - For `matchedEntryId: "1_PRD-REQ-OOS-017"`: asserts `message` contains `"3D"` or `"game asset"` and `suggestedAction` references DCC tools.
  - **CLI formatting tests:**
    - Asserts that `formatOOSRejectionForCLI` returns a string that begins with an `[OUT OF SCOPE]` prefix.
    - Asserts the output includes the `requirementId` in square brackets (e.g., `[1_PRD-REQ-OOS-003]`).
    - Asserts the output includes a "What devs CAN do" section with at least one example of a valid use case.
    - Asserts the output is no longer than 600 characters (to fit terminal width without wrapping excessively).
  - **Unknown ID test:** asserts that passing an unknown `matchedEntryId` throws an `UnknownOOSEntryError`.

## 2. Task Implementation

- [ ] Add to `src/oos/types.ts`:
  ```typescript
  export interface OOSRejectionMessagePayload {
    requirementId: string;
    entryName: string;
    message: string;          // Full explanation of the restriction
    suggestedAction: string;  // Actionable next step for the user
    validUseCases: string[];  // 2-3 examples of what devs CAN do instead
  }

  export class UnknownOOSEntryError extends Error {
    constructor(id: string) {
      super(`No OOS manifest entry found for id: ${id}`);
      this.name = 'UnknownOOSEntryError';
    }
  }
  ```
- [ ] Create `src/oos/oosRejectionMessageBuilder.ts`:
  - Define a private `MESSAGE_MAP: Record<string, { message: string; suggestedAction: string; validUseCases: string[] }>` object keyed by requirement ID, containing tailored messages for all five OOS entries:
    - `"1_PRD-REQ-OOS-003"`: message explains no logos/branding/marketing; suggested action: consult a designer or use specialized tools (Figma, Canva); valid use cases: `["Scaffold a React marketing page component", "Generate an API for a content management system", "Build a product analytics dashboard"]`.
    - `"1_PRD-REQ-OOS-005"`: message explains no firmware/embedded/RTOS; suggested action: consult hardware engineers or use manufacturer SDKs; valid use cases: `["Scaffold a TypeScript API that communicates with a device over HTTP", "Generate a Python data pipeline consuming device telemetry", "Create a web dashboard for IoT device monitoring"]`.
    - `"1_PRD-REQ-OOS-006"`: message explains no app store submission management; suggested action: use Fastlane or manual App Store Connect/Google Play Console workflows; valid use cases: `["Scaffold a React Native mobile app codebase", "Generate CI/CD pipeline configuration for automated build and test", "Create a pre-submission checklist generator script"]`.
    - `"1_PRD-REQ-OOS-007"`: message explains no legal/compliance certification; suggested action: consult qualified legal counsel and certified auditors; valid use cases: `["Scaffold a GDPR consent management UI component", "Generate a privacy policy template as a markdown document", "Create a data audit logging module to aid manual compliance review"]`.
    - `"1_PRD-REQ-OOS-017"`: message explains no 3D models/textures/game assets; suggested action: use Blender, Maya, or Unreal Engine for 3D asset creation; valid use cases: `["Scaffold a Three.js web application that loads existing 3D assets", "Generate a game server backend in Node.js", "Create a Unity C# script for player movement logic"]`.
  - Implement `buildOOSRejectionMessage(result: OOSClassificationResult): OOSRejectionMessagePayload`:
    1. Look up `result.matchedEntryId` in `MESSAGE_MAP`.
    2. If not found, throw `UnknownOOSEntryError`.
    3. Return the payload with `requirementId`, `entryName`, and the mapped fields.
  - Implement `formatOOSRejectionForCLI(payload: OOSRejectionMessagePayload): string`:
    - Format with `[OUT OF SCOPE] [${payload.requirementId}]` header.
    - Include the `message` and `suggestedAction`.
    - Include a `What devs CAN help with instead:` section listing `validUseCases` as bullet points.
    - Keep total output ≤ 600 characters.
- [ ] In `src/oos/oosGuardMiddleware.ts`, update the `OOSRejectionResponse` construction to use `buildOOSRejectionMessage` so the `message` and `suggestedAction` fields are populated from the message builder, not hardcoded inline.
- [ ] In the CLI output layer (`src/cli/output.ts` or equivalent), import `formatOOSRejectionForCLI` and use it to render OOS rejection responses to the terminal in a formatted, colour-coded block (use the existing CLI colour utilities — `chalk` or equivalent — with red for the header and yellow for suggestions).

## 3. Code Review

- [ ] Verify that `MESSAGE_MAP` is a `const` object and its keys are exhaustive for all five requirement IDs — TypeScript should produce a compile error if a key is missing (use a type assertion or `satisfies` to enforce this).
- [ ] Confirm that `formatOOSRejectionForCLI` does not exceed 600 characters for any known entry (write an assertion in the test for this).
- [ ] Confirm that the CLI colour formatting is isolated to `src/cli/output.ts` and that `oosRejectionMessageBuilder.ts` itself has no CLI-specific dependencies (it returns plain strings only).
- [ ] Confirm that `UnknownOOSEntryError` is exported from `src/oos/types.ts` and that calling `buildOOSRejectionMessage` with an invalid ID throws it — not a generic `Error`.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/oos/__tests__/oosRejectionMessageBuilder.test.ts --coverage`.
- [ ] Confirm all message content tests, CLI formatting tests, and the unknown ID error test pass with 0 failures.
- [ ] Run the full OOS test suite: `npx jest src/oos/ --coverage` and confirm 0 failures.
- [ ] Run `npx jest src/ --coverage` to confirm no regressions in the broader codebase.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add a `## Rejection Messaging` section to `src/oos/README.agent.md` documenting:
  - The `buildOOSRejectionMessage` and `formatOOSRejectionForCLI` function signatures.
  - The structure of `OOSRejectionMessagePayload`.
  - How to extend `MESSAGE_MAP` to add new OOS entries in future phases.
- [ ] Update the Phase 15 section of `docs/architecture/out-of-scope-manifest.md` with a complete list of all five OOS categories, their human-readable messages, and suggested actions.
- [ ] Update agent memory in `.devs/memory/phase_constraints.md` (or equivalent long-term memory file) with a note: `"Phase 15: OOS guard is active for content/asset generation categories (OOS-003, OOS-005, OOS-006, OOS-007, OOS-017). Requests matching these domains are rejected before entering the task DAG."`.

## 6. Automated Verification

- [ ] Run the following and confirm exit code `0`:
  ```bash
  npx jest src/oos/__tests__/oosRejectionMessageBuilder.test.ts --ci --passWithNoTests=false
  ```
- [ ] Run this smoke test confirming the full rejection pipeline (guard → builder → formatter):
  ```bash
  node -e "
  const { oosGuardMiddleware } = require('./dist/oos/oosGuardMiddleware');
  const { buildOOSRejectionMessage } = require('./dist/oos/oosRejectionMessageBuilder');
  const { formatOOSRejectionForCLI } = require('./dist/oos/oosRejectionMessageBuilder');

  const resp = oosGuardMiddleware({ userIntent: 'submit my app to app store connect' }, () => {});
  if (!resp.rejected) { console.error('FAIL: expected rejection'); process.exit(1); }
  if (resp.requirementId !== '1_PRD-REQ-OOS-006') { console.error('FAIL: wrong requirementId', resp.requirementId); process.exit(1); }
  const formatted = formatOOSRejectionForCLI({ requirementId: resp.requirementId, entryName: resp.entryName, message: resp.message, suggestedAction: resp.suggestedAction, validUseCases: [] });
  if (!formatted.startsWith('[OUT OF SCOPE]')) { console.error('FAIL: missing header'); process.exit(1); }
  if (formatted.length > 600) { console.error('FAIL: output too long', formatted.length); process.exit(1); }
  console.log('PASS');
  "
  ```
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
