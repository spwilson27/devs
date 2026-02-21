# Task: Implement Cross-Language Semantic Verification for Requirements (Sub-Epic: 03_Cross-Verification & Validation Logic)

## Covered Requirements
- [4_USER_FEATURES-REQ-059]

## 1. Initial Test Written
- [ ] Create `tests/agents/nodes/test_cross_language_verification.py`.
- [ ] Write a test `test_cross_language_requirement_verification`. Mock a task where a requirement is provided in Spanish (e.g., "El sistema debe registrar errores") and the code diff is implemented in English (`logger.error("...")`).
- [ ] Assert the Reviewer correctly evaluates the semantic match and approves the requirement, despite the language difference.

## 2. Task Implementation
- [ ] Adjust the `ReviewNode` evaluation prompt in `src/agents/nodes/review_node.py`.
- [ ] Explicitly instruct the agent to perform semantic translation of requirements if they are in a different natural language than the source code variables, function names, or comments.
- [ ] Add concise few-shot examples within the prompt demonstrating how to map a non-English requirement to its English code implementation to guide the agent.

## 3. Code Review
- [ ] Verify that the prompt modifications do not bloat token usage unnecessarily.
- [ ] Ensure the few-shot examples are clear, diverse, and minimal.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest tests/agents/nodes/test_cross_language_verification.py` and ensure the cross-language semantic check passes.

## 5. Update Documentation
- [ ] Update `docs/features/cross_language_support.md` (or create it) to document the Reviewer Agent's capability to validate non-English requirements against an English codebase.

## 6. Automated Verification
- [ ] Run `pytest tests/agents/nodes/test_cross_language_verification.py --verify-prompt-size` (or equivalent check) to ensure the prompt remains within token budget after adding few-shot examples.
