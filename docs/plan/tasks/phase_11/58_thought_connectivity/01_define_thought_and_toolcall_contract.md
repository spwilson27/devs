# Task: Define Thought <-> ToolCall Message Contract (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-084]

## 1. Initial Test Written
- [ ] Add a unit test that validates the wire-format contract for Thought and ToolCall messages before any code changes.
  - File: tests/protocol/thought-toolcall-contract.test.ts
  - Use the project's unit test runner (e.g., jest). Command to run locally: `pnpm test -- tests/protocol/thought-toolcall-contract.test.ts` (or `npm test -- tests/...`).
  - Test outline (pseudocode):
    1. Import serializer/validator functions from `src/protocol`.
    2. Create a canonical Thought object: `{ id: 'thought-abc', text: 'Assume X', timestamp: 1610000000 }`.
    3. Create a ToolCall object that references the thought: `{ id: 'tool-1', tool: 'shell', args: ['echo hi'], sourceThoughtId: 'thought-abc' }`.
    4. Serialize the ToolCall and assert the serialized JSON contains `sourceThoughtId: 'thought-abc'`.
    5. Deserialize and assert the returned object has `.sourceThoughtId === 'thought-abc'` and types validate against the TypeScript interface.

## 2. Task Implementation
- [ ] Implement TS interfaces and serializers for the message contract.
  - Files to add/update:
    - `src/protocol/messages.ts` (new)
      - Export interfaces:
        - `export interface Thought { id: string; text: string; timestamp: number; meta?: Record<string, unknown>; }
        - `export interface ToolCall { id: string; tool: string; args: unknown; sourceThoughtId?: string; timestamp?: number }`
    - `src/protocol/serializer.ts` (new/modify)
      - Add `serializeToolCall(toolCall: ToolCall): string` and `deserializeToolCall(json: string): ToolCall` helpers.
  - Maintain backward compatibility by making `sourceThoughtId` optional and preserve existing fields exactly.
  - Add JSON Schema: `specs/schemas/thought_toolcall.schema.json` with required/optional properties and example documents.

## 3. Code Review
- [ ] Verify the following in PR review:
  - Type names are explicit and camelCase (`sourceThoughtId`).
  - `sourceThoughtId` is optional and non-breaking; existing consumers should not fail when it is absent.
  - No sensitive data is included in the new field; ensure `meta` and `args` are sanitized in serializers.
  - Serializer uses deterministic ordering for fields (optional) for test stability.

## 4. Run Automated Tests to Verify
- [ ] Execute the new unit test and the protocol test suite:
  - `pnpm test -- tests/protocol/thought-toolcall-contract.test.ts`
  - Ensure `serialize`/`deserialize` round-trips pass and type guards succeed.

## 5. Update Documentation
- [ ] Update `docs/protocol.md` (or `specs/protocol.md`) with:
  - JSON examples for Thought and ToolCall messages including `sourceThoughtId`.
  - The JSON Schema path `specs/schemas/thought_toolcall.schema.json` and usage examples.

## 6. Automated Verification
- [ ] Add a lightweight Node script `scripts/verify-thought-toolcall.js` that loads the schema (using `ajv`) and validates example files in `specs/examples/`.
  - Run `node scripts/verify-thought-toolcall.js` as final verification in CI for this PR.