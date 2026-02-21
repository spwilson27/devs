# Task: End-to-End Pipeline Integration & Validation (Sub-Epic: 03_Task_DAG_Generation)

## Covered Requirements
- [9_ROADMAP-TAS-502], [9_ROADMAP-TAS-503], [4_USER_FEATURES-REQ-015]

## 1. Initial Test Written
- [ ] Create an end-to-end integration test at tests/integration/test_full_pipeline.py that exercises: requirement normalization -> epic partitioning -> task decomposition -> DAG building -> deadlock detection -> (cycle resolution if needed) -> execution.
  - Test: test_full_pipeline_happy_path
    - Fixture: prepare 20 synthetic requirements covering multiple clusters.
    - Steps: call generate_roadmap(requirements, options={"seed":0}), then build_dag(all_tasks), assert detect_deadlocks returns [] and topological_sort produces a valid ordering, then run DAGExecutor with mock runners and assert all tasks executed and every requirement id has at least one executed task mapped to it.
  - Test: test_full_pipeline_with_cycle_and_resolution
    - Fixture: craft requirements that intentionally lead to a small cycle after decomposition. Validate detect_deadlocks identifies the cycle, apply a programmatic resolution (use cycle_resolution.apply_resolution), rebuild DAG, and assert the executor can complete the run.

## 2. Task Implementation
- [ ] Compose a pipeline orchestration module at src/roadmap/pipeline.py that wires together generator, dag builder, deadlock detector, cycle resolver, and executor.
  - Provide a CLI entrypoint scripts/run_pipeline.py that accepts a requirements JSON file and flags: --dry-run, --resolve-cycles=auto|manual, --concurrency.
  - The orchestration must return a structured report that includes: epics summary, tasks count, cycles found (if any), resolutions applied, execution_report (if executed), and RTI map: mapping of requirement_id -> [task_ids].

## 3. Code Review
- [ ] Verify the pipeline is modular (each stage independently testable), error handling surfaces clear actionable messages, and the pipeline produces reproducible outputs when seed is fixed.
- [ ] Confirm the RTI mapping is complete for the happy-path test and that the CLI flags behave as documented.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/integration/test_full_pipeline.py -q

## 5. Update Documentation
- [ ] Add docs/phase_7/pipeline.md describing the end-to-end flow, CLI usage examples, and how cycle resolution choices affect output.

## 6. Automated Verification
- [ ] scripts/verify_full_pipeline.sh to run the CLI against the supplied fixtures and assert:
  - No cycles for happy-path fixture, executor exit code 0, and RTI coverage contains every input requirement id.
  - For cycle fixture, confirm cycles reported, resolutions applied (when auto), and eventual successful execution when resolution applied.