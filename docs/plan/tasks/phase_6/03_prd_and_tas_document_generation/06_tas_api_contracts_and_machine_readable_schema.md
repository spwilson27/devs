# Task: Implement TAS API/interface contract generation and machine-readable schema (Sub-Epic: 03_PRD and TAS Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-002], [9_ROADMAP-REQ-DOC-002]

## 1. Initial Test Written
- [ ] Create tests at tests/phase_6/03_prd_and_tas_document_generation/06_tas_api.spec.ts that assert:
  - Test: "generates minimal API contracts for described entities".
  - Arrange: brief describing resources (users, notes) and CRUD operations expected.
  - Act: const api = generateAPIContracts(brief);
  - Assert:
    - api is an array and contains an entry for GET /users and POST /notes (or similar)
    - Each contract entry includes path, method, requestSchema (optional), responseSchema (object)
    - responseSchema for GET /users is an array of user objects with required properties id and name

## 2. Task Implementation
- [ ] Implement src/generators/tas_api.ts with:
  - export function generateAPIContracts(brief: string): Array<{ path: string; method: string; requestSchema?: object; responseSchema: object }>
  - Implement a deterministic mapping from entity names to basic CRUD endpoints and a basic JSON Schema for request/response shapes.
- [ ] Wire generateAPIContracts into generateTASJSON so API contracts are part of the TAS machine-readable output.

## 3. Code Review
- [ ] Validate that generated JSON Schemas are minimal and that property types are reasonable (string, integer, boolean).
- [ ] Confirm no external network calls are present and code is pure and unit-testable.
- [ ] Ensure API contract naming and HTTP method conventions match project standards (use plural resource names, standard REST verbs).

## 4. Run Automated Tests to Verify
- [ ] Run pnpm jest tests/phase_6/03_prd_and_tas_document_generation/06_tas_api.spec.ts --runInBand and confirm green.

## 5. Update Documentation
- [ ] Add docs/phase_6/tas_api_contracts.md containing examples of generated API contract JSON and mapping rules from entities to endpoints.

## 6. Automated Verification
- [ ] Add scripts/verify_tas_api.js that imports generated API contracts from dist (or uses ts-node), validates basic structure (presence of GET /resource), and exits non-zero on failure. Include this in local verification steps.