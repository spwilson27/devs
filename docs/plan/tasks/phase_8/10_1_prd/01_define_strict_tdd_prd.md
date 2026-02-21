# Task: Define 'Strict TDD Loop' in PRD (Sub-Epic: 10_1_PRD)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] Create a unit test at tests/prd/strict_tdd_prd.test.js using Jest (Node.js). The test must:
  - Read docs/prd/strict_tdd_loop.md (path: docs/prd/strict_tdd_loop.md).
  - Assert the file exists and contains the following headings or phrases (case-insensitive):
    - "Strict TDD loop"
    - "Red Phase" and a short phrase indicating "failing test established first"
    - "Green Phase" and a phrase indicating "make tests pass"
    - "Refactor Phase" and a phrase indicating "preserve tests"
    - "Acceptance Criteria:" with at least one bullet describing: "No code change without an associated failing test" and "Atomic commit only after green phase".
  - Example assertion pseudo-code:

```js
const fs = require('fs');
test('PRD defines Strict TDD loop and acceptance criteria', () => {
  const text = fs.readFileSync('docs/prd/strict_tdd_loop.md', 'utf8');
  expect(text).toMatch(/Strict TDD loop/i);
  expect(text).toMatch(/Red Phase[\s\S]*failing test/i);
  expect(text).toMatch(/Green Phase[\s\S]*make the test pass/i);
  expect(text).toMatch(/Refactor Phase[\s\S]*preserve tests/i);
  expect(text).toMatch(/Acceptance Criteria:/i);
});
```

- [ ] Run the test first to confirm it fails (expected) with: `npx jest tests/prd/strict_tdd_prd.test.js --runInBand`.

## 2. Task Implementation
- [ ] Create the PRD fragment at docs/prd/strict_tdd_loop.md containing the authoritative specification for the Strict TDD loop. The document must include:
  - A concise definition of the required Red->Green->Refactor cycle.
  - Explicit acceptance criteria (machine-verifiable) including:
    - "Every implementation turn MUST begin by authoring a failing automated test in the sandbox."
    - "No source code files may be modified in the workspace unless there is an accompanying failing test that fails when run." 
    - "Only after tests are green may the agent create an atomic Git commit referencing the Task ID and including the Co-authored-by trailer." 
    - "Maximum implementation turn budget (e.g., 10 turns) and strategy pivot after 3 identical errors." 
  - Metrics to track (TAR, TTFC, test-flakiness rate) and the exact strings/keys agents must emit for telemetry.
  - A mermaid diagram illustrating Red -> Green -> Refactor and gates for Entropy Detector and CommitNode.

- [ ] Add a short example snippet in the PRD showing the minimal failing-test-first workflow as machine-readable pseudocode (2–6 lines) so automated validators can parse and assert presence.

- [ ] Commit the new PRD fragment in a single docs-only commit with message: "task(10_1_prd): add strict TDD loop PRD fragment - implements 1_PRD-REQ-PIL-003".

## 3. Code Review
- [ ] Verify PRD contains machine-verifiable acceptance criteria (exact phrases above), mermaid diagram, and example pseudocode.
- [ ] Confirm that the PRD does not introduce implementation details beyond the policy boundaries (no vendor lock-in), and that all bullet acceptance criteria are testable via the unit test added in section 1.
- [ ] Ensure the PRD fragment references the exact requirement ID: 1_PRD-REQ-PIL-003.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest tests/prd/strict_tdd_prd.test.js --runInBand` and confirm the test now passes after adding docs/prd/strict_tdd_loop.md.
- [ ] If the test still fails, update docs content until assertions succeed.

## 5. Update Documentation
- [ ] Add an index entry in docs/README.md (or docs/index.md) referencing docs/prd/strict_tdd_loop.md and include a one-line summary.
- [ ] Update project-level PRD table-of-contents if present.

## 6. Automated Verification
- [ ] Re-run the unit test and assert exit code 0. For CI, add a validation job step that executes the same test and fails the pipeline if the PRD fragment is missing or malformed.
- [ ] Add a tiny script scripts/verify_prd_strict_tdd.sh that exits non-zero if the required phrases are not present (used by CI). Ensure the script is called by CI pre-merge checks.