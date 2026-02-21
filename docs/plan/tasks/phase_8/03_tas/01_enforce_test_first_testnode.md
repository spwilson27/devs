# Task: Implement TestNode (Red Phase) enforcement to require failing tests before code edits (Sub-Epic: 03_TAS)

## Covered Requirements
- [TAS-004]

## 1. Initial Test Written
- [ ] Create a unit test file at tests/tdd/testnode.red.spec.ts using Vitest (or the repository's test runner if present). Write the following tests (they must be written before any implementation):
  - Test A: "rejects code edits when no failing tests exist"
    - Arrange: create a sandbox fixture with no failing tests (mock sandbox.runTests() => { failingTests: [] }).
    - Act: call TestNode.enforceRedPhase(sandbox)
    - Assert: expect result to be {allowed: false, reason: 'no_failing_test'}.
  - Test B: "allows progression when a failing test exists"
    - Arrange: sandbox.runTests() => { failingTests: ['should do X'] }
    - Act: call TestNode.enforceRedPhase(sandbox)
    - Assert: expect result to be {allowed: true}.
  - Note: these tests should fail initially (Red) and guide the implementation.

## 2. Task Implementation
- [ ] Implement src/tdd/TestNode.ts (TypeScript) with a single exported class TestNode and method enforceRedPhase(sandbox: ISandbox): Promise<{allowed: boolean; reason?: string}>.
  - ISandbox interface: runTests(): Promise<{ failingTests: string[]; stdout?: string; stderr?: string; }>
  - enforceRedPhase must:
    1. Call sandbox.runTests() inside a controlled timeout (configurable, default 30s).
    2. If failingTests.length === 0 return { allowed: false, reason: 'no_failing_test' }.
    3. If there is >=1 failing test return { allowed: true }.
    4. Log the test-report and attach the tag REQ:[TAS-004] in any emitted event/trace.
  - Export types and add JSDoc comments.
  - Add robust error handling: on timed-out runs return {allowed: false, reason: 'timeout'}.

## 3. Code Review
- [ ] Verify the implementation adheres to single responsibility (TestNode only inspects test state, does not edit files), is fully typed (TypeScript strict), contains JSDoc, and includes unit tests that cover positive and negative paths.
- [ ] Ensure the tests reference [TAS-004] in their descriptions or comments.

## 4. Run Automated Tests to Verify
- [ ] Install dev deps (pnpm add -D vitest @types/node -- if project uses pnpm) and run the tests: `pnpm vitest --run --reporter=json` (or `npm test` if project uses npm). Verify the two TestNode tests fail initially and then pass after implementation.

## 5. Update Documentation
- [ ] Update docs/tas/tdd.md (or docs/architecture/tdd.md) with a short section: "TestNode (Red Phase): enforces failing-test-first policy" and reference [TAS-004]. Update agent memory/short-term notes to include that TestNode is the gatekeeper for code edits.

## 6. Automated Verification
- [ ] After running tests, run `pnpm vitest --run --reporter=json > tmp/testnode-report.json` and validate programmatically that the JSON contains the two tests and that `stats.failed` is 0 after implementation. If using a different runner, use its JSON reporter and assert exit code === 0 and the expected test names appear.
