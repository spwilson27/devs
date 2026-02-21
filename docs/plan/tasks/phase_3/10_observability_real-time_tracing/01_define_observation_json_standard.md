# Task: Define and Implement the Standardized Observation JSON Schema (Sub-Epic: 10_Observability & Real-Time Tracing)

## Covered Requirements
- [TAS-065], [1_PRD-REQ-NEED-DEVS-01]

## 1. Initial Test Written

- [ ] In `packages/core/src/protocol/__tests__/observation.schema.test.ts`, write unit tests for the `Observation` type guard and validator:
  - Test that a fully valid `Observation` object passes validation (all required fields present: `type`, `tool_call_id`, `timestamp_ns`, `exit_code`, `stdout`, `stderr`, `duration_ms`, `schema_version`).
  - Test that missing required fields (`tool_call_id`, `timestamp_ns`, `exit_code`) each individually cause validation to throw a `SchemaValidationError`.
  - Test that `stdout` and `stderr` fields containing non-UTF-8 binary data are coerced to a Base64-encoded string and the field `encoding` is set to `"base64"`.
  - Test that `schema_version` must be a semver string matching `"1.x.x"` pattern; assert validation rejects `"v1"` or `"2.0.0"`.
  - Test that `duration_ms` must be a non-negative number; reject `-1`.
  - Test that the `metadata` field, when present, is a flat `Record<string, string | number | boolean>`; reject nested objects.
  - Test that `createObservation()` factory sets `timestamp_ns` using `process.hrtime.bigint()` and produces a valid object.

## 2. Task Implementation

- [ ] Create `packages/core/src/protocol/observation.ts`:
  - Define and export the `Observation` TypeScript interface:
    ```typescript
    export interface Observation {
      schema_version: string;        // semver e.g. "1.0.0"
      type: "observation";
      tool_call_id: string;          // UUID linking back to the Action
      timestamp_ns: string;          // BigInt as decimal string (nanosecond precision)
      exit_code: number;             // 0 = success
      stdout: string;
      stderr: string;
      encoding: "utf8" | "base64";  // "base64" when binary content detected
      duration_ms: number;           // non-negative float
      metadata?: Record<string, string | number | boolean>;
    }
    ```
  - Implement `createObservation(partial: Partial<Observation> & Pick<Observation, 'tool_call_id' | 'exit_code' | 'stdout' | 'stderr' | 'duration_ms'>): Observation` factory function:
    - Auto-populate `schema_version: "1.0.0"`, `type: "observation"`, `timestamp_ns` via `process.hrtime.bigint().toString()`.
    - Detect non-UTF-8 bytes in `stdout`/`stderr` (check with `Buffer.isBuffer` or regex for null bytes); if found, Base64-encode and set `encoding: "base64"`, otherwise `encoding: "utf8"`.
  - Implement `validateObservation(obj: unknown): asserts obj is Observation`:
    - Use `zod` schema (`ObservationSchema`) to validate the object.
    - On failure, throw `SchemaValidationError` with a list of field paths and messages.
  - Define and export `ObservationSchema` using `zod` with all the constraints described in tests above.
  - Export `SchemaValidationError` class extending `Error` with a `fields: ZodIssue[]` property.
- [ ] Export all public symbols from `packages/core/src/protocol/index.ts`.

## 3. Code Review

- [ ] Verify the `Observation` interface fields exactly match the SAOP envelope `observation` segment documented in `specs/3_mcp_design.md`.
- [ ] Confirm `timestamp_ns` is stored as a decimal string (not a JS `number`), preventing loss of BigInt precision in JSON serialization.
- [ ] Confirm the `zod` schema version constraint uses `.regex(/^1\.\d+\.\d+$/)` not a loose string check.
- [ ] Ensure no circular imports exist between `observation.ts` and other files in `packages/core/src/protocol/`.
- [ ] Confirm `createObservation` is a pure function with no side effects beyond timestamp generation.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=observation.schema` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` to confirm no TypeScript compile errors.

## 5. Update Documentation

- [ ] Add a JSDoc comment block to the `Observation` interface and `createObservation` factory explaining field semantics and the binary-encoding fallback.
- [ ] Update `packages/core/README.md` (or create it if absent) with a section "Observation JSON Standard" referencing `TAS-065` and linking to the interface definition.
- [ ] Update `docs/agent-memory/protocol-decisions.md` (create if absent): record the decision to use nanosecond BigInt strings for `timestamp_ns` and the rationale for the Base64 encoding fallback.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=observation.schema` and assert line coverage ≥ 95% for `observation.ts`.
- [ ] Run `node -e "const {createObservation} = require('./packages/core/dist/protocol'); const o = createObservation({tool_call_id:'test-id', exit_code:0, stdout:'hello', stderr:'', duration_ms:1}); console.assert(o.type==='observation'); console.assert(o.schema_version==='1.0.0'); console.log('PASS');"` and confirm output is `PASS`.
