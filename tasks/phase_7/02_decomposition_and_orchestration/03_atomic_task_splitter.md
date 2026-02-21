# Task: Atomic Task Splitter (Spec → Atomic Tasks) (Sub-Epic: 02_Decomposition_And_Orchestration)

## Covered Requirements
- [2_TAS-REQ-003], [1_PRD-REQ-PLAN-004]

## 1. Initial Test Written
- [ ] Add tests at `tests/unit/test_splitter.py` that must be written first:
  - [ ] `test_split_single_requirement_into_atomic_tasks()` provides a long requirement text fixture and asserts the returned list of tasks has length >= 1, each task includes the required attributes (id, title, description, input_files, success_criteria, dependencies).
  - [ ] `test_task_size_limit_enforced()` provides a synthetic requirement that would create tasks exceeding 200 LOC naive estimate; assert the splitter breaks it into multiple tasks none of which exceed the estimated 200-line-change threshold.
  - [ ] `test_task_id_generation_is_deterministic()` asserts generated task IDs are stable given the same input and seed.

## 2. Task Implementation
- [ ] Implement `src/distiller/splitter.py` with `split_requirement_into_tasks(req_obj, max_loc=200) -> List[TaskDict]`:
  - [ ] Use sentence boundary detection (NLTK/spaCy or a light-weight rule-based splitter) to identify atomic sentences.
  - [ ] Group sentences into task-sized chunks using a deterministic packing algorithm until an estimated LoC (or token) threshold is reached; implement a simple LoC estimator based on sentence length and code-block heuristics.
  - [ ] Ensure each generated TaskDict contains: `id` (pattern `T-7-XXXX`), `title` (first sentence or summary), `description` (joined chunk), `input_files` (inferred from spec references), `success_criteria` (extracted from requirement clauses or synthesized test names), `dependencies` (empty or inferred from "depends on" language).
  - [ ] Export a dry-run mode `splitter.split_and_export(req_obj, out_dir, dry_run=True)` that writes JSON task files for inspection.

## 3. Code Review
- [ ] Verify deterministic behavior, adequate unit test coverage for edge cases, and that the splitting heuristic is documented and parameterizable.
- [ ] Ensure the implementation follows single responsibility (parsing vs splitting vs ID generation separated) and files remain <200 LOC where possible.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_splitter.py` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `docs/splitter.md` describing the splitting heuristic, configuration parameters (`max_loc`, token estimator), and example inputs/outputs.

## 6. Automated Verification
- [ ] Add an integration verification `tests/scripts/verify_splitter.sh` that runs the splitter over `tests/fixtures/` and asserts no task JSON file contains more than `max_loc` estimated LOC; produce a JSON report summarizing any violations.
