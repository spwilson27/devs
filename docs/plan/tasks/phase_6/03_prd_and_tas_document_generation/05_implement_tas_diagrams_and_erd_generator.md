# Task: Implement TAS diagrams and ERD (Mermaid) generator (Sub-Epic: 03_PRD and TAS Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-002], [9_ROADMAP-REQ-DOC-002]

## 1. Initial Test Written
- [ ] Create tests at tests/phase_6/03_prd_and_tas_document_generation/05_tas_erd.spec.ts that validate:
  - Test: "generates valid mermaid erDiagram for given data model description".
  - Arrange: brief describing two entities and relationship (e.g., user 1->* notes)
  - Act: const mermaid = generateERDMermaid(brief);
  - Assert:
    - expect(mermaid).toMatch(/erDiagram/) or expect(mermaid).toMatch(/\[.*\] --o \[.*\]/) depending on chosen mermaid syntax.
    - Parse mermaid text for expected entity names (users, notes) using simple string matches.

## 2. Task Implementation
- [ ] Implement helper in src/generators/tas_helpers.ts:
  - export function generateERDMermaid(brief: string): string
  - Implementation details:
    - Parse simple inline table definitions (e.g., "users: id, name, email; notes: id, user_id, body") and map to mermaid erDiagram:
      ```
      erDiagram
        USERS {
          int id
          string name
          string email
        }
        NOTES {
          int id
          int user_id
          string body
        }
        USERS ||--o{ NOTES : owns
      ```
    - Keep output deterministic for unit tests (consistent casing and ordering).
- [ ] Add unit tests that cover single-entity and one-to-many relationship.

## 3. Code Review
- [ ] Ensure mermaid output is deterministic and escapes reserved characters.
- [ ] Confirm helper is pure and easily testable; no rendering responsibilities in generator.
- [ ] Validate that the helper normalizes field types to mermaid-friendly types and documents limitations.

## 4. Run Automated Tests to Verify
- [ ] Run pnpm jest tests/phase_6/03_prd_and_tas_document_generation/05_tas_erd.spec.ts --runInBand and confirm green.

## 5. Update Documentation
- [ ] Add an example mermaid ERD snippet to docs/phase_6/tas_generator.md and note the supported syntax subset.

## 6. Automated Verification
- [ ] Provide a script scripts/verify_erd.js that loads sample definitions, runs generateERDMermaid, and checks for expected entity names and relationship markers; exit non-zero on failure.