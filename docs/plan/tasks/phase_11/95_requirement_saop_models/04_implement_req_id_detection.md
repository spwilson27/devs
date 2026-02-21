# Task: Implement REQ-ID Detection in Thought Content (Sub-Epic: 95_Requirement_SAOP_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-019]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/req.detector.test.ts`, write unit tests for a `extractReqIds` function before implementing it:
  - **Single match**: Input `"Implementing [6_UI_UX_ARCH-REQ-019] now"` → returns `[{ id: "6_UI_UX_ARCH-REQ-019", startIndex: 14, endIndex: 35 }]`.
  - **Multiple matches**: Input `"See [1_PRD-REQ-INT-002] and [TAS-029]"` → returns two match objects in order of appearance.
  - **No match**: Input `"This has no requirement ID"` → returns `[]`.
  - **Partial bracket**: Input `"[not-a-req]"` → returns `[]` (must not match strings that don't conform to the REQ-ID pattern).
  - **REQ-ID at start of string**: Input `"[TAS-102]: description"` → returns one match.
  - **REQ-ID at end of string**: Input `"As defined in [9_ROADMAP-REQ-046]"` → returns one match.
  - **Nested brackets**: Input `"[[6_UI_UX_ARCH-REQ-019]]"` → still returns the inner ID correctly.
  - **Case sensitivity**: Confirm the regex does NOT match lowercase `[req-001]` but DOES match `[REQ-001]` (or define the exact valid pattern from the spec).
  - **Regex pattern documentation**: The test file must include a comment at the top documenting the exact accepted REQ-ID pattern: `\[([A-Z0-9_]+-REQ-[A-Z0-9_-]+)\]`.
- [ ] In `packages/ui-hooks/src/__tests__/req.detector.test.ts`, write tests for a `splitThoughtByReqIds(text: string)` function that returns an array of `TextSegment | ReqIdSegment` tokens suitable for rendering:
  - Input `"Thought [TAS-102] here"` → returns `[{ kind: "text", value: "Thought " }, { kind: "req_id", id: "TAS-102", raw: "[TAS-102]" }, { kind: "text", value: " here" }]`.
  - Input with no REQ-IDs → returns a single `{ kind: "text", value: originalString }` segment.
  - Input that is entirely a REQ-ID → returns a single `{ kind: "req_id", ... }` segment.

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/req.detector.ts`:
  - Define and export types:
    ```ts
    export interface ReqIdMatch {
      id: string;         // e.g., "6_UI_UX_ARCH-REQ-019"
      raw: string;        // e.g., "[6_UI_UX_ARCH-REQ-019]"
      startIndex: number;
      endIndex: number;
    }

    export type TextSegment  = { kind: "text";   value: string };
    export type ReqIdSegment = { kind: "req_id"; id: string; raw: string };
    export type ThoughtSegment = TextSegment | ReqIdSegment;
    ```
  - Implement and export `extractReqIds(text: string): ReqIdMatch[]`:
    - Uses the regex `/\[([A-Z0-9][A-Z0-9_]*-REQ-[A-Z0-9][A-Z0-9_-]*)\]/g` to find all matches.
    - Returns matches sorted by `startIndex` ascending.
  - Implement and export `splitThoughtByReqIds(text: string): ThoughtSegment[]`:
    - Calls `extractReqIds`, then splits the string into interleaved `TextSegment` and `ReqIdSegment` tokens.
    - Filters out empty `TextSegment` values (where `value === ""`).
- [ ] Re-export `extractReqIds`, `splitThoughtByReqIds`, `ReqIdMatch`, `ThoughtSegment`, `TextSegment`, `ReqIdSegment` from `packages/ui-hooks/src/index.ts`.

## 3. Code Review
- [ ] Verify the regex does not use catastrophic backtracking (i.e., no nested quantifiers on overlapping character classes).
- [ ] Verify `extractReqIds` always returns a new array (never mutates internal regex state).
- [ ] Verify the regex global flag `/g` is re-instantiated or `.lastIndex` is reset before each call to prevent stale state from a cached regex instance.
- [ ] Verify `splitThoughtByReqIds` handles adjacent REQ-IDs with no text between them (e.g., `"[TAS-102][TAS-029]"`), returning two `ReqIdSegment` entries with no `TextSegment` between them.
- [ ] Verify `splitThoughtByReqIds` produces segments that, when concatenated, exactly reconstruct the original input string.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all tests in `req.detector.test.ts` pass with zero failures.
- [ ] Run `pnpm --filter @devs/ui-hooks typecheck` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/ui-hooks test --coverage` and confirm `req.detector.ts` has ≥ 95% line coverage.

## 5. Update Documentation
- [ ] Add JSDoc to `extractReqIds` and `splitThoughtByReqIds` documenting the accepted REQ-ID regex pattern and referencing `[6_UI_UX_ARCH-REQ-019]`.
- [ ] Update `packages/ui-hooks/ui-hooks.agent.md` with: "REQ-ID detection uses `extractReqIds` / `splitThoughtByReqIds` in `req.detector.ts`. Pattern: `[NAMESPACE-REQ-ID]`. Output feeds the `ReqBadge` component."
- [ ] Update `packages/ui-hooks/README.md` with a "REQ-ID Detection" section.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/ui-hooks test --reporter=json > /tmp/req_detector_test_results.json` and verify exit code is `0`.
- [ ] Execute `cat /tmp/req_detector_test_results.json | jq '.numFailedTests'` and assert the value is `0`.
- [ ] Execute `pnpm --filter @devs/ui-hooks test --coverage --reporter=json > /tmp/req_detector_coverage.json` and assert `req.detector.ts` line coverage is ≥ 95%.
