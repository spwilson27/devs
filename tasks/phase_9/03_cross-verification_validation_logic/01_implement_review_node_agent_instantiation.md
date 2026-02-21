# Task: Implement Independent Reviewer Agent Instantiation in LangGraph (Sub-Epic: 03_Cross-Verification & Validation Logic)

## Covered Requirements
- [1_PRD-REQ-REL-004], [TAS-074]

## 1. Initial Test Written
- [ ] Create `tests/agents/nodes/test_review_node.py`.
- [ ] Write a unit test `test_review_node_initialization` that verifies the `ReviewNode` class instantiates a distinct LLM chain/agent instance separate from the `DeveloperAgent`.
- [ ] Write a test `test_review_node_sandbox_isolation` that verifies the agent is configured to execute within a clean, isolated sandbox environment mock rather than sharing the developer's state.
- [ ] Assert that the node's system prompt includes a "Hostile Auditor" persona.

## 2. Task Implementation
- [ ] Create `src/agents/nodes/review_node.py` (or the equivalent path for LangGraph nodes).
- [ ] Define the `ReviewNode` class, ensuring it inherits from the base node type used in the project's state machine.
- [ ] Implement the `__init__` or setup method to configure an independent LLM instance.
- [ ] Inject the clean sandbox context into the node's execution environment.
- [ ] Define the "Hostile Auditor" system prompt instructing the agent to rigorously verify the incoming code diff.

## 3. Code Review
- [ ] Verify that Dependency Injection (DI) is used correctly for providing the sandbox services to the `ReviewNode`.
- [ ] Ensure the Reviewer Agent instance strictly does not inherit the same conversation memory or context window as the Developer Agent.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest tests/agents/nodes/test_review_node.py` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Update `docs/agent_architecture.md` to detail the `ReviewNode` lifecycle, highlighting its independent instantiation and sandbox isolation.
- [ ] Record the separation of concerns between Developer and Reviewer in the agent's medium-term memory.

## 6. Automated Verification
- [ ] Run a structural verification script (e.g., `python scripts/verify_agent_isolation.py --node=ReviewNode`) to confirm the module doesn't import or share state with `DeveloperNode`.
