# Task: Define TAS generator interface and write initial tests (Sub-Epic: 03_PRD and TAS Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-002], [9_ROADMAP-REQ-DOC-002]

## 1. Initial Test Written
- [ ] Create a unit test file at tests/phase_6/03_prd_and_tas_document_generation/04_tas_generator.spec.ts that imports generateTAS and generateTASJSON from src/generators/tas and asserts:
  - Test: "tas generator includes System Layout, ERD (Mermaid), and API/Interface Contracts".
  - Arrange: const brief = "Small notes app with users and notes; users have id/name/email; notes have id, user_id, body, created_at";
  - Act: const md = generateTAS(brief);
  - Assert:
    - expect(md).toContain('## System Layout')
    - expect(md).toContain('## Data Model')
    - expect(md).toMatch(/erDiagram|classDiagram|graph TD/)
    - expect(md).toContain('## API / Interface Contracts')
  - Also assert generateTASJSON(brief) returns an object with keys: systemLayout (string/structured), dataModel (mermaid string), apiContracts (array/object).

## 2. Task Implementation
- [ ] Implement TypeScript interface in src/generators/tas.ts with:
  - export function generateTAS(brief: string): string
  - export function generateTASJSON(brief: string): { systemLayout: string; dataModel: string; apiContracts: Array<{ path: string; method: string; requestSchema?: object; responseSchema?: object }> }
- [ ] Implement deterministic scaffolding that turns a simple text description into a mermaid ERD (use erDiagram syntax) and a minimal API contract (OpenAPI-like JSON snippet) for tests to pass.

## 3. Code Review
- [ ] Verify strong TypeScript types for generator outputs.
- [ ] Ensure ERD output uses valid Mermaid ERD markers (e.g., `erDiagram` blocks) so later renderer components can parse it.
- [ ] Confirm API contracts are small, precise, and use JSON Schema for request/response when possible.

## 4. Run Automated Tests to Verify
- [ ] Run pnpm jest tests/phase_6/03_prd_and_tas_document_generation/04_tas_generator.spec.ts --runInBand and confirm green.

## 5. Update Documentation
- [ ] Add docs/phase_6/tas_generator.md describing the TAS generator API, sample mermaid ERD output, and sample API contract JSON.
- [ ] Update docs/agents/architect_agent.md to reference generateTAS and the expected mermaid/data model format.

## 6. Automated Verification
- [ ] Run a Node one-liner to validate mermaid presence after tests: node -e "const {generateTAS}=require('./dist/generators/tas'); const out=generateTAS('users and notes'); if(!/erDiagram/.test(out)) process.exit(2); console.log('TAS MERMAID OK')"
  - Use ts-node if not compiled.