# Task: Define Versioned JSON Schema for SAOP Agent Envelopes (Sub-Epic: 14_GDPR and Compliance Logging)

## Covered Requirements
- [9_ROADMAP-REQ-018]

## 1. Initial Test Written
- [ ] Create `src/saop/__tests__/agent-envelope.schema.test.ts`.
- [ ] Write a unit test using `ajv` that loads `src/saop/schemas/agent-envelope.v1.schema.json` and validates a known-good envelope object — assert `ajv.validate()` returns `true`.
- [ ] Write a unit test that validates a known-bad envelope (missing required `agentId` field) and asserts `ajv.validate()` returns `false` with `errors` containing an entry for `/agentId`.
- [ ] Write a unit test that validates an envelope with an unknown extra field and asserts it fails when `additionalProperties: false` is set in the schema.
- [ ] Write a unit test verifying the schema file itself has a `$schema` key referencing JSON Schema Draft-07 and a `version` property set to `"1"`.
- [ ] Write a test that loads all `*.schema.json` files under `src/saop/schemas/` using `glob`, parses them, and asserts each one compiles without AJV errors (schema-level linting).

## 2. Task Implementation
- [ ] Create `src/saop/schemas/agent-envelope.v1.schema.json` with the following structure:
  ```json
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://devs.internal/saop/agent-envelope/v1",
    "version": "1",
    "title": "SAOPAgentEnvelope",
    "type": "object",
    "required": ["envelopeId", "agentId", "taskId", "timestamp", "messageType", "payload", "schemaVersion"],
    "additionalProperties": false,
    "properties": {
      "envelopeId":     { "type": "string", "format": "uuid" },
      "agentId":        { "type": "string", "minLength": 1 },
      "taskId":         { "type": "string", "minLength": 1 },
      "timestamp":      { "type": "string", "format": "date-time" },
      "messageType":    { "type": "string", "enum": ["task_request", "task_result", "heartbeat", "error", "directive"] },
      "payload":        { "type": "object" },
      "schemaVersion":  { "type": "string", "pattern": "^\\d+$" },
      "correlationId":  { "type": "string", "format": "uuid" },
      "traceId":        { "type": "string" }
    }
  }
  ```
- [ ] Create `src/saop/schemas/index.ts` that exports a pre-compiled AJV validator: `export const validateAgentEnvelope = ajv.compile(schema)`.
- [ ] Add `ajv` and `ajv-formats` to `package.json` dependencies (run `npm install ajv ajv-formats`).
- [ ] Add a schema versioning convention to `docs/saop-protocol.md` (create if missing): each breaking change bumps the filename version suffix and `schemaVersion` field.

## 3. Code Review
- [ ] Confirm `additionalProperties: false` is set at the top level so unknown fields cause validation failure.
- [ ] Confirm `format: "uuid"` is applied to `envelopeId` and `correlationId` and that `ajv-formats` is loaded to enforce format validation.
- [ ] Confirm `messageType` is an `enum` — no free-form strings allowed.
- [ ] Confirm the schema `$id` uses the `devs.internal` namespace (not a real external URL) to prevent accidental external resolution.
- [ ] Confirm the exported `validateAgentEnvelope` validator is compiled once at module load time (not per-call) for performance.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=agent-envelope.schema` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm no new errors.
- [ ] Run `npm run build` to confirm TypeScript compilation succeeds.

## 5. Update Documentation
- [ ] Update `docs/saop-protocol.md` with the full schema field descriptions and versioning policy.
- [ ] Add requirement mapping comment to `src/saop/schemas/index.ts`: `// REQ: 9_ROADMAP-REQ-018`.
- [ ] Update `CHANGELOG.md`: "feat(saop): define versioned JSON schema v1 for SAOP agent envelopes".
- [ ] Update `docs/agent-memory/phase_14.agent.md`: note that SAOP envelope schema v1 lives at `src/saop/schemas/agent-envelope.v1.schema.json` and is AJV-compiled.

## 6. Automated Verification
- [ ] Run `npm run validate` and confirm exit code 0.
- [ ] Run `node -e "const {validateAgentEnvelope} = require('./dist/saop/schemas'); console.log(validateAgentEnvelope({}))"` and confirm output contains `false` (empty object fails validation as expected).
- [ ] Run `npm test -- --coverage --testPathPattern=agent-envelope.schema` and confirm coverage ≥ 90% for schema index file.
