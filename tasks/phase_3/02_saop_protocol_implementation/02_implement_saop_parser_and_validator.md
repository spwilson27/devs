# Task: Implement SAOP Parser and Validator (Sub-Epic: 02_SAOP Protocol Implementation)

## Covered Requirements
- [9_ROADMAP-TAS-106], [9_ROADMAP-REQ-018], [3_MCP-TAS-070], [3_MCP-TAS-035]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/saop-parser.test.ts`, write unit tests that:
  - Test `parseSaopEnvelope(rawString: string): SaopEnvelope` with a valid JSON string and assert the returned object matches the input.
  - Test `parseSaopEnvelope` with a non-JSON string (e.g., `"not json"`) and assert it throws a `SaopParseError` with message containing `"Invalid JSON"`.
  - Test `parseSaopEnvelope` with valid JSON that fails schema validation (e.g., missing `thought`) and assert it throws a `SaopValidationError` with a list of AJV validation errors attached.
  - Test `validateSaopEnvelope(envelope: unknown): SaopEnvelope` with a valid plain object and assert it returns a typed `SaopEnvelope`.
  - Test `validateSaopEnvelope` with an invalid object and assert it throws `SaopValidationError` with the field path(s) in the error details.
  - Test that `SaopValidationError` instances have a `validationErrors` array property containing AJV `ErrorObject` entries.
  - Test that `parseSaopEnvelope` and `validateSaopEnvelope` are pure functions with no side effects (call twice with same input, assert same output).
  - Test `validateSaopEnvelope` with `schema_version` `"2.0.0"` and assert validation succeeds (schema_version is validated by format only, not pinned to a specific version).
  - Test that 100% of envelopes from the fixture file `__fixtures__/valid-envelopes.json` pass `validateSaopEnvelope`.
  - Test that 100% of envelopes from the fixture file `__fixtures__/invalid-envelopes.json` throw `SaopValidationError` when passed to `validateSaopEnvelope`.

- [ ] In `packages/core/src/protocol/__tests__/saop-validator.compliance.test.ts`, write a compliance test that:
  - Loads a set of 20 auto-generated synthetic envelopes (generated at test time using a factory function).
  - Passes each through `validateSaopEnvelope` and asserts zero failures.
  - Asserts the compliance rate is exactly 100% and logs the result to stdout in the format `"SAOP Compliance: 100% (20/20)"`.

## 2. Task Implementation
- [ ] Create `packages/core/src/protocol/errors.ts`:
  - Export class `SaopParseError extends Error` with constructor `(message: string, cause?: unknown)`.
  - Export class `SaopValidationError extends Error` with constructor `(message: string, public validationErrors: import('ajv').ErrorObject[])`.
- [ ] Create `packages/core/src/protocol/saop-parser.ts`:
  - Import `Ajv` from `ajv`, import `addFormats` from `ajv-formats`, and the schema from `./saop-envelope.schema.json`.
  - Compile the schema once at module load time into a reusable `validate` function (do NOT recompile per call).
  - Export `parseSaopEnvelope(rawString: string): SaopEnvelope`:
    1. Attempt `JSON.parse(rawString)`. On failure, throw `SaopParseError("Invalid JSON: <original error message>", originalError)`.
    2. Call `validateSaopEnvelope(parsed)` and return the result.
  - Export `validateSaopEnvelope(envelope: unknown): SaopEnvelope`:
    1. Run the compiled AJV `validate(envelope)`.
    2. If invalid, throw `SaopValidationError("SAOP envelope schema validation failed", validate.errors ?? [])`.
    3. Return `envelope as SaopEnvelope`.
- [ ] Create fixture files:
  - `packages/core/src/protocol/__tests__/__fixtures__/valid-envelopes.json`: Array of 5 complete, valid `SAOP_Envelope` objects covering all `observation.status` values.
  - `packages/core/src/protocol/__tests__/__fixtures__/invalid-envelopes.json`: Array of 5 invalid objects, each missing or mis-typing a different required field.
- [ ] Export `parseSaopEnvelope`, `validateSaopEnvelope`, `SaopParseError`, `SaopValidationError` from `packages/core/src/protocol/index.ts`.

## 3. Code Review
- [ ] Verify the AJV instance is created once and reused (module-level singleton), not instantiated inside the function body, to prevent performance regression.
- [ ] Verify `SaopParseError` and `SaopValidationError` are distinct classes, not merged, to allow `instanceof` discrimination by callers.
- [ ] Verify `validateSaopEnvelope` accepts `unknown` (not `any`) as its parameter type to enforce type-narrowing discipline.
- [ ] Verify the compliance test outputs a machine-parseable summary line in the format `"SAOP Compliance: 100% (N/N)"` which the CI pipeline can grep for.
- [ ] Verify no circular imports exist between `errors.ts`, `saop-parser.ts`, and `types.ts`.
- [ ] Verify the fixture files cover all four `observation.status` enum values across valid envelopes.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="saop-parser|saop-validator"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern="saop-parser|saop-validator"` and confirm statement coverage for `saop-parser.ts` and `errors.ts` is ≥ 95%.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## SAOP Parser & Validator` section to `packages/core/src/protocol/README.md` describing:
  - The two exported functions (`parseSaopEnvelope`, `validateSaopEnvelope`) and their signatures.
  - Error handling contract: which error class is thrown for which failure mode.
  - A code snippet showing correct usage by the orchestrator.
- [ ] Update `packages/core/index.agent.md` to record: "SAOP parser (`parseSaopEnvelope`) and validator (`validateSaopEnvelope`) implemented in `@devs/core/protocol/saop-parser.ts`. Both throw typed errors (`SaopParseError`, `SaopValidationError`). AJV validate function compiled once at module load. Compliance test validates 100% of envelopes."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="saop-validator.compliance" --verbose 2>&1 | grep "SAOP Compliance: 100%"` and assert the grep succeeds (exit code 0).
- [ ] Run `pnpm --filter @devs/core test 2>&1 | grep -E "failed|FAIL"` and assert the grep returns no results (exit code 1 from grep = no failures found).
- [ ] Confirm CI script `scripts/verify-saop-compliance.sh` exists and calls the above grep, exiting non-zero if the compliance line is absent.
