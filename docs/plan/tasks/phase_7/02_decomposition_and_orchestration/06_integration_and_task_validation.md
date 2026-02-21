# Task: Integration: Task Validation and Orchestration Verification (Sub-Epic: 02_Decomposition_And_Orchestration)

## Covered Requirements
- [1_PRD-REQ-PLAN-005]

## 1. Initial Test Written
- [ ] Add integration tests at `tests/integration/test_task_pipeline.py` and write them first:
  - [ ] `test_end_to_end_extract_split_and_validate()` runs the full pipeline on `tests/fixtures/sample_project/` (small set of specs) and asserts the pipeline outputs a `tasks/` directory of JSON/YAML task files where every file validates against `src/tasks/schema.validate_task`.
  - [ ] `test_tasks_include_required_fields()` iterates all generated tasks and asserts presence and non-empty values for `id`, `title`, `description`, `input_files`, `success_criteria`, and `dependencies`.
  - [ ] `test_integration_epic_assignment()` runs the partitioner on generated tasks and asserts output epics meet the configured constraints (8-16 range not required for small sample but the test asserts the partitioner runs without error and outputs epic metadata).

## 2. Task Implementation
- [ ] Implement integration harness `src/ci/integration_runner.py` that composes previously implemented modules in order: `spec_ingest.parse_documents -> splitter.split_requirement_into_tasks -> partitioner.partition_into_epics -> dag.build_dag` and writes artifacts to `artifacts/phase_7/`.
  - [ ] Ensure the harness returns non-zero exit code on any validation failure and writes a `pipeline_report.json` summarizing counts and any validation errors.

## 3. Code Review
- [ ] Verify the integration harness composes modules with clear boundaries, has retry/backoff where external calls are involved, and produces deterministic outputs for the same input set.
- [ ] Ensure end-to-end tests are hermetic and use fixture directories.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/integration/test_task_pipeline.py` and confirm success; CI should run this as part of a validation workflow.

## 5. Update Documentation
- [ ] Add `docs/integration.md` describing how to run the integration harness locally and in CI, and list the artifacts produced (`tasks/`, `epics.json`, `dag.json`, `pipeline_report.json`).

## 6. Automated Verification
- [ ] Add `tests/scripts/verify_integration.sh` that invokes the integration runner on `tests/fixtures/sample_project/` and validates `pipeline_report.json` contains `{"all_tasks_valid": true}` and exits with 0. CI should gate on this script.
