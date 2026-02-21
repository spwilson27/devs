# Task: Define SAOP Envelope JSON Schema (Sub-Epic: 02_SAOP Protocol Implementation)

## Covered Requirements
- [TAS-035], [3_MCP-TAS-035], [3_MCP-TAS-070]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/saop-envelope.schema.test.ts`, write unit tests that:
  - Assert a valid `SAOP_Envelope` object with all required fields (`turn_index`, `agent_id`, `phase`, `schema_version`, `thought`, `action`, `observation`) passes JSON Schema validation.
  - Assert that an envelope missing `thought` fails schema validation with a descriptive error.
  - Assert that an envelope missing `action` fails schema validation.
  - Assert that an envelope missing `observation` fails schema validation.
  - Assert that `turn_index` must be a non-negative integer; test with `-1` and `"0"` (string) and assert both fail.
  - Assert that `action.tool_name` is required and must be a non-empty string.
  - Assert that `action.arguments` must be an object (not an array or primitive).
  - Assert that `observation.status` must be one of the enum values: `"success"`, `"error"`, `"timeout"`, `"partial"`.
  - Assert that `observation.output` must be a string.
  - Assert that `schema_version` must follow semver format (e.g., `"1.0.0"`); test with `"1"` and assert it fails.
  - Assert that additional properties not in the schema are rejected (i.e., `additionalProperties: false`).
  - Test a batch of 10 envelope fixture objects (mix of valid and invalid) and assert correct pass/fail for each.

## 2. Task Implementation
- [ ] Create the directory `packages/core/src/protocol/` if it does not exist.
- [ ] Create `packages/core/src/protocol/saop-envelope.schema.json` with the following structure (JSON Schema Draft-07):
  ```json
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://devs.ai/schemas/saop-envelope/1.0.0",
    "title": "SAOP_Envelope",
    "type": "object",
    "required": ["schema_version", "turn_index", "agent_id", "phase", "thought", "action", "observation"],
    "additionalProperties": false,
    "properties": {
      "schema_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
      "turn_index": { "type": "integer", "minimum": 0 },
      "agent_id": { "type": "string", "minLength": 1 },
      "phase": { "type": "string", "minLength": 1 },
      "thought": {
        "type": "object",
        "required": ["reasoning", "plan"],
        "additionalProperties": false,
        "properties": {
          "reasoning": { "type": "string", "minLength": 1 },
          "plan": { "type": "string", "minLength": 1 },
          "uncertainty": { "type": "string" }
        }
      },
      "action": {
        "type": "object",
        "required": ["tool_name", "arguments"],
        "additionalProperties": false,
        "properties": {
          "tool_name": { "type": "string", "minLength": 1 },
          "arguments": { "type": "object" }
        }
      },
      "observation": {
        "type": "object",
        "required": ["status", "output"],
        "additionalProperties": false,
        "properties": {
          "status": { "type": "string", "enum": ["success", "error", "timeout", "partial"] },
          "output": { "type": "string" },
          "error_detail": { "type": "string" }
        }
      }
    }
  }
  ```
- [ ] Create `packages/core/src/protocol/types.ts` exporting TypeScript interfaces mirroring the schema:
  - `SaopThought`, `SaopAction`, `SaopObservation`, `SaopEnvelope`.
  - Use `as const` for the `observation.status` enum union type `"success" | "error" | "timeout" | "partial"`.
- [ ] Export all types from `packages/core/src/protocol/index.ts`.
- [ ] Add `ajv` and `ajv-formats` as dependencies in `packages/core/package.json` if not already present, and run `pnpm install`.

## 3. Code Review
- [ ] Verify the JSON Schema file is valid Draft-07 and can be parsed by `ajv` without errors.
- [ ] Verify TypeScript interfaces exactly match the JSON Schema structure with no drift (every required field is non-optional in the TS type, every optional field uses `?`).
- [ ] Verify `additionalProperties: false` is set at every level of the schema to enforce strict typing.
- [ ] Verify the schema `$id` uses the canonical `https://devs.ai/schemas/saop-envelope/<version>` URL pattern for future versioning.
- [ ] Verify no business logic is embedded in the schema file itself — it must be a pure data contract.
- [ ] Verify the `packages/core/src/protocol/index.ts` barrel file exports all public types and the schema path constant.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="saop-envelope.schema"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core build` and confirm TypeScript compilation succeeds with zero type errors.

## 5. Update Documentation
- [ ] Add a `## SAOP Envelope Schema` section to `packages/core/src/protocol/README.md` (create if absent) describing:
  - The purpose of `SAOP_Envelope` as the atomic unit of agent communication.
  - A table of all top-level fields, their types, and whether they are required.
  - A valid example envelope (JSON code block).
  - The schema versioning strategy (`schema_version` semver bump policy).
- [ ] Update `packages/core/index.agent.md` (agent memory file) to record: "SAOP envelope schema defined at `@devs/core/protocol/saop-envelope.schema.json` using JSON Schema Draft-07. TypeScript types exported from `@devs/core/protocol`."

## 6. Automated Verification
- [ ] Run the script `scripts/verify-schema-export.sh` (create it if absent) which:
  1. Uses `node -e "require('@devs/core/protocol')"` to confirm the package exports resolve without error.
  2. Uses `node -e "const s = require('./packages/core/src/protocol/saop-envelope.schema.json'); const Ajv = require('ajv'); const ajv = new Ajv(); ajv.compile(s); console.log('schema_ok')"` and asserts `schema_ok` is printed.
  3. Exits non-zero if either check fails.
- [ ] Confirm the script exits with code `0`.
