# Task: Implement planner CLI and API contract for partitioning and DoD validation (Sub-Epic: 05_Task_Constraints_And_Planning)

## Covered Requirements
- [9_ROADMAP-TAS-014], [9_ROADMAP-TAS-019], [9_ROADMAP-DOD-P5]

## 1. Initial Test Written
- [ ] Write tests `tests/cli/test_planner_cli.py` (pytest) that:
  - Invoke `src/cli/planner_cli.py` using `subprocess.run` or monkeypatch `argv` and assert commands:
    - `partition --input tests/fixtures/requirements_sample.json --output artifacts/partitioning_result.json` returns exit code 0 and produces a JSON file with 8-16 epics.
    - `validate-dod --epic artifacts/partitioning_result.json --rti tests/fixtures/sample_rti.json` returns JSON diagnostics and exit code 0 when epic passes gate, non-zero when fails.
  - Assert CLI output JSON schema matches contract (`pass: bool, issues: list`).

## 2. Task Implementation
- [ ] Implement `src/cli/planner_cli.py` (argparse):
  1. Commands:
     - `partition`: loads requirements JSON, calls `partition_requirements_to_epics()`, writes JSON output.
     - `validate-dod`: loads epic JSON and RTI JSON, calls `epic_start_gate()`, prints diagnostics JSON and returns exit code 0 on pass else 2.
  2. Use stdlib `argparse` and `json`; avoid adding new dependencies.
  3. Add basic integration tests that call functions directly to avoid heavyweight server startup.

## 3. Code Review
- [ ] Verify:
  - CLI returns stable JSON contract for UI integration.
  - Exit codes documented: `0` success, `2` validation failure, `1` usage error.
  - No network calls; deterministic outputs given fixed inputs.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/cli/test_planner_cli.py -q` and ensure pass.

## 5. Update Documentation
- [ ] Add `docs/api.md` describing the CLI contract and a future HTTP API contract (endpoints, request/response JSON schemas). Include example curl and CLI invocation.

## 6. Automated Verification
- [ ] Add `scripts/verify_cli_contract.sh` executing the two CLI commands with fixtures and validating JSON schema via a small python validator `scripts/validate_contract.py`; CI must run this script.
