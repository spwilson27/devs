# Task: Bootstrap Workflow Definitions and Validation Logic (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-001], [9_PROJECT_ROADMAP-REQ-014], [9_PROJECT_ROADMAP-REQ-017], [9_PROJECT_ROADMAP-REQ-020], [9_PROJECT_ROADMAP-REQ-027], [9_PROJECT_ROADMAP-REQ-030], [9_PROJECT_ROADMAP-REQ-036], [9_PROJECT_ROADMAP-REQ-040], [9_PROJECT_ROADMAP-REQ-062], [9_PROJECT_ROADMAP-REQ-102], [9_PROJECT_ROADMAP-REQ-103], [9_PROJECT_ROADMAP-REQ-280], [9_PROJECT_ROADMAP-REQ-281], [9_PROJECT_ROADMAP-REQ-282], [9_PROJECT_ROADMAP-REQ-283], [9_PROJECT_ROADMAP-REQ-288], [9_PROJECT_ROADMAP-REQ-289], [9_PROJECT_ROADMAP-REQ-295], [9_PROJECT_ROADMAP-REQ-296], [9_PROJECT_ROADMAP-REQ-297], [9_PROJECT_ROADMAP-REQ-298], [9_PROJECT_ROADMAP-REQ-302], [9_PROJECT_ROADMAP-REQ-303]
- [8_RISKS-REQ-151] through [8_RISKS-REQ-200]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-scheduler, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new Python test `pytest .tools/tests/test_bootstrap_workflows.py`.
- [ ] Test cases must verify that the 6 standard bootstrap workflows (`presubmit-check`, `tdd-red`, `tdd-green`, `tdd-refactor`, `feature-complete`, `risk-audit`) are present in `workflows/bootstrap/`.
- [ ] Test cases must verify that each bootstrap workflow passes a YAML/TOML syntax check and matches the `WorkflowDefinition` schema.
- [ ] Test cases must verify that each workflow defines at least one `depends_on` relationship to exercise the DAG scheduler.

## 2. Task Implementation
- [ ] Create the directory `workflows/bootstrap/`.
- [ ] Implement the 6 standard bootstrap workflows as TOML files.
- [ ] Add the `bootstrap-verify` subcommand to `./do` that runs the syntax and schema check on all bootstrap workflows.
- [ ] Ensure that `devs-config` crate correctly parses and validates these specific workflows during server startup.
- [ ] Add the `risk-audit` workflow definition: it MUST include a stage that invokes `.tools/verify_requirements.py --risk-matrix`.
- [ ] Implement the platform verification logic: ensure each bootstrap workflow is marked as "verified" on Linux, macOS, and Windows in a new `target/bootstrap_status.json` file.

## 3. Code Review
- [ ] Verify that the bootstrap workflows are idiomatic and serve as good examples for users.
- [ ] Ensure the workflows are minimal and don't include unnecessary stages.
- [ ] Check that the `bootstrap-verify` script is integrated into the presubmit loop.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_bootstrap_workflows.py`.
- [ ] Run `./do bootstrap-verify` and verify all 6 workflows pass.

## 5. Update Documentation
- [ ] Document each bootstrap workflow and its intended usage in `docs/plan/specs/9_project_roadmap.md`.
- [ ] Update `MEMORY.md` to reflect the availability of the bootstrap workflows.

## 6. Automated Verification
- [ ] Introduce a deliberate syntax error in one of the bootstrap workflows and verify that `./do bootstrap-verify` fails.
- [ ] Verify `target/bootstrap_status.json` is correctly updated after a successful verification run.
