# Task: Implement PRD machine-readable schema and validation (Sub-Epic: 03_PRD and TAS Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-001], [9_ROADMAP-REQ-DOC-001]

## 1. Initial Test Written
- [ ] Create tests at tests/phase_6/03_prd_and_tas_document_generation/03_prd_schema.spec.ts that validate the JSON schema for PRD:
  - Use a JSON Schema validator (ajv in Node) or the project's preferred validator.
  - Test: "PRD JSON conforms to schema" — assert that generatePRDJSON(brief) validates against schemas/prd.schema.json.
  - Test: "Round-trip: generatePRDJSON -> generatePRD -> parse back to JSON" should preserve top-level keys.

## 2. Task Implementation
- [ ] Create a JSON Schema at schemas/prd.schema.json describing the machine-readable PRD shape:
  - root: object with required properties: goals (array[string]), nonGoals (array[string]), userStories (array of objects { title:string, gherkin:string }), constraints (array[string]).
- [ ] Implement a validator utility src/utils/schemaValidator.ts that uses AJV (or a lightweight validator) to validate objects against a schema file.
- [ ] Integrate validation into tests and add a small CLI helper scripts/validate_prd_schema.js that loads a sample generated PRD JSON and validates it, printing errors to stdout and exiting non-zero on failure.

## 3. Code Review
- [ ] Ensure the JSON Schema is precise and minimal — document any optional fields.
- [ ] Confirm the validator returns helpful error messages and that tests assert the validator succeeds for correct samples and fails for malformed samples.

## 4. Run Automated Tests to Verify
- [ ] Install test-time dependency (if not present): pnpm add -D ajv
- [ ] Run pnpm jest tests/phase_6/03_prd_and_tas_document_generation/03_prd_schema.spec.ts --runInBand and confirm green.

## 5. Update Documentation
- [ ] Add schemas/prd.schema.json to docs/phase_6/schema_reference.md with commentary on each field and a short example.
- [ ] Document how the ArchitectAgent should consume generatePRDJSON vs. generatePRD in docs/agents/architect_agent.md.

## 6. Automated Verification
- [ ] Add a CI step (or local script) that runs node scripts/validate_prd_schema.js against a canonical example and fails CI on schema violations.