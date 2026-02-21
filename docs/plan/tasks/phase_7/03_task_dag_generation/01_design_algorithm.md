# Task: Design Epic & Task Generation Algorithm (Sub-Epic: 03_Task_DAG_Generation)

## Covered Requirements
- [9_ROADMAP-TAS-502]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/test_generation_algorithm.py targeting a deterministic generator function generate_roadmap(requirements: List[dict], options: dict) located at src/roadmap/generator.py.
  - Test: test_generate_roadmap_basic
    - Provide a synthetic input: 12 small requirement dicts: [{"id":"REQ-A","text":"Enable X"}, ...]. Call generate_roadmap(requirements, options={"target_epic_count":8, "max_task_loc":200, "seed":0}).
    - Assert the result is a dict with key "epics" which is a list, len(epics) between 1 and 16, each epic is a dict with keys: id, title, tasks (list).
    - Assert each task in every epic is a dict with keys: id, title, description, requirement_ids (list), epic_id, max_loc (<=200), estimate_tokens (int), success_criteria (string), dependencies (list).
    - Assert every source requirement id appears in at least one task.requirement_ids.
  - Test: test_task_atomicity
    - For every produced task assert task["max_loc"] <= 200 and len(task["description"]) < 2000 characters.
  - Edge tests: test_empty_input_returns_empty_epics and test_duplicate_requirements_are_merged

## 2. Task Implementation
- [ ] Implement the generator at src/roadmap/generator.py with a primary function generate_roadmap(requirements: List[dict], options: dict) -> dict.
  - Normalization phase: canonicalize requirement ids, strip duplicates, and produce a list of unique requirement objects.
  - Clustering/epic partitioning: implement an algorithm to group requirements into 8-16 epics. Provide a deterministic, testable default using lexical hashing + k-means on simple TF-IDF vectors; expose a pluggable embedding provider via dependency injection for later replacement.
  - Decomposition phase: for each requirement produce 1..N atomic tasks. Each task must respect the "max_loc" constraint (<=200). Task data model must include: id (uuid4), title (short), description (concise), requirement_ids: [req_id,...], epic_id, dependencies: [], estimate_tokens (heuristic), success_criteria (clear acceptance criteria), input_files (optional).
  - Output contract: {"epics": [{"id":..., "title":..., "tasks":[{...}]}], "metadata": {...}}
  - Determinism: accept options["seed"] to ensure stable outputs for tests.

## 3. Code Review
- [ ] Verify separation of concerns: generator should be pure (no DB calls), clustering vs decomposition separated into functions, embedding provider injected and mocked in tests, and code is covered by unit tests.
- [ ] Confirm each produced task respects the 200-line (max_loc) constraint and includes requirement mapping.
- [ ] Confirm docstrings and type annotations for public functions and use of logging for important steps.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_generation_algorithm.py -q
- [ ] Confirm tests pass and generator returns structures matching the assertions above.

## 5. Update Documentation
- [ ] Add docs/phase_7/task_generation_algorithm.md describing algorithm stages (Normalization -> Clustering -> Decomposition -> Output) and include a mermaid flow diagram showing dataflow.

## 6. Automated Verification
- [ ] Automated script: scripts/verify_generation.py
  - Call generate_roadmap with the synthetic fixture used in unit tests and assert: all tasks have max_loc <= 200, every input requirement id is present in at least one task.requirement_ids, and output JSON validates against a lightweight schema (e.g., jsonschema).
  - Return non-zero exit code on mismatch so CI can detect failures.