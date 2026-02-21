# Task: Define PRD generator interface and write initial tests (Sub-Epic: 03_PRD and TAS Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-001], [9_ROADMAP-REQ-DOC-001]

## 1. Initial Test Written
- [ ] Create a unit test file at tests/phase_6/03_prd_and_tas_document_generation/01_prd_generator.spec.ts (TypeScript + Jest) that imports the generator interface from src/generators/prd and asserts the following **before** any implementation:
  - Test name: "prd generator exposes required API and produces required sections".
  - Arrange: const brief = "Create a lightweight notes app; goals: rapid prototyping; non-goals: long-term storage; user story: As a user, I want to create notes so that I can capture ideas.";
  - Act: const md = generatePRD(brief);
  - Assert (use regex / string contains assertions):
    - expect(md).toContain('## Goals')
    - expect(md).toContain('## Non-Goals')
    - expect(md).toContain('## User Stories')
    - expect(md).toMatch(/Given[\s\S]*When[\s\S]*Then/)
    - expect(md).toContain('## Constraints')
  - Also add a parallel unit test for the machine-readable API: import generatePRDJSON and assert that the returned object has keys: goals (array), nonGoals (array), userStories (array with objects that include a gherkin string), constraints (array).

## 2. Task Implementation
- [ ] Implement the minimal typed interface in src/generators/prd.ts:
  - export function generatePRD(brief: string): string
  - export function generatePRDJSON(brief: string): { goals: string[]; nonGoals: string[]; userStories: Array<{ title: string; gherkin: string }>; constraints: string[] }
- [ ] Implement a deterministic, test-driven minimal implementation that composes markdown sections by extracting heuristics from the brief (split by sentence and look for keywords `goal`, `non-goal`, `user story`, `constraint`) and otherwise generates placeholder content (deterministic templates) so tests pass without external LLM calls.
- [ ] Add an index export at src/generators/index.ts that re-exports the functions for easy import in tests.

## 3. Code Review
- [ ] Verify the module uses clear TypeScript typings, small pure functions, and no network/LLM calls in the initial implementation.
- [ ] Ensure the generated markdown uses the exact headings: "## Goals", "## Non-Goals", "## User Stories", "## Constraints".
- [ ] Confirm unit tests assert the presence of Gherkin-style steps (Given/When/Then) in the generated user story.
- [ ] Ensure functions are well-documented with JSDoc and have small, focused responsibilities.

## 4. Run Automated Tests to Verify
- [ ] Run the test file only to validate (preferred): pnpm jest tests/phase_6/03_prd_and_tas_document_generation/01_prd_generator.spec.ts --runInBand
- [ ] Fallback: npm test -- tests/phase_6/03_prd_and_tas_document_generation/01_prd_generator.spec.ts
- [ ] Confirm the test run exits with code 0.

## 5. Update Documentation
- [ ] Add docs/phase_6/prd_generator.md describing the public API, sample input, and expected markdown structure with a short example of generated PRD and the machine-readable JSON schema.
- [ ] Update the ArchitectAgent memory/notes file (docs/agents/architect_agent.md) with a short entry explaining the PRD generator interface and where tests live.

## 6. Automated Verification
- [ ] Run a Node one-liner to double-check outputs after tests: node -e "const {generatePRD}=require('./dist/generators/prd'); const out=generatePRD('Create a notes app goal: quick prototyping non-goal: long-term storage user story: as a user...'); if(!out.includes('## Goals')||!out.includes('## Non-Goals')) process.exit(2); console.log('VERIFIED')"
  - If the project is not yet compiled to dist, run ts-node or run the test command and re-run the one-liner against the compiled output.