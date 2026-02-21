# Task: Implement Reasoning Ceiling Enforcement and Decomposition (Sub-Epic: 28_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-118]

## 1. Initial Test Written
- [ ] Create unit tests at tests/agents/test_reasoning_ceiling.py.
  - test_enforce_ceiling_triggers_decomposition: build a synthetic ReasoningContext object exceeding configured token/step ceiling (e.g., >1000 tokens) and assert ReasoningCeilingEnforcer.enforce(context) returns a Decomposition containing multiple subtasks and that the DeveloperAgent receives the decomposed tasks instead of the original oversized context.
  - test_truncation_preserves_essential_context: verify that key requirement lines (e.g., PRD acceptance criteria) are preserved after summarization/truncation and that the Decomposer provides a mapping back to original context indices.

## 2. Task Implementation
- [ ] Implement the reasoning ceiling enforcement pipeline in src/agents:
  - src/agents/reasoning_ceiling.py: ReasoningCeilingEnforcer
    - enforce(context: ReasoningContext, ceiling_tokens: int = 1000) -> Decomposition|ContextSummary
    - when ceiling exceeded: call Decomposer.decompose(context) which returns List[Subtask] (each with title, description, minimal context)
  - src/agents/decomposer.py: Decomposer
    - heuristics: split by high-level separators (HEADERS, function/class boundaries) and by semantic chunking (<= ceiling_tokens)
    - generate metadata for each subtask (origin_range, estimated_complexity)
  - DeveloperAgent turn loop: if ReasoningCeilingEnforcer.enforce returns decomposition, push subtasks to PlanNode as separate tasks.
  - Add config entry config/agents.yml: { reasoning_ceiling_tokens: 1000, decomposition_max_subtasks: 10 }
  - Provide a small CLI scripts/decompose_context.py that accepts a context file and emits a JSON array of subtasks for manual testing.

## 3. Code Review
- [ ] Verify:
  - Decomposer is deterministic given identical inputs and heuristics; randomized heuristics must be disabled in tests.
  - No loss of acceptance criteria — unit tests explicitly assert presence of certain key lines in decomposed subtasks.
  - Integration points in DeveloperAgent are feature-flag guarded via config.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/agents/test_reasoning_ceiling.py::test_enforce_ceiling_triggers_decomposition
- [ ] Run the CLI: python scripts/decompose_context.py --input tests/fixtures/large_context.txt | jq 'length > 1'

## 5. Update Documentation
- [ ] Add docs/agents/reasoning_ceiling.md documenting:
  - The rationale for a reasoning ceiling and default values.
  - Decomposition heuristics and how to tune them.
  - Examples of DeveloperAgent behavior when decomposition occurs.

## 6. Automated Verification
- [ ] Add tests/scripts/verify_reasoning_ceiling.py that feeds known large contexts and asserts that the decomposition count and preserved key-lines match an approved golden JSON file checked into tests/fixtures/.
