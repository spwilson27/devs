# Task: RefactorNode - Define Interface and Core Data Model (Sub-Epic: 12_3_MCP)

## Covered Requirements
- [3_MCP-TAS-085]

## 1. Initial Test Written
- [ ] Add unit tests that assert the RefactorNode data model and public interface serialize/deserialize cleanly and validate required fields.
  - Test file: tests/unit/test_refactornode_interface.py (or tests/refactornode/interface.test.ts if project uses JS/TS).
  - Tests to write:
    1. Instantiate RefactorNode with minimal valid payload: { task_id, node_id, changes: [] } and assert no exceptions.
    2. Assert required fields are present and typed: task_id (string), node_id (string/uuid), changes (list/array of change objects), metadata (optional dict/object).
    3. Serialize to JSON (or to_dict) and deserialize back; assert deep equality with original object.
    4. Validate that missing required fields raise a validation error (e.g., ValueError / TypeError / validation exception used in repo).
  - Use the repository's test runner (detect pytest, nose, or jest). If pytest is present, use assert-based tests; if jest, use describe/it blocks.

## 2. Task Implementation
- [ ] Implement the RefactorNode class and its type/schema in the codebase at src/agents/nodes/refactor_node.{py,ts,js}:
  - Public API: constructor(factory args), apply_patch(sandbox_path) -> {applied: bool, patch_id: string, changes_count: int}, to_dict()/from_dict() or toJSON()/fromJSON().
  - Internal fields: node_id, task_id, changes (each change must include file_path, start_line, end_line, replacement_text, metadata), created_at timestamp, status enum (pending/complete/failed).
  - Add lightweight validation on construction to enforce required fields and types; reuse existing project validation/helpers where available.
  - Add typing annotations or dataclass / interface definitions consistent with the repository style.
  - Add module-level docstring explaining purpose and invariants.

## 3. Code Review
- [ ] Verify the implementation follows repository patterns:
  - Uses existing error/exception types and logging conventions.
  - No side-effects in constructors; heavy work occurs in apply_patch.
  - Proper typing and runtime validation consistent with project (dataclass/pydantic/type guards for Python; interfaces/types for TS).
  - Public methods have docstrings and unit-level doc comments explaining edge-cases.

## 4. Run Automated Tests to Verify
- [ ] Run the test runner and ensure the interface tests fail initially (red) and then pass after implementation.
  - Commands to run: `pytest -q` or `npm test --silent` depending on repo. Use the repository README to select the runner.

## 5. Update Documentation
- [ ] Update docs/ or README section explaining the RefactorNode schema and public methods. Add a short example showing JSON payload and expected apply_patch return.
  - File: docs/agents/refactor_node.md or docs/refactor_node.md

## 6. Automated Verification
- [ ] Add a small script tests/verify_refactornode_interface.py (or scripts/verify_refactornode_interface.sh) which imports the node, constructs a canonical example, serializes, deserializes, and exits with non-zero code on mismatch. This script is runnable by CI to ensure the node interface stays stable.
