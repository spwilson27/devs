# Task: Implement Architect Agent decomposition and PlanNode integration (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-019]

## 1. Initial Test Written
- [ ] Write an integration-style unit test at `tests/integration/test_architect_decomposition.py`.
  - Test setup: Create a mock `Task` object flagged as high complexity (use the complexity detector). Mock `ArchitectAgent.decompose` to return a list of 3 subtask dicts where each subtask contains `title`, `description`, and `estimated_loc <= 200`.
  - Assertions:
    - `PlanNode.process(task)` invokes `ArchitectAgent.decompose` exactly once with the original task payload.
    - The returned subtask list is persisted (or enqueued) in the project's tasks store with a link back to the parent task (e.g., `parent_task_id`).
    - Each generated subtask includes a `REQ-ID` tag propagated from the parent task or newly assigned by the decomposer.

## 2. Task Implementation
- [ ] Implement or extend `devs/agents/architect.py` with a stable `decompose(task)` interface returning `List[Dict]`.
  - Implement `devs/plannode/plan_node.py` behavior to call `ArchitectAgent.decompose(task)` when `is_high_complexity` is True.
  - Ensure the PlanNode creates persistent subtask representations in the same schema used by the system's task queue (include fields: id, parent_id, title, description, estimated_loc, created_by='architect.decompose').
  - Validate that each generated subtask enforces the 200 LoC limit in code (if Architect returns >200 LoC for a single subtask, PlanNode should reject and request re-decomposition).

## 3. Code Review
- [ ] Ensure calls to the Architect Agent are idempotent (safe to retry) and that PlanNode deduplicates duplicate decompositions.
- [ ] Verify auditability: each decomposition should include SAOP trace entries linking the original task -> decompose request -> returned subtask IDs.
- [ ] Confirm subtask IDs are globally unique and reversible to reconstruct parent-child relationships.

## 4. Run Automated Tests to Verify
- [ ] Run the new integration test `python -m pytest tests/integration/test_architect_decomposition.py -q` and confirm behavior.
- [ ] Add a quick end-to-end smoke test where a synthetic large task flows through PlanNode and results in N subtasks persisted.

## 5. Update Documentation
- [ ] Update `docs/agents/architect.md` and `docs/architecture/plan_node.md` describing the `decompose` contract, expected return schema, and failure modes (re-decompose, human arbitration).

## 6. Automated Verification
- [ ] Add an automated integration marker that runs the decomposer test in CI and validates that every generated subtask's `estimated_loc` <= 200; fail the build if any subtask exceeds the limit.
