# Task: Implement requirement coverage validator (RTI=1.0 enforcement) (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [9_ROADMAP-REQ-030], [9_ROADMAP-TAS-505]

## 1. Initial Test Written
- [ ] Create tests/integration/test_rti_validator.py. The test must:
  - Build a small test DB or fixture set with 4 requirements and links such that one requirement is missing a passing test; assert that validator returns rti_value < 1.0 and lists the missing requirement.
  - Test that when all requirements are covered the validator returns success and rti_value == 1.0.

## 2. Task Implementation
- [ ] Implement src/validation/rti_validator.py with function validate_rti(threshold: float = 1.0) -> dict.
  - It must call RTICalculator to compute the numeric RTI and return a structured report: {"rti": float, "total": int, "covered": int, "uncovered": [req_id,...], "status": "pass"|"fail"}.
  - When status == "fail", validator should return HTTP-friendly error payload (if the project exposes an API) and include actionable remediation suggestions: which requirements lack passing test coverage or code linkage.
  - Provide CLI entrypoint src/cli/validate_rti.py that can be invoked as `python -m src.cli.validate_rti --threshold 1.0` and that returns exit code 0 on pass and 2 on fail.

## 3. Code Review
- [ ] Verify:
  - The validator is idempotent and does not mutate production data.
  - The CLI returns non-zero exit code on failure for CI gating.
  - Error payload includes uncovered requirement IDs and their source_location (addressing [8_RISKS-REQ-102] linkage requirement via upstream data).

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/integration/test_rti_validator.py -q

## 5. Update Documentation
- [ ] Add docs/metrics/rti_validator.md describing CLI usage, JSON schema of the report, and sample outputs for passing and failing cases.

## 6. Automated Verification
- [ ] Add scripts/verify_rti.sh that calls `python -m src.cli.validate_rti --threshold 1.0` and exits with the same status. CI will run this script to enforce RTI=1.0 on merge.
