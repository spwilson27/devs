# Task: Implement ReasoningEngine (Sub-Epic: 13_2_TAS)

## Covered Requirements
- [2_TAS-REQ-023]

## 1. Initial Test Written
- [ ] Create a unit test that asserts the ReasoningEngine API exists and provides a `parse` method which converts SAOP/structured thought text into a deterministic JSON structure.
  - Test path: tests/unit/test_reasoning_engine.(py|spec.ts)
  - Behavior:
    1. Detect project language (package.json -> Node/Jest, pyproject.toml -> Python/pytest).
    2. Assert presence of `ReasoningEngine` with API: `parse(raw_output)`.
    3. Provide a small sample SAOP-like string in the test and assert that the parsed result is a dict/object containing keys such as `plan`, `steps`, and `actions`.
    4. The test MUST fail initially if ReasoningEngine is not implemented.

Example Jest skeleton (tests/unit/test_reasoning_engine.spec.ts):
```ts
import { ReasoningEngine } from '../../src/agents/reasoning_engine';

test('ReasoningEngine.parse returns structured SAOP object', () => {
  const sample = 'PLAN:\n- step: write test\nACTION:\n- run: pytest';
  const r = new ReasoningEngine();
  const out = r.parse(sample);
  expect(out).toBeDefined();
  expect(out.plan).toBeDefined();
  expect(Array.isArray(out.steps)).toBeTruthy();
});
```

Example pytest skeleton (tests/unit/test_reasoning_engine.py):
```py
import importlib

def test_reasoning_engine_parse():
    mod = importlib.import_module('agents.reasoning_engine')
    re = mod.ReasoningEngine()
    sample = 'PLAN:\n- step: write test\nACTION:\n- run: pytest'
    parsed = re.parse(sample)
    assert isinstance(parsed, dict)
    assert 'plan' in parsed
    assert 'steps' in parsed
```

## 2. Task Implementation
- [ ] Implement a minimal ReasoningEngine parser that handles the common SAOP envelope and returns a structured object.
  - File: src/agents/reasoning_engine.(py|ts)
  - Implement:
    - Class ReasoningEngine with method `parse(raw_output: string)` that:
      1. Attempts to JSON.parse the output if it appears to be JSON.
      2. Falls back to a deterministic line-based parser that extracts simple key sections (e.g., lines starting with "PLAN:", "STEPS:", "ACTION:") into arrays/strings.
      3. Returns an object: { plan: string|null, steps: string[], actions: string[] }.
  - Add clear unit-test-friendly behavior and avoid calling external LLM APIs.
  - Commit message: "tas: add ReasoningEngine SAOP parser (2_TAS-REQ-023)"

Implementation notes:
- Keep parsing deterministic and resilient: trim whitespace, normalize newlines, and ensure output schema is stable for unit tests.
- Add simple validation: if parser determines output is ambiguous return {error: 'ambiguous', raw: raw_output} so that higher-level agents can handle pivot logic.

## 3. Code Review
- [ ] Verify:
  - Parser handles both JSON and line-based SAOP fallback deterministically.
  - Output schema is documented and stable.
  - No network calls or external dependencies are introduced in this PR.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test command (language-detected):
  - Node: npm test -- --runTestsByPath tests/unit/test_reasoning_engine.spec.ts
  - Python: pytest -q tests/unit/test_reasoning_engine.py
- [ ] Confirm tests pass and record output to tests/artifacts/2_tas_req_023_test_output.txt.

## 5. Update Documentation
- [ ] Add docs/2_tas_req_023_reasoning_engine.md describing:
  - Parsing strategy and example inputs/outputs.
  - Edge cases and schema definition.
- [ ] Add a changelog entry.

## 6. Automated Verification
- [ ] Provide scripts/verify_2_tas_req_023.sh that:
  1. Runs the reasoning engine unit test.
  2. Prints a canonicalized JSON output for the included sample SAOP string.
- [ ] Script must be idempotent and CI-friendly.
